import { Injectable, ValidationError } from '@nestjs/common'
import { ViewModelFactory } from '../../util/form-builder'
import { RecordOutcomeDto, RecordOutcomeSession } from '../record-outcome.dto'
import {
  ComplianceOption,
  RecordOutcomeAppointmentSummary,
  RecordOutcomeInitViewModel,
  RecordOutcomeStep,
  RecordOutcomeViewModel,
} from '../record-outcome.types'
import { BreadcrumbType, LinksService } from '../../common/links'
import { DateTime } from 'luxon'
import { DeepPartial } from '../../app.types'
import { StateMachineService } from '../state-machine/state-machine.service'

@Injectable()
export class ViewModelFactoryService
  implements ViewModelFactory<RecordOutcomeDto, RecordOutcomeStep, RecordOutcomeViewModel>
{
  constructor(private readonly links: LinksService, private readonly stateMachineService: StateMachineService) {}

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

  'failed-to-attend'(
    session: RecordOutcomeSession,
    body?: DeepPartial<RecordOutcomeDto>,
    errors: ValidationError[] = [],
  ): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    return {
      step: RecordOutcomeStep.FailedToAttend,
      acceptableAbsence: body?.acceptableAbsence || session.dto.acceptableAbsence,
      offenderFirstName: session.dto.offender?.firstName,
      errors: errors,
      paths: {
        back: this.stateMachineService.getBackUrl(session, RecordOutcomeStep.FailedToAttend),
      },
    }
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
      compliance: body?.compliance || session.dto.compliance,
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

  outcome(
    session: RecordOutcomeSession,
    body?: DeepPartial<RecordOutcomeDto>,
    errors: ValidationError[] = [],
  ): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    // get list of outcomes to display, filtered on attendence/ compliance status
    let attendance, compliantAcceptable

    if (session.dto.compliance == ComplianceOption.FailedToAttend && !session.dto.acceptableAbsence) {
      attendance = false
      compliantAcceptable = false
    } else if (session.dto.compliance == ComplianceOption.FailedToAttend && session.dto.acceptableAbsence) {
      attendance = false
      compliantAcceptable = true
    } else if (session.dto.compliance == ComplianceOption.FailedToComply) {
      attendance = true
      compliantAcceptable = false
    } else if (session.dto.compliance == ComplianceOption.ComplianceAcceptable) {
      attendance = true
      compliantAcceptable = true
    }

    const outcomes = session.dto.availableOutcomeTypes.outcomeTypes
      .filter(outcome => outcome.attendance == attendance && outcome.compliantAcceptable == compliantAcceptable)
      .map(o => ({ code: o.code, description: o.description }))

    return {
      step: RecordOutcomeStep.Outcome,
      acceptableAbsence: !attendance && compliantAcceptable,
      errors,
      outcomes,
      outcome: body?.outcome || session.dto?.outcome,
      offenderFirstName: session.dto.offender?.firstName,
      paths: {
        back: this.stateMachineService.getBackUrl(session, RecordOutcomeStep.Outcome),
      },
    }
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
