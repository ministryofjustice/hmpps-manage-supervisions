import { FeaturesEnabledGuard } from './features-enabled.guard'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { Reflector } from '@nestjs/core'
import { FakeConfigModule } from '../../config/config.fake'
import { Test } from '@nestjs/testing'
import { FAKE_CLASS, FAKE_HANDLER, fakeExecutionContext } from '../../util/nest.fake'
import { FEATURES_ENABLED } from './features-enabled.decorator'
import { FeaturesNotEnabledError } from './features-enabled.types'

describe('FeaturesEnabledGuard', () => {
  let subject: FeaturesEnabledGuard
  let reflector: SinonStubbedInstance<Reflector>
  const context = fakeExecutionContext({})

  beforeAll(async () => {
    reflector = createStubInstance(Reflector)
    const module = await Test.createTestingModule({
      providers: [FeaturesEnabledGuard, { provide: Reflector, useValue: reflector }],
      imports: [
        FakeConfigModule.register({
          server: { features: { ['some-feature']: true, ['some-other-feature']: false } as any },
        }),
      ],
    }).compile()

    subject = module.get(FeaturesEnabledGuard)
  })

  function havingRequiredFeatures(...features: string[]) {
    reflector.getAllAndOverride
      .withArgs(FEATURES_ENABLED, match.array.deepEquals([FAKE_HANDLER, FAKE_CLASS]))
      .returns(features)
  }

  it('can activate when feature enabled', () => {
    havingRequiredFeatures('some-feature')
    const observed = subject.canActivate(context)
    expect(observed).toBe(true)
  })

  it('cannot activate when feature disabled', () => {
    havingRequiredFeatures('some-other-feature')
    expect(() => subject.canActivate(context)).toThrow(FeaturesNotEnabledError)
  })

  it('cannot activate when feature does not exist', () => {
    havingRequiredFeatures('some-missing-feature')
    expect(() => subject.canActivate(context)).toThrow(FeaturesNotEnabledError)
  })
})
