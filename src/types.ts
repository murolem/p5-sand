import p5 from 'p5';

export type AnyFunction = (...args: any) => any;

export type RecordWithPropertiesOnlyOfType<T extends any, V> = {
    [Key in keyof T as T[Key] extends V ? Key : never]: T[Key]
}

export type P5InstanceFunctions = RecordWithPropertiesOnlyOfType<p5, AnyFunction>;