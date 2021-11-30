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
import { plainToClass } from 'class-transformer'
import { DEFAULT_GROUP } from '../../util/mapping'

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

  'add-notes'(
    session: RecordOutcomeSession,
    body?: DeepPartial<RecordOutcomeDto>,
    errors: ValidationError[] = [],
  ): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    return {
      step: RecordOutcomeStep.AddNotes,
      addNotes: body?.addNotes || session.dto.addNotes,
      errors: errors,
      paths: {
        back: this.stateMachineService.getBackUrl(session, RecordOutcomeStep.AddNotes),
      },
    }
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

  check(
    session: RecordOutcomeSession,
    body?: DeepPartial<RecordOutcomeDto>,
    errors: ValidationError[] = [],
  ): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    const outcome = plainToClass(RecordOutcomeDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })

    console.log(JSON.stringify(outcome))

    return {
      step: RecordOutcomeStep.Check,
      outcome,
      paths: {
        back: this.stateMachineService.getBackUrl(session, RecordOutcomeStep.Check),
        compliance: this.stateMachineService.getStepUrl(session, RecordOutcomeStep.Compliance),
        outcome: this.stateMachineService.getStepUrl(session, RecordOutcomeStep.Outcome),
        enforcement: this.stateMachineService.getStepUrl(session, RecordOutcomeStep.Enforcement),
        notes: this.stateMachineService.getStepUrl(session, RecordOutcomeStep.Notes),
        sensitive: this.stateMachineService.getStepUrl(session, RecordOutcomeStep.Sensitive),
      },
      errors,
    }
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

  enforcement(
    session: RecordOutcomeSession,
    body?: DeepPartial<RecordOutcomeDto>,
    errors: ValidationError[] = [],
  ): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    const dto = plainToClass(RecordOutcomeDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })

    const enforcementActions = dto.selectedOutcome?.enforcements.map(e => ({
      code: e.code,
      description: e.description,
    }))

    return {
      step: RecordOutcomeStep.Enforcement,
      errors,
      enforcementActions,
      enforcement: body?.enforcement || dto?.enforcement,
      paths: {
        back: this.stateMachineService.getBackUrl(session, RecordOutcomeStep.Outcome),
      },
    }
  }

  notes(
    session: RecordOutcomeSession,
    body?: DeepPartial<RecordOutcomeDto>,
    errors: ValidationError[] = [],
  ): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    return {
      step: RecordOutcomeStep.Notes,
      notes: body?.notes || session.dto.notes,
      errors: errors,
      paths: {
        back: this.stateMachineService.getBackUrl(session, RecordOutcomeStep.Notes),
      },
    }
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
      compliance: session.dto.compliance,
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

  sensitive(
    session: RecordOutcomeSession,
    body?: DeepPartial<RecordOutcomeDto>,
    errors: ValidationError[] = [],
  ): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    return {
      step: RecordOutcomeStep.Sensitive,
      offenderFirstName: session.dto.offender?.firstName,
      sensitive: body?.sensitive || session.dto.sensitive,
      errors: errors,
      paths: {
        back: this.stateMachineService.getBackUrl(session, RecordOutcomeStep.Sensitive),
      },
    }
  }

  unavailable(): Promise<RecordOutcomeViewModel> | RecordOutcomeViewModel {
    throw new Error('not implemented')
  }
}
