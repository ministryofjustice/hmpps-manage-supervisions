import { DynamicModule, Module } from '@nestjs/common'
import MockAdapter from 'axios-mock-adapter'
import { createStubInstance } from 'sinon'
import { AuthenticationMethod, RestService } from './rest.service'
import { DependentApisConfig } from '../../config'
import Axios from 'axios'

@Module({})
export class MockRestModule {
  static register(
    configurations: { name: keyof DependentApisConfig; user: User; authMethod?: AuthenticationMethod }[],
  ): DynamicModule {
    const client = Axios.create()
    const mock = new MockAdapter(client)
    const service = createStubInstance(RestService)

    configurations.forEach(config => {
      if (config.authMethod !== undefined) {
        service.build.withArgs(config.name, config.user, config.authMethod).returns(client)
      } else {
        service.build.withArgs(config.name, config.user).returns(client)
      }
    })

    return {
      module: MockRestModule,
      providers: [
        { provide: MockRestModule.CLIENT, useValue: mock },
        { provide: RestService, useValue: service },
      ],
      exports: [MockRestModule.CLIENT, RestService],
    }
  }

  static CLIENT = Symbol.for('MOCK_REST_CLIENT')
}
