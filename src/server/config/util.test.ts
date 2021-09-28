import { fakeRequirement } from '../community-api/community-api.fake'
import { requirements } from './requirements'
import { getWellKnownRequirementName, isRar } from './util'

describe('config util', () => {
  describe('well known requirement patterns', () => {
    it('maps from main category', () => {
      const requirement = fakeRequirement({
        requirementTypeMainCategory: { code: 'X' },
        requirementTypeSubCategory: { description: 'Named Licensed Premises' },
        length: 3,
        lengthUnit: 'Month',
        active: true,
      })
      const observed = getWellKnownRequirementName(requirements, requirement)
      expect(observed).toBe('3 months exclusion: named licensed premises')
    })

    it('maps from sub category', () => {
      const requirement = fakeRequirement({
        requirementTypeMainCategory: { code: 'W' },
        requirementTypeSubCategory: { code: 'W03' },
        length: 10,
        lengthUnit: 'Hour',
        active: true,
      })
      const observed = getWellKnownRequirementName(requirements, requirement)
      expect(observed).toBe('10 additional hours unpaid work')
    })

    it('falls back', () => {
      const requirement = fakeRequirement({
        requirementTypeMainCategory: { code: 'some-requirement-type', description: 'Some requirement type' },
        requirementTypeSubCategory: { code: 'some-requirement-sub-type', description: 'Some requirement sub type' },
        active: true,
      })
      const observed = getWellKnownRequirementName(requirements, requirement)
      expect(observed).toBe('Some requirement type: some requirement sub type')
    })

    it('maps RAR', () => {
      const requirement = fakeRequirement({
        requirementTypeMainCategory: { code: 'F' },
        length: 10,
        lengthUnit: 'Day',
        active: true,
      })
      const observed = getWellKnownRequirementName(requirements, requirement)
      expect(observed).toBe('10 days RAR')
    })

    it('appends terminated when terminated', () => {
      const requirement = fakeRequirement({
        requirementTypeMainCategory: { code: 'P' },
        length: 10,
        lengthUnit: 'Weeks',
        active: false,
      })
      const observed = getWellKnownRequirementName(requirements, requirement)
      expect(observed).toBe('10 weeks mental health treatment (terminated)')
    })
  })

  describe('is rar', () => {
    it('returns true for rar requirement', () => {
      const requirement = fakeRequirement({
        requirementTypeMainCategory: { code: 'F' },
      })
      const observed = isRar(requirements, requirement)
      expect(observed).toBe(true)
    })

    it('returns false for rar requirement', () => {
      const requirement = fakeRequirement({
        requirementTypeMainCategory: { code: 'not-a-rar-requirement' },
      })
      const observed = isRar(requirements, requirement)
      expect(observed).toBe(false)
    })
  })
})
