import { Test, TestingModule } from '@nestjs/testing'
import { EditSensitivityService } from './edit-sensitivity.service'

describe('EditSensitivityService', () => {
  let service: EditSensitivityService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditSensitivityService],
    }).compile()

    service = module.get<EditSensitivityService>(EditSensitivityService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
