import { RecordOutcomeDto } from './record-outcome.dto'
import { fakeRecordOutcomeDto } from './record-outcome.fake'
import { DeepPartial } from '../app.types'
import { IS_BOOLEAN, IS_ENUM, IS_STRING, validate } from 'class-validator'
import { flattenValidationErrors } from '../util/flattenValidationErrors'
import { IS_IN_FN } from '../validators/IsInFn'
import { ComplianceOption, RecordOutcomeStep } from './record-outcome.types'
import { classToPlain, plainToClass } from 'class-transformer'
import { DEFAULT_GROUP } from '../util/mapping'

describe('RecordOutcomeDto validation & mapping', () => {
  async function whenValidatingShouldTriggerConstraints(
    partial: DeepPartial<RecordOutcomeDto>,
    expected: Record<string, string[]>,
  ) {
    const subject = fakeRecordOutcomeDto(partial)
    const observed = await validate(subject)
    const constraints = flattenValidationErrors(observed).reduce(
      (agg, x) => ({ ...agg, [x.path]: Object.keys(x.constraints) }),
      {},
    )
    expect(constraints).toEqual(expected)
  }

  function whenMappingShouldReturn(
    step: RecordOutcomeStep,
    partial: DeepPartial<RecordOutcomeDto>,
    expected: DeepPartial<RecordOutcomeDto> = partial,
  ) {
    const subject = classToPlain(fakeRecordOutcomeDto(partial), { groups: [DEFAULT_GROUP] })
    const observed = plainToClass(RecordOutcomeDto, subject, { groups: [step] })
    const observedPlain = classToPlain(observed, { groups: [DEFAULT_GROUP] })
    expect(observedPlain).toEqual(expected)
  }

  it('is valid', () => whenValidatingShouldTriggerConstraints({}, {}))

  describe(RecordOutcomeStep.Compliance, () => {
    it('is null', () => whenValidatingShouldTriggerConstraints({ compliance: null }, { compliance: [IS_ENUM] }))
    it('is not enum', () =>
      whenValidatingShouldTriggerConstraints({ compliance: 'SOME_VALUE' as any }, { compliance: [IS_ENUM] }))
    it('maps through', () =>
      whenMappingShouldReturn(RecordOutcomeStep.Compliance, { compliance: ComplianceOption.FailedToComply }))
  })

  describe(RecordOutcomeStep.Rar, () => {
    it('is null', () => whenValidatingShouldTriggerConstraints({ isRar: null }, { isRar: [IS_BOOLEAN] }))
    it('is not boolean', () =>
      whenValidatingShouldTriggerConstraints({ isRar: 'SOME_VALUE' as any }, { isRar: [IS_BOOLEAN] }))
    it('maps through', () => whenMappingShouldReturn(RecordOutcomeStep.Rar, { isRar: true }))
  })

  describe(RecordOutcomeStep.FailedToAttend, () => {
    it('is null', () =>
      whenValidatingShouldTriggerConstraints({ acceptableAbsence: null }, { acceptableAbsence: [IS_BOOLEAN] }))
    it('is not boolean', () =>
      whenValidatingShouldTriggerConstraints(
        { acceptableAbsence: 'SOME_VALUE' as any },
        { acceptableAbsence: [IS_BOOLEAN] },
      ))
    it('maps through', () => whenMappingShouldReturn(RecordOutcomeStep.FailedToAttend, { acceptableAbsence: true }))
  })

  describe(RecordOutcomeStep.Outcome, () => {
    it('is null', () => whenValidatingShouldTriggerConstraints({ outcome: null }, { outcome: [IS_STRING, IS_IN_FN] }))
    it('is available', () =>
      whenValidatingShouldTriggerConstraints({ outcome: 'SOME_VALUE' as any }, { outcome: [IS_IN_FN] }))
    it('maps through', () => whenMappingShouldReturn(RecordOutcomeStep.Outcome, { outcome: 'ABC123' }))
  })

  describe(RecordOutcomeStep.Enforcement, () => {
    it('is null', () =>
      whenValidatingShouldTriggerConstraints({ enforcement: null }, { enforcement: [IS_STRING, IS_IN_FN] }))
    it('is available', () =>
      whenValidatingShouldTriggerConstraints({ enforcement: 'SOME_VALUE' as any }, { enforcement: [IS_IN_FN] }))
    it('maps through', () => whenMappingShouldReturn(RecordOutcomeStep.Enforcement, { enforcement: 'ABC123' }))
  })

  describe(RecordOutcomeStep.AddNotes, () => {
    it('is null', () => whenValidatingShouldTriggerConstraints({ addNotes: null }, { addNotes: [IS_BOOLEAN] }))
    it('is not boolean', () =>
      whenValidatingShouldTriggerConstraints({ addNotes: 'SOME_VALUE' as any }, { addNotes: [IS_BOOLEAN] }))
    it('maps through', () => whenMappingShouldReturn(RecordOutcomeStep.AddNotes, { addNotes: true }))
  })

  describe(RecordOutcomeStep.Notes, () => {
    it('is null', () => whenValidatingShouldTriggerConstraints({ notes: null }, { notes: [IS_STRING] }))
    it('maps through', () => whenMappingShouldReturn(RecordOutcomeStep.Notes, { notes: 'some notes' }))
    it('strips tags', () =>
      whenMappingShouldReturn(
        RecordOutcomeStep.Notes,
        { notes: '<a href="https://google.com">some notes</a>' },
        { notes: 'some notes' },
      ))
  })

  describe(RecordOutcomeStep.Sensitive, () => {
    it('is null', () => whenValidatingShouldTriggerConstraints({ sensitive: null }, { sensitive: [IS_BOOLEAN] }))
    it('is not boolean', () =>
      whenValidatingShouldTriggerConstraints({ sensitive: 'SOME_VALUE' as any }, { sensitive: [IS_BOOLEAN] }))
    it('maps through', () => whenMappingShouldReturn(RecordOutcomeStep.Sensitive, { sensitive: true }))
  })
})
