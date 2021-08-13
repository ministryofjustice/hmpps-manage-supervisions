import { merge } from 'lodash'
import { ClassConstructor, ClassTransformOptions, plainToClass } from 'class-transformer'
import { Settings } from 'luxon'

// Put this here as most tests consume a faker factory.
// Any tests that do not consume this file & are interested in times should also set this.
Settings.defaultZone = 'Europe/London'

export type FakeFn<Faked, Options = any> = (
  partialOrPartials?: DeepPartial<Faked> | DeepPartial<Faked>[],
  options?: Options,
) => Faked

function mergePartials<Faked>(partials: DeepPartial<Faked>[]): DeepPartial<Faked> | null {
  switch (partials.length) {
    case 0:
      return null
    case 1:
      return partials[0]
    default:
      return merge(partials[0], ...partials.slice(1))
  }
}

export function fake<Faked, Options = any>(
  factory: (options?: Options, partial?: DeepPartial<Faked>) => Faked,
): FakeFn<Faked, Options> {
  return (partialOrPartials, options) => {
    const partial = Array.isArray(partialOrPartials) ? mergePartials(partialOrPartials) : partialOrPartials
    return merge(factory(options || ({} as any), partial || {}), partial)
  }
}

export function fakeClass<Faked, Options = ClassTransformOptions>(
  cls: ClassConstructor<Faked>,
  factory: (options?: Options) => DeepNonFunctionPartial<Faked>,
  defaultOptions?: ClassTransformOptions,
): FakeFn<Faked> {
  return (partial, options) => plainToClass(cls, merge(factory(options), partial), { ...options, ...defaultOptions })
}
