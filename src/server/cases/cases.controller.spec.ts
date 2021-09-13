import { Test, TestingModule } from '@nestjs/testing'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { CasesController } from './cases.controller'
import { CasesService } from './cases.service'

describe('CasesController', () => {
  let controller: CasesController
  let casesService: SinonStubbedInstance<CasesService>

  beforeEach(async () => {
    casesService = createStubInstance(CasesService)

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasesController],
      providers: [{ provide: CasesService, useValue: casesService }],
    }).compile()

    controller = module.get<CasesController>(CasesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
