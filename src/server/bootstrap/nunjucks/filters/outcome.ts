import { NunjucksFilter } from './types'

const translations = {
  AAAA: 'Other', // 'Acceptable Absence - Other'
  AACL: 'Court or legal', // 'Acceptable Absence - Court/Legal'
  AAEM: 'Employment', // 'Acceptable Absence - Employment'
  AAFC: 'Family or childcare', // 'Acceptable Absence - Family/ Childcare'
  AAHO: 'Holiday', // 'Acceptable Absence - Holiday'
  AAME: 'Medical', // 'Acceptable Absence - Medical'
  AARC: 'RIC', // 'Acceptable Absence - RIC'
  AARE: 'Religious', // 'Acceptable Absence - Religious'
  AASD: 'Stood down', // 'Acceptable Absence - Stood Down'
  AFTA: 'Failed to attend', // 'Failed to Attend'
  AFTC: 'Failed to comply', // 'Attended - Failed to Comply'
  ATFI: 'Failed to comply with other instruction', // 'Failed to Comply with other Instruction'
  ATSH: 'Sent home (behaviour)', // 'Attended - Sent Home (behaviour)'
  ATSS: 'Sent home (service issues)', // 'Attended - Sent Home (service issues)'
  ATTC: 'Complied', // 'Attended - Complied'
  CO05: 'Professional judgement decision', // 'Acceptable Absence-Professional Judgement Decision'
  CO10: 'None in following 12 months', // 'Acceptable Failure - None in following 12 months'
  CO24: 'Migrated contact', // 'Z - Not Recorded - Migrated Contact'
  CO39: 'YOT Breach – Not enforceable', // 'YOT Breach - Not Enforceable'
  CO40: 'Suspended', // 'Suspended'
  RSOF: 'Reschedule requested by $offenderFirstName', // 'Rescheduled - Offender Request'
  RSSR: 'Reschedule requested by staff', // 'Rescheduled - Service Request'
  UAAB: 'Unacceptable absence', // 'Unacceptable Absence'
}

interface Outcome {
  code: string
  description: string
}

export class TranslateOutcomes extends NunjucksFilter {
  private static t(outcome: Outcome): string {
    return translations[outcome['code']] || outcome['description']
  }

  filter(arr: Outcome[], offenderFirstName?: string): Outcome[] {
    return arr.map(outcome => {
      outcome['description'] = TranslateOutcomes.t(outcome).replace('$offenderFirstName', offenderFirstName)
      return outcome
    })
  }
}
