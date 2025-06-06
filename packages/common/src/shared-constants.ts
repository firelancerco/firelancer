/*
 * This file contains constants which are shared between more than one sub-module.
 */
export const API_PORT = 3000;
export const ADMIN_API_PATH = 'admin-api';
export const SHOP_API_PATH = 'shop-api';
export const SUPER_ADMIN_USER_IDENTIFIER = 'superadmin';
export const SUPER_ADMIN_USER_PASSWORD = 'superadmin';
export const SUPER_ADMIN_ROLE_CODE = '__super_admin_role__';
export const SUPER_ADMIN_ROLE_DESCRIPTION = 'SuperAdmin';
export const CUSTOMER_ROLE_CODE = '__customer_role__';
export const CUSTOMER_ROLE_DESCRIPTION = 'Customer';

export const DEFAULT_AUTH_TOKEN_HEADER_KEY = 'firelancer-auth-token';
export const DEFAULT_COOKIE_NAME = 'session';

export const ROOT_COLLECTION_NAME = '__root_collection__';

export const SKILL_FACET_CODE = '__skill_facet__';
export const CATEGORY_FACET_CODE = '__category_facet__';
export const DURATION_FACET_CODE = '__duration_facet__';
export const EXPERIENCE_LEVEL_FACET_CODE = '__experience_level_facet__';
export const SCOPE_FACET_CODE = '__scope_facet__';

export const PUBLISH_JOB_POST_CONSTRAINTS_MIN_SKILLS = 3;
export const PUBLISH_JOB_POST_CONSTRAINTS_MAX_SKILLS = 15;
export const PUBLISH_JOB_POST_CONSTRAINTS_MIN_BUDGET = 5;

export const MAX_ASSETS_ARRAY_SIZE = 15;
export const MIN_ASSETS_ARRAY_SIZE = 0;

export const MAX_FACETS_ARRAY_SIZE = 30;
export const MIN_FACETS_ARRAY_SIZE = 3;
