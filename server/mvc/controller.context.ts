import { ControllerMeta } from './types'

export class ControllerContext {
  static readonly value: ControllerMeta[] = []

  static register(meta: ControllerMeta) {
    this.value.push(meta)
  }
}
