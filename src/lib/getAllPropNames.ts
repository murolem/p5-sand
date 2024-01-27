/**
 * Returns all property names of `obj`, including those on the prototype chain.
 * 
 * Thanks to someone on SO!
 * 
 * @param obj Object to check the props of.
 * @returns The names of all props, including those on the prototype chain.
 */
export function getAllPropNames(obj: Record<PropertyKey, unknown>): string[] {
    const allPropNames = new Set<string>();
    let currentObj = obj;
    do {
        const propNames = Object.getOwnPropertyNames(currentObj);
        for (const key of propNames) {
            allPropNames.add(key);
        }
    } while (currentObj = Object.getPrototypeOf(currentObj))

    return [...allPropNames];
}