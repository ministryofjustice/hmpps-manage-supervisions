import { DynamicModule, Module } from '@nestjs/common'
import { createStubInstance } from 'sinon'
import { AuthenticationMethod, RestService } from './rest.service'
import { DependentApisConfig } from '../../config'
import { RestClient } from './rest-client'

@Module({})
export class MockRestModule {
  static register(name: keyof DependentApisConfig, user: User, authMethod?: AuthenticationMethod): DynamicModule {
    const client = createStubInstance(RestClient)
    const service = createStubInstance(RestService)

    if (authMethod !== undefined) {
      service.build.withArgs(name, user, authMethod).resolves(client as any)
    } else {
      service.build.withArgs(name, user).resolves(client as any)
    }

    return {
      module: MockRestModule,
      providers: [
        { provide: MockRestModule.CLIENT, useValue: client },
        { provide: RestService, useValue: service },
      ],
      exports: [MockRestModule.CLIENT, RestService],
    }
  }

  static CLIENT = Symbol.for('MOCK_REST_CLIENT')
}
