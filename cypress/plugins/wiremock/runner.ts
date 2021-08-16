import { SeedContext, SeedFn, SeedModule, SeedPrimitive } from './types'
import { WiremockClient, WiremockClientOptions } from './wiremock-client'

function isModule(x: SeedPrimitive): x is SeedModule {
  return typeof x === 'object' && 'title' in x
}

export interface WiremockerOptions extends WiremockClientOptions {
  silent?: boolean
}

export async function wiremocker(modules: SeedModule[], { silent, ...options }: WiremockerOptions = {}): Promise<void> {
  const context: SeedContext = {
    client: new WiremockClient(options),
  }

  const functions: SeedFn[] = []
  const toVisit = [...modules].reverse()
  while (toVisit.length) {
    const next = toVisit.pop()
    for (const primitive of next.body) {
      if (isModule(primitive)) {
        toVisit.push(primitive)
      } else {
        functions.push(primitive)
      }
    }
  }

  await Promise.all(functions.map(fn => fn(context)))
  await context.client.commit()

  if (!silent) {
    console.log('\nWiremocking complete  🎉')
    const stubs = await context.client.getAllStubs()
    for (const stub of stubs) {
      console.log(stub)
    }
  }
}
