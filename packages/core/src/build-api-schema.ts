import { notNullOrUndefined } from '@firelancerco/common/lib/shared-utils';
import { existsSync, mkdirSync, writeFileSync } from 'fs-extra';
import { dirname, resolve } from 'path';
import { Project, SourceFile, SyntaxKind } from 'ts-morph';

import { preBootstrapConfig } from './bootstrap';
import { AuthenticationStrategy, FirelancerConfig } from './config';
import { getPluginAPIExtensions } from './plugin/plugin-metadata';

const project = new Project();
const sharedSchemaPath = resolve(__dirname, './common/shared-schema.d.ts');

export type BuildApiSchemaOptions = {
    apiType: 'shop' | 'admin';
    sourceSchemaPaths?: string[];
    outputSchemaPath: string;
};

export async function buildApiSchema(userConfig: Partial<FirelancerConfig>, options: BuildApiSchemaOptions) {
    try {
        const config = await preBootstrapConfig(userConfig);
        const { apiType, sourceSchemaPaths = [], outputSchemaPath } = options;

        const authStrategies =
            apiType === 'shop'
                ? config?.authOptions?.shopAuthenticationStrategy
                : config?.authOptions?.adminAuthenticationStrategy;

        const pluginSchemaPaths = config.plugins
            ? getPluginAPIExtensions(config.plugins, apiType)
                  .map(e => (typeof e.schemaPath === 'function' ? e.schemaPath() : e.schemaPath))
                  .filter(notNullOrUndefined)
            : [];

        const schemaPaths = [sharedSchemaPath, ...sourceSchemaPaths, ...pluginSchemaPaths];

        const processedFiles = schemaPaths.map(processSourceFile);

        const mergedFile = project.createSourceFile('merged-schema.ts', '', { overwrite: true });
        processedFiles.forEach(file =>
            file.getStatements().forEach(stmt => mergedFile.addStatements([stmt.getText()])),
        );

        if (authStrategies?.length) {
            generateAuthenticationTypes(mergedFile, authStrategies);
        }

        writeOutputFile(outputSchemaPath, mergedFile.getFullText());
    } catch (error) {
        handleError('Failed to build API schema', error);
        process.exit(1);
    }
}

function generateAuthenticationTypes(file: SourceFile, strategies: AuthenticationStrategy[]) {
    const authInput = file.getClass('AuthenticationInput');
    if (!authInput) {
        throw new Error('Missing class declaration: AuthenticationInput');
    }

    for (const strategy of strategies) {
        if (!authInput.getProperty(strategy.name)) {
            authInput.addProperty({
                name: strategy.name,
                type: strategy.getInputType(),
                hasQuestionToken: true,
            });
        }
    }
}

function processSourceFile(filePath: string): SourceFile {
    if (!existsSync(filePath)) {
        throw new Error(`Source file not found: ${filePath}`);
    }

    const file = project.addSourceFileAtPath(filePath);
    removeImports(file);
    removeRequires(file);
    removeDecorators(file);
    removeDeclareKeywords(file);

    return file;
}

function removeDeclareKeywords(file: SourceFile) {
    // Find all declarations that might have 'declare' keyword
    const nodeTypes = [
        SyntaxKind.ClassDeclaration,
        SyntaxKind.InterfaceDeclaration,
        SyntaxKind.EnumDeclaration,
        SyntaxKind.TypeAliasDeclaration,
        SyntaxKind.FunctionDeclaration,
        SyntaxKind.VariableStatement,
    ];

    nodeTypes.forEach(kind => {
        const nodes = file.getDescendantsOfKind(kind);
        nodes.forEach(node => {
            // Check if the node has the hasDeclareKeyword method
            if ('hasDeclareKeyword' in node && typeof node.hasDeclareKeyword === 'function') {
                // If it has declare keyword, remove it
                if (node.hasDeclareKeyword()) {
                    node.setHasDeclareKeyword(false);
                }
            } else if (kind === SyntaxKind.VariableStatement) {
                // For variable statements, we need to check the declaration list
                const varStatement = node as any;
                if (varStatement.getDeclarationList && typeof varStatement.getDeclarationList === 'function') {
                    const declList = varStatement.getDeclarationList();
                    if (declList && declList.hasDeclareKeyword && declList.hasDeclareKeyword()) {
                        declList.setHasDeclareKeyword(false);
                    }
                }
            }
        });
    });
}

function removeImports(file: SourceFile) {
    file.getImportDeclarations().forEach(imp => imp.remove());
}

function removeRequires(file: SourceFile) {
    file.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
        const expr = call.getExpression();
        if (expr.getKind() === SyntaxKind.Identifier && expr.getText() === 'require') {
            call.getFirstAncestorByKind(SyntaxKind.VariableStatement)?.remove() ??
                call.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)?.remove();
        }
    });
}

function removeDecorators(file: SourceFile) {
    file.getDescendantsOfKind(SyntaxKind.Decorator).forEach(decorator => decorator.remove());
}

function ensureDirectoryExists(filePath: string) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

function writeOutputFile(path: string, content: string) {
    try {
        ensureDirectoryExists(path);
        const finalContent = `/* eslint-disable */\n${content}`;
        writeFileSync(path, finalContent, 'utf8');
        console.log(`✅ Clean schema written to: ${path}`);
    } catch (error) {
        throw new Error(
            `Failed to write output file "${path}": ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

function handleError(context: string, error: unknown) {
    console.error(`❌ ${context}:`, error instanceof Error ? error.message : error);
}
