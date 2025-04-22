import z from 'zod';

export const Money = z.number().int().positive();
export const SortOrder = z.enum(['ASC', 'DESC']);
export const LogicalOperator = z.enum(['AND', 'OR']);
export const Permission = z.enum([
    'Authenticated',
    'CreateAdministrator',
    'CreateAsset',
    'CreateCustomer',
    'CreateJobPost',
    'CreateFacet',
    'DeleteAdministrator',
    'DeleteAsset',
    'DeleteCustomer',
    'DeleteJobPost',
    'DeleteFacet',
    'Owner',
    'Public',
    'ReadAdministrator',
    'ReadAsset',
    'ReadCustomer',
    'ReadJobPost',
    'ReadFacet',
    'SuperAdmin',
    'UpdateAdministrator',
    'UpdateAsset',
    'UpdateCustomer',
    'UpdateJobPost',
    'UpdateFacet',
    'PublishJobPost',
]);
