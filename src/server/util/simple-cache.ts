import * as NodeCache from 'node-cache'

export class SimpleCache<T = any> {
  private readonly cache: NodeCache

  constructor(options: NodeCache.Options = {}) {
    this.cache = new NodeCache({ useClones: false, ...options })
  }

  get(key: string) {
    return this.cache.get<T>(key)
  }

  set(key: string, value: T) {
    this.cache.set(key, value)
  }

  getOrSet(key: string, factory: () => T): T {
    const cached = this.get(key)
    if (cached) {
      return cached
    }
    const value = factory()
    this.set(key, value)
    return value
  }
}
