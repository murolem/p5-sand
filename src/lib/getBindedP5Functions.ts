import p5 from 'p5';
import { P5InstanceFunctions, AnyFunction } from '../types';
import { getAllPropNames } from './getAllPropNames';

/**
 * Retrieves all p5 instance functions and binds them to the p5 instance.
 * 
 * Allows to use the functions outside of the p5 instance with the context of that p5 instance still attached.
 * 
 * Todo validate that all the functions are there, e.g. with zod by defining the functions.
 * todo check for getters - they seem to be considired functions, binding will have no effect on them
 * since their value is retrieved when accessed.
 * 
 * @param p5Instance The instance to proccess.
 * @returns A record containing all the found functions.
 */
export function getBindedP5Functions(p5Instance: p5): P5InstanceFunctions {
    const fns: Record<PropertyKey, AnyFunction> = {};

    for (const key of getAllPropNames(p5Instance as any)) {
        const value: unknown = (p5Instance as any)[key];
        if (typeof value === 'function') {
            fns[key] = value.bind(p5Instance);
        }
    }

    return fns as P5InstanceFunctions;
}