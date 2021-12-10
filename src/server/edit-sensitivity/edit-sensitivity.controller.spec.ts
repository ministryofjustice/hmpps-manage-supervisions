import { Test, TestingModule } from '@nestjs/testing'
import { EditSensitivityController } from './edit-sensitivity.controller'

describe('UpdateSensitivityController', () => {
  let controller: EditSensitivityController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditSensitivityController],
    }).compile()

    controller = module.get<EditSensitivityController>(EditSensitivityController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
