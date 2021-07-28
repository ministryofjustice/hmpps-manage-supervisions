import * as Listr from 'listr'
import { SeedContext, SeedFn, SeedModule, SeedPrimitive } from './types'
import { WiremockClient } from './wiremock-client'

function isModule(x: SeedPrimitive): x is SeedModule {
  return typeof x === 'object' && 'title' in x
}

type ListrTaskFn = Listr.ListrTask<any>['task']

function toListr(context: SeedContext, { title, body }: SeedModule): Listr.ListrTask {
  function task(task: ListrTaskFn) {
    return { title, task }
  }

  if (body.length === 0) {
    return task(() => {
      // No task body, nothing to see here
    })
  }

  const subModules: SeedModule[] = []
  const subTasks: SeedFn[] = []
  for (const sub of body) {
    if (isModule(sub)) {
      subModules.push(sub)
    } else {
      subTasks.push(sub)
    }
  }

  const results = subModules.map(x => toListr(context, x))
  if (subTasks.length) {
    const collapsedSubTasks = task(async () => await Promise.all(subTasks.map(fn => fn(context))))
    results.push(collapsedSubTasks)
  }

  if (subModules.length === 0) {
    return results[0]
  }

  return task(() => new Listr(results))
}

export async function wiremocker(modules: SeedModule[], { silent = false }: { silent?: boolean } = {}): Promise<void> {
  const context: SeedContext = {
    client: new WiremockClient(),
  }

  try {
    return await new Listr(
      modules.map(x => toListr(context, x)),
      {
        collapse: false,
        renderer: silent ? 'silent' : 'default',
      } as any,
    ).run()
  } finally {
    if (!silent) {
      console.log('\nWiremocking complete  🎉')
      const stubs = await context.client.getAllStubs()
      for (const stub of stubs) {
        console.log(stub)
      }
    }
  }
}
