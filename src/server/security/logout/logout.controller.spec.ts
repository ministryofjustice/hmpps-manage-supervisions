import { Test, TestingModule } from '@nestjs/testing'
import { LogoutController } from './logout.controller'
import { mocked } from 'ts-jest/utils'
import { ConfigService } from '@nestjs/config'

describe('LogoutController', () => {
  let controller: LogoutController

  beforeEach(async () => {
    const config = mocked(ConfigService)
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ConfigService, useValue: config }],
      controllers: [LogoutController],
    }).compile()

    controller = module.get<LogoutController>(LogoutController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
