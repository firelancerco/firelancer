import z from 'zod';

import { getAllPermissionsMetadata } from '../../../common/constants';
import { getConfig } from '../../../config/config-helpers';

const { authOptions } = getConfig();

export const Money = z.number().int().positive();
export const SortOrder = z.enum(['ASC', 'DESC']);
export const LogicalOperator = z.enum(['AND', 'OR']);
export const Permission = z.enum(
    getAllPermissionsMetadata(authOptions.customPermissions).map(p => p.name) as [string, ...string[]],
);
