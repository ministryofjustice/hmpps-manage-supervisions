import { CallHandler, ExecutionContext } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { Request, Response } from 'express'
import { createStubInstance } from 'sinon'
import { of } from 'rxjs'
import { DeepPartial } from '../app.types'

export const FAKE_HANDLER = 'handler'
export const FAKE_CLASS = 'cls'

class FakeHttpArgumentsHost implements HttpArgumentsHost {
  constructor(private readonly options: FakeExecutionContextOptions) {}

  getNext() {
    return (() => {
      // do nothing
    }) as any
  }

  getRequest() {
    return this.options.request as any
  }

  getResponse() {
    return this.options.response as any
  }
}

export interface FakeExecutionContextOptions {
  request?: DeepPartial<Request>
  response?: DeepPartial<Response>
}

export function fakeExecutionContext({ request = {}, response = {} }: FakeExecutionContextOptions): ExecutionContext {
  const context = createStubInstance(ExecutionContextHost)
  context.switchToHttp.returns(new FakeHttpArgumentsHost({ request, response }))
  context.getHandler.returns(FAKE_HANDLER as any)
  context.getClass.returns(FAKE_CLASS as any)
  return context as ExecutionContext
}

class FakeCallHandler implements CallHandler {
  constructor(private readonly next: any) {}

  handle() {
    return of(this.next)
  }
}

export function fakeCallHandler(next: any = {}): CallHandler {
  return new FakeCallHandler(next)
}
