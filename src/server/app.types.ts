import { DateTime } from 'luxon'

type DateTypes = Date | DateTime

/**
 * Determines whether the specified type T1 is equal to the specified type T2 and return type True if it does and False otherwise.
 * See: https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
 */
type IfEquals<T1, T2, True, False> = (<T>() => T extends T1 ? 1 : 2) extends <T>() => T extends T2 ? 1 : 2
  ? True
  : False

/**
 * Selects a list of all non-functional, writeable properties.
 * See: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types
 */
type NonFunctionWriteablePropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K, never>
}[keyof T]

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[P] extends DateTypes
    ? T[P]
    : DeepPartial<T[P]>
}

/**
 * Same as DeepPartial<T> but flattens some types out into their json representations e.g. Dates.
 */
export type FlatDeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<FlatDeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<FlatDeepPartial<U>>
    : T[P] extends DateTypes
    ? string
    : FlatDeepPartial<T[P]>
}

/**
 * Removes all instance functions & readonly properties from the specified type.
 */
export type NonFunctionPartial<T> = Pick<T, NonFunctionWriteablePropertyNames<T>>

/**
 * Deeply removes all instance functions & readonly properties from the specified type.
 */
export type DeepNonFunctionPartial<T> = T extends object
  ? {
      [P in keyof NonFunctionPartial<T>]: T[P] extends Array<infer U>
        ? Array<DeepNonFunctionPartial<U>>
        : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepNonFunctionPartial<U>>
        : DeepNonFunctionPartial<T[P]>
    }
  : T

/**
 * Strips all readonly modifiers from the specified type.
 * This is useful for the open-api models who for some reason use readonly everywhere.
 */
export type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}
