/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @description
 * A constant which holds the current version of the Firelancer core. You can use
 * this when your code needs to know the version of Firelancer which is running.
 *
 * @example
 * ```ts
 * import { FIRELANCER_VERSION } from '\@firelancerco/core';
 *
 * console.log('Firelancer version:', FIRELANCER_VERSION);
 * ```
 */
export const FIRELANCER_VERSION: string = require('../package.json').version;
