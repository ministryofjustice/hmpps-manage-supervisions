import { ContactTypeCategory } from '../../config'
import {
  AppointmentMetaResult,
  CommunicationMetaResult,
  GetMetaResult,
  SystemMetaResult,
  UnknownMetaResult,
} from './contact-mapping.types'

export function fakeContactMeta(type: ContactTypeCategory.Appointment, wellKnow?: boolean): AppointmentMetaResult
export function fakeContactMeta(type: ContactTypeCategory.Communication, wellKnow?: boolean): CommunicationMetaResult
export function fakeContactMeta(type: ContactTypeCategory.Other, wellKnow?: boolean): UnknownMetaResult
export function fakeContactMeta(type: ContactTypeCategory.System, wellKnow?: boolean): SystemMetaResult
export function fakeContactMeta(type: ContactTypeCategory, wellKnown = true): GetMetaResult {
  switch (type) {
    case ContactTypeCategory.Appointment:
      return {
        type: ContactTypeCategory.Appointment,
        name: 'some appointment',
        value: wellKnown ? { name: 'some appointment category', codes: { nonRar: 'ABC123' } } : null,
      }
    case ContactTypeCategory.Communication:
      return {
        type: ContactTypeCategory.Communication,
        name: 'some communication',
        value: wellKnown
          ? {
              name: 'some communication category',
              from: 'from {}',
              to: 'to {}',
              description: 'some communication with {}',
              code: 'ABC123',
            }
          : null,
      }
    case ContactTypeCategory.WarningLetter:
      return { type: ContactTypeCategory.WarningLetter, name: 'some warning letter', value: wellKnown ? {} : null }
    case ContactTypeCategory.Other:
      return { type: ContactTypeCategory.Other, name: 'some unknown contact', value: null }
    case ContactTypeCategory.BreachStart:
      return { type: ContactTypeCategory.BreachStart, name: 'some breach start', value: null }
    case ContactTypeCategory.BreachEnd:
      return { type: ContactTypeCategory.BreachEnd, name: 'some breach end', value: null }
    case ContactTypeCategory.System:
      return { type: ContactTypeCategory.System, name: 'some system contact', value: null }
  }
}
