import type { RegisteredId } from "../../typings";

export function hasDynamicParams(id: string): boolean {
    return !!id.match(/\[.+?\]/g)?.length;
}

/**
 * Checks the provided id against all registered ids.
 */
export function isRegisteredId(registeredIds: RegisteredId[], id: string): {
    result: boolean,
    params?: { [key: string]: string; };
} {
    // The id is found directly in registeredIds,
    // which means that it has no dynamic parameters
    // and is valid, so return true.
    if (registeredIds.some(registeredId => registeredId.id === id)) return { result: true };

    for (const { params, regexp } of registeredIds) {
        if (!regexp || !params) continue;
        if (!regexp.test(id)) continue;

        const match = regexp.exec(id);
        const values: { [key: string]: string; } = {};

        for (const param of params) {
            values[param] = match![params.indexOf(param) + 1];
        }

        return { result: true, params: values };
    }

    return { result: false };
};

/**
 * Parses the id and returns `RegisteredId`.
 *
 * If id has dynamic parameters,
 * saves the parameter names and constructs a unique regexp for that id.
 *
 * If multiple parameters have the same name, returns an Error
 */
export function registerId(id: string): Error | RegisteredId {
    if (!hasDynamicParams(id)) {
        return { id, params: null, regexp: null };
    }

    const regexp = new RegExp('^' + id.replace(/\[.+?\]/g, `(.+)`));
    const params = id.match(/(?<=\[).+?(?=\])/g);

    // If the id has multiple params with the same name
    // Return an error
    if (params && new Set(params).size !== params.length)
        return new Error('every parameter must be unique');

    return { id, params, regexp };
};
