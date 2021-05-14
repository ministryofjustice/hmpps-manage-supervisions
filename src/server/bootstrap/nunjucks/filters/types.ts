export interface NunjucksFilter {
  filter(...args: any[]): any
  async?: boolean
}
