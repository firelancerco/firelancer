import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile, SyntaxKind } from 'ts-morph';

const PATHS = {
    source: path.resolve(__dirname, '../packages/core/src/common/shared-schema.ts'),
    output: path.resolve(__dirname, '../packages/common/src/shared-schema.ts'),
};

const project = new Project();

function ensureDirectoryExists(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function removeImports(sourceFile: SourceFile) {
    sourceFile.getImportDeclarations().forEach(importDecl => importDecl.remove());
}

function removeRequires(sourceFile: SourceFile) {
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(callExpr => {
        const expr = callExpr.getExpression();
        if (expr.getKind() === SyntaxKind.Identifier && expr.getText() === 'require') {
            const parent =
                callExpr.getFirstAncestorByKind(SyntaxKind.VariableStatement) ||
                callExpr.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
            parent?.remove();
        }
    });
}

function removeDecorators(sourceFile: SourceFile) {
    sourceFile.getDescendantsOfKind(SyntaxKind.Decorator).forEach(decorator => decorator.remove());
}

function processSourceFile() {
    if (!fs.existsSync(PATHS.source)) {
        throw new Error(`Source file not found: ${PATHS.source}`);
    }

    const sourceFile = project.addSourceFileAtPath(PATHS.source);

    removeImports(sourceFile);
    removeRequires(sourceFile);
    removeDecorators(sourceFile);

    return sourceFile.getText();
}

function writeOutput(content: string) {
    try {
        ensureDirectoryExists(PATHS.output);
        content = `/* eslint-disable */\n${content}`;
        fs.writeFileSync(PATHS.output, content, 'utf8');
        console.log(`Clean schema definitions successfully written to:\n${PATHS.output}`);
    } catch (error) {
        console.error('Failed to write output file:', error instanceof Error ? error.message : 'unknown error');
        process.exit(1);
    }
}

function main() {
    try {
        console.log('Starting schema processing...');
        const cleanedContent = processSourceFile();
        writeOutput(cleanedContent);
    } catch (error) {
        console.error('Processing failed:', error instanceof Error ? error.message : 'unknown error');
        process.exit(1);
    }
}

main();
