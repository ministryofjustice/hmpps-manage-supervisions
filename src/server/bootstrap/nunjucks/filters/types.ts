import { Environment } from 'nunjucks'

export abstract class NunjucksFilter {
  public constructor(protected readonly environment: Environment) {}

  abstract filter(...args: any[]): any
  async?: boolean
}
