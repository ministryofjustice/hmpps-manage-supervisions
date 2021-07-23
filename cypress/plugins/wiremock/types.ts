import { WiremockClient } from './wiremock-client'

export interface SeedContext {
  client: WiremockClient
}

export type SeedFn = (context: SeedContext) => void | Promise<void>

export type SeedPrimitive = SeedModule | SeedFn

export interface SeedModule {
  title: string
  body: SeedPrimitive[]
}

export interface SeedModuleOptions {
  title: string
}

export function seedModule(options: SeedModuleOptions, ...body: SeedPrimitive[]): SeedModule {
  return { ...options, body }
}
