import { cloneDeep, merge, mergeWith } from 'lodash'
import { ClassConstructor, ClassTransformOptions, plainToClass } from 'class-transformer'
import { Settings } from 'luxon'
import * as faker from 'faker'
import { DeepNonFunctionPartial, DeepPartial } from '../app.types'
import { ValidationError } from 'class-validator'

// Put this here as most tests consume a faker factory.
// Any tests that do not consume this file & are interested in times should also set this.
Settings.defaultZone = 'Europe/London'

export type FakeFn<Faked, Options = any> = (
  partialOrPartials?: DeepPartial<Faked> | DeepPartial<Faked>[],
  options?: Options,
) => Faked

/**
 * The lodash merge function is too safe for merging partials, where we want all properties,
 * including arrays to be strictly overridden.
 */
function mergePartials<T>(...items: T[]): T | null {
  const truthyItems = items.filter(x => x)
  switch (truthyItems.length) {
    case 0:
      return {} as T
    case 1:
      return truthyItems[0]
    default:
      return mergeWith({} as T, ...truthyItems, (x, y) => {
        if (Array.isArray(x)) {
          return y || x
        }
      })
  }
}

function unwrapPartial<Faked>(partialOrPartials?: DeepPartial<Faked> | DeepPartial<Faked>[]): DeepPartial<Faked> {
  return Array.isArray(partialOrPartials)
    ? mergePartials(...partialOrPartials)
    : partialOrPartials
    ? cloneDeep(partialOrPartials)
    : {}
}

export function fake<Faked, Options = any>(
  factory: (options?: Options, partial?: DeepPartial<Faked>) => Faked,
): FakeFn<Faked, Options> {
  return (partialOrPartials, options) => {
    // passing the fake function by function reference in an array map will assign the array index to options
    if (typeof options !== 'object') {
      options = {} as any
    }
    const partial = unwrapPartial(partialOrPartials)
    const fake = factory(options, partial)
    return merge(fake, partial as Faked)
  }
}

export function fakeClass<Faked, Options = ClassTransformOptions>(
  cls: ClassConstructor<Faked>,
  factory: (options?: Options, partial?: DeepPartial<Faked>) => DeepNonFunctionPartial<Faked>,
  defaultOptions?: ClassTransformOptions,
): FakeFn<Faked, Options> {
  return (partialOrPartials, options) => {
    // passing the fake function by function reference in an array map will assign the array index to options
    if (typeof options !== 'object') {
      options = {} as any
    }
    const partial = unwrapPartial(partialOrPartials)
    const fake = factory(options, partial)
    return plainToClass(cls, merge(fake, partial), { ...defaultOptions, ...options })
  }
}

export function fakeEnum<Enum>(cls: Enum): Enum[keyof Enum] {
  return faker.random.arrayElement(Object.values(cls))
}

export function fakeRandomArray<T>(factory: () => T, options: { min: number; max: number } = { min: 1, max: 3 }): T[] {
  const length = faker.datatype.number(options)
  return [...Array(length)].map(() => factory())
}

export const fakeValidationError = fake<ValidationError>(() => ({
  property: 'some-property',
  constraints: {
    'some-constraint': 'Some error',
  },
  contexts: {},
  value: faker.company.bs(),
}))
