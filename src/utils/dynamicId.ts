import type { IdStore } from "../../typings";

export function hasDynamicParams(id: string): boolean {
    return !!id.match(/\[.+?\]/g)?.length;
}

/**
 * Checks the provided id against all registered ids.
 */
export function isRegisteredId(idData: IdStore, id: string): {
    result: true,
    params: { [key: string]: string; };
} | { result: false; } {
    const { customId, params, regexp } = idData

    // The id is found directly in registeredIds,
    // which means that it has no dynamic parameters
    // and is valid, so return true.
    if (customId === id) return { result: true, params: {} };
    if (!regexp || !params || !regexp.test(id)) return { result: false };

    const match = regexp.exec(id);
    const values: { [key: string]: string; } = {};

    for (const param of params) {
        values[param] = match![params.indexOf(param) + 1];
    }

    return { result: true, params: values };
};

/**
 * Parses the id and returns `IdStore`.
 *
 * If id has dynamic parameters,
 * saves the parameter names and constructs a unique regexp for that id.
 *
 * If multiple parameters have the same name, returns an Error
 */
export function registerId(id: string): Error | IdStore {
    if (!hasDynamicParams(id)) {
        return { customId: id, params: null, regexp: null };
    }

    const regexp = new RegExp('^' + id.replace(/\[.+?\]/g, `(.+)`));
    const params = id.match(/(?<=\[).+?(?=\])/g);

    // If the id has multiple params with the same name
    // Return an error
    if (params && new Set(params).size !== params.length)
        return new Error('every parameter must be unique');

    return { customId: id, params, regexp };
};
