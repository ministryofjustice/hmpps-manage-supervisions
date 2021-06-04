import { merge } from 'lodash'
import { ClassConstructor, ClassTransformOptions, plainToClass } from 'class-transformer'

export type FakeFn<Faked, Options = any> = (partial?: DeepPartial<Faked>, options?: Options) => Faked

export function fake<Faked, Options = any>(
  factory: (options?: Options, partial?: DeepPartial<Faked>) => Faked,
): FakeFn<Faked, Options> {
  return (partial, options) => merge(factory(options || ({} as any), partial || {}), partial)
}

export function fakeClass<Faked, Options = ClassTransformOptions>(
  cls: ClassConstructor<Faked>,
  factory: (options?: Options) => DeepNonFunctionPartial<Faked>,
  defaultOptions?: ClassTransformOptions,
): FakeFn<Faked> {
  return (partial, options) => plainToClass(cls, merge(factory(options), partial), { ...options, ...defaultOptions })
}
