import z from 'zod';
import { Project, SyntaxKind, TypeNode, UnionTypeNode, SourceFile } from 'ts-morph';

const { ZodToTypescript } = require('@duplojs/zod-to-typescript');

// Generate and process schemas, return formatted TypeScript output
export function zodSchemasToTs(schemas: Record<string, z.ZodTypeAny>): string {
    const ztt = new ZodToTypescript();

    for (const [schemaName, schema] of Object.entries(schemas)) {
        ztt.append(schema, schemaName);
    }
    return processTypeAliases(ztt.toString());
}

// Use ts-morph to convert string union types to enums
function processTypeAliases(text: string): string {
    const project = new Project();
    const virtualSourceFile = project.createSourceFile('virtual-schemas.ts', text);
    const outputFile = project.createSourceFile('real-output.ts', '', { overwrite: true });

    const typeAliases = virtualSourceFile.getTypeAliases();

    for (const typeAlias of typeAliases) {
        const name = typeAlias.getName();
        const typeNode = typeAlias.getTypeNode();

        if (typeNode && isStringLiteralUnion(typeNode)) {
            convertUnionToEnum(typeNode as UnionTypeNode, name, outputFile);
        } else if (typeNode) {
            copyTypeAliasToOutput(typeNode, name, outputFile);
        }
    }

    return outputFile.getFullText();
}

// Check if the type node is a union of string literals
function isStringLiteralUnion(typeNode: TypeNode): typeNode is UnionTypeNode {
    return (
        typeNode.getKind() === SyntaxKind.UnionType &&
        (typeNode as UnionTypeNode)
            .getTypeNodes()
            .every(t => t.getKind() === SyntaxKind.LiteralType && t.getFirstDescendantByKind(SyntaxKind.StringLiteral))
    );
}

// Convert a union of string literals to an enum
function convertUnionToEnum(typeNode: UnionTypeNode, name: string, outputFile: SourceFile): void {
    const types = typeNode.getTypeNodes();

    const enumDeclaration = outputFile.addEnum({
        name,
        isExported: true,
    });

    for (const type of types) {
        const stringLiteral = type.getFirstDescendantByKind(SyntaxKind.StringLiteral);
        if (stringLiteral) {
            const value = stringLiteral.getLiteralValue();
            const sanitizedName = value.replace(/[^a-zA-Z0-9_]/g, '_');

            enumDeclaration.addMember({
                name: sanitizedName,
                value,
            });
        }
    }
}

// Copy the type alias as-is to the output file
function copyTypeAliasToOutput(typeNode: TypeNode, name: string, outputFile: SourceFile): void {
    outputFile.addTypeAlias({
        name,
        type: typeNode.getText(),
        isExported: true,
    });
}
