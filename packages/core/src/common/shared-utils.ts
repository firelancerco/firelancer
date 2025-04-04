/**
 * Converts a filter object to a query string format
 * @param filter The filter object to convert
 * @returns Query string with the filter parameters
 */
export function filterToQueryString(filter: Record<string, any>): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filter)) {
        if (value === null || value === undefined) continue;

        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            // Handle nested objects like sort and filter
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
                if (typeof nestedValue === 'object' && !Array.isArray(nestedValue) && nestedValue !== null) {
                    for (const [deepKey, deepValue] of Object.entries(nestedValue)) {
                        params.append(`${key}[${nestedKey}][${deepKey}]`, String(deepValue));
                    }
                } else {
                    params.append(`${key}[${nestedKey}]`, String(nestedValue));
                }
            }
        } else {
            params.append(key, String(value));
        }
    }

    return params.toString();
}
