import { Injectable, ValidationError } from '@nestjs/common'
import { ViewModelFactory } from '../../util/form-builder'
import { RecordOutcomeDto, RecordOutcomeSession } from '../record-outcome.dto'
import {
  RecordOutcomeAppointmentSummary,
  RecordOutcomeInitViewModel,
  RecordOutcomeStep,
  RecordOutcomeViewModel,
} from '../record-outcome.types'
import { BreadcrumbType, LinksService } from '../../common/links'
import { DateTime } from 'luxon'
import { DeepPartial } from '../../app.types'

@Injectable()
export class ViewModelFactoryService
  implements ViewModelFactory<RecordOutcomeDto, RecordOutcomeStep, RecordOutcomeViewModel>
{
  constructor(private readonly links: LinksService) {}

  init(session: RecordOutcomeSession, nextUrl: string): RecordOutcomeInitViewModel {
    const links = this.links.of({ crn: session.crn, ...session.breadcrumbOptions })
    return {
      appointment: {
        ...session.dto.appointment,
        start: DateTime.fromISO(session.dto.appointment.start),
        end: session.dto.appointment.end && DateTime.fromISO(session.dto.appointment.end),
      } as RecordOutcomeAppointmentSummary,
      breadcrumbs: links.breadcrumbs(BreadcrumbType.RecordOutcome),
      paths: {
        viewAppointment: links.url(BreadcrumbType.Appointment),
        next: nextUrl,
      },
    }
  }

  'add-notes'(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  'failed-to-attend'(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  check(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  compliance(
    session: RecordOutcomeSession,
    body?: DeepPartial<RecordOutcomeDto>,
    errors: ValidationError[] = [],
  ): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    return {
      step: RecordOutcomeStep.Compliance,
      compliance: body?.compliance,
      offenderFirstName: session.dto.offender?.firstName,
      errors: errors,
      paths: {
        back: './',
      },
    }
  }

  confirm(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  enforcement(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  notes(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  outcome(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  rar(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  sensitive(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }

  unavailable(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }
}
