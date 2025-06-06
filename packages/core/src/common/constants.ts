import { LanguageCode } from '@firelancerco/common/lib/generated-schema';
import { CrudPermissionDefinition, PermissionDefinition, PermissionMetadata } from './permission-definition';

/**
 * This value should be rarely used - only in those contexts where we have no access to the
 * FirelancerConfig to ensure at least a valid LanguageCode is available.
 */
export const DEFAULT_LANGUAGE_CODE = LanguageCode.en;
export const TRANSACTION_MANAGER_KEY = Symbol('TRANSACTION_MANAGER');
export const REQUEST_CONTEXT_KEY = 'firelancerRequestContext';
export const REQUEST_CONTEXT_MAP_KEY = 'firelancerRequestContextMap';

export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
    new PermissionDefinition({
        name: 'Authenticated',
        description: 'Authenticated means simply that the user is logged in',
        assignable: true,
        internal: true,
    }),
    new PermissionDefinition({
        name: 'SuperAdmin',
        description: 'SuperAdmin has unrestricted access to all operations',
        assignable: true,
        internal: true,
    }),
    new PermissionDefinition({
        name: 'Owner',
        description: "Owner means the user owns this entity, e.g. a Customer's own Order",
        assignable: false,
        internal: true,
    }),
    new PermissionDefinition({
        name: 'Public',
        description: 'Public means any unauthenticated user may perform the operation',
        assignable: false,
        internal: true,
    }),
    new CrudPermissionDefinition('Administrator'),
    new CrudPermissionDefinition('Customer'),
    new CrudPermissionDefinition('JobPost'),
    new CrudPermissionDefinition('Asset'),
    new CrudPermissionDefinition('Facet'),
];

export function getAllPermissionsMetadata(customPermissions: PermissionDefinition[]): PermissionMetadata[] {
    const allPermissions = [...DEFAULT_PERMISSIONS, ...customPermissions];
    return allPermissions.reduce((all, def) => [...all, ...def.getMetadata()], [] as PermissionMetadata[]);
}
