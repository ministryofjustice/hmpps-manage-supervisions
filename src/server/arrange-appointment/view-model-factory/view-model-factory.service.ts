import { Injectable } from '@nestjs/common'
import { AppointmentWizardSession } from '../dto/AppointmentWizardSession'
import { DeepPartial } from '../../app.types'
import { AppointmentBuilderDto } from '../dto/AppointmentBuilderDto'
import { ValidationError } from 'class-validator'
import {
  AppointmentAddNotesViewModel,
  AppointmentLocationViewModel,
  AppointmentNotesViewModel,
  AppointmentRarViewModel,
  AppointmentSchedulingViewModel,
  AppointmentSensitiveViewModel,
  AppointmentTypeViewModel,
  AppointmentWizardViewModel,
  CheckAppointmentViewModel,
  ConfirmAppointmentViewModel,
  UnavailableAppointmentViewModel,
} from '../dto/AppointmentWizardViewModel'
import { plainToClass } from 'class-transformer'
import { DEFAULT_GROUP } from '../../util/mapping'
import { getDisplayName, isActiveDateRange } from '../../util'
import { DateTime } from 'luxon'
import { BreadcrumbType, LinksService, Utm, UtmMedium } from '../../common/links'
import { ArrangeAppointmentService } from '../arrange-appointment.service'
import { AppointmentFormBuilderService } from '../appointment-form-builder.service'
import { ViewModelFactory } from '../../util/form-builder'
import { AlternateLocation, AppointmentWizardStep } from '../dto/arrange-appointment.types'

@Injectable()
export class ViewModelFactoryService
  implements ViewModelFactory<AppointmentBuilderDto, AppointmentWizardStep, AppointmentWizardViewModel>
{
  constructor(
    private readonly service: ArrangeAppointmentService,
    private readonly formBuilder: AppointmentFormBuilderService,
    private readonly links: LinksService,
  ) {}

  async type(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentTypeViewModel> {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })

    const types = await this.service.getAppointmentTypes(session.dto.cja2003Order, session.dto.legacyOrder)
    const currentType = await this.service.getAppointmentType(appointment)

    const [type, other] = currentType
      ? currentType.wellKnownType
        ? [currentType.wellKnownType, null]
        : ['other', currentType.contactType]
      : [null, null]

    return {
      step: AppointmentWizardStep.Type,
      errors,
      appointment,
      paths: { back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.Type) },
      types,
      type: body?.type || type,
      otherType: body?.otherType || other,
    }
  }

  rar(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): AppointmentRarViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })

    return {
      step: AppointmentWizardStep.Rar,
      errors,
      appointment,
      paths: {
        back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.Rar),
      },
      isRar: body?.isRar ?? session.dto.isRar,
    }
  }

  async when(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentSchedulingViewModel> {
    const employment = await this.service.getCurrentEmploymentCircumstances(session.crn)

    const disabilities = (session.dto.offender.offenderProfile.disabilities || [])
      .filter(isActiveDateRange)
      .map(d => {
        const provisions = (d.provisions || [])
          .filter(
            p =>
              (!p.finishDate || DateTime.fromISO(p.finishDate) > DateTime.now()) &&
              DateTime.fromISO(d.startDate) < DateTime.now(),
          )
          .map(p => p.provisionType.description)

        if (provisions.length > 0) {
          return d.disabilityType.description + ` (adjustments: ${provisions?.join(', ')})`
        }
        return d.disabilityType.description
      })
      .join(', ')

    const language = session.dto.offender.offenderProfile.offenderLanguages?.primaryLanguage

    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.When,
      errors,
      appointment,
      paths: {
        back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.When),
      },
      date: (body?.date as any) || appointment.date,
      startTime: body?.startTime || appointment.startTime,
      endTime: body?.endTime || appointment.endTime,
      offender: {
        firstName: session.dto.offender.firstName,
        personalCircumstances: {
          language,
          employment,
          disabilities,
        },
      },
    }
  }

  where(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): AppointmentLocationViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })

    return {
      step: AppointmentWizardStep.Where,
      appointment,
      locations: session.dto.availableLocations,
      alternateLocations: session.dto.alternateLocations as AlternateLocation[],
      location: body?.location || appointment.location,
      paths: {
        back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.Where),
      },
      errors,
    }
  }

  'add-notes'(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): AppointmentAddNotesViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.AddNotes,
      appointment,
      paths: {
        back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.AddNotes),
      },
      errors,
      addNotes: body?.addNotes || appointment.addNotes,
    }
  }

  notes(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): AppointmentNotesViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.Notes,
      appointment,
      paths: {
        back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.Notes),
      },
      errors,
      notes: body?.notes || appointment.notes,
    }
  }

  sensitive(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): AppointmentSensitiveViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.Sensitive,
      appointment,
      paths: {
        back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.Sensitive),
      },
      errors,
      sensitive: body?.sensitive || appointment.sensitive,
    }
  }

  check(session: AppointmentWizardSession): CheckAppointmentViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    return {
      step: AppointmentWizardStep.Check,
      appointment,
      paths: {
        back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.Check),
        type: this.formBuilder.getStepUrl(session, AppointmentWizardStep.Type),
        where: this.formBuilder.getStepUrl(session, AppointmentWizardStep.Where),
        when: this.formBuilder.getStepUrl(session, AppointmentWizardStep.When),
        notes: this.formBuilder.getStepUrl(session, AppointmentWizardStep.Notes),
        sensitive: this.formBuilder.getStepUrl(session, AppointmentWizardStep.Sensitive),
      },
      rarDetails: {
        category: '', // TODO from nsiType.description
        subCategory: '', // TODO from nsiSubType.description
      },
    }
  }

  confirm(session: AppointmentWizardSession): ConfirmAppointmentViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    const phoneNumber = session.dto.offender.contactDetails?.phoneNumbers.find(x => x.number)

    return {
      step: AppointmentWizardStep.Confirm,
      appointment,
      paths: {
        next: this.links.getUrl(BreadcrumbType.Case, { crn: session.dto.offender.otherIds.crn }),
      },
      offender: {
        firstName: session.dto.offender.firstName,
        phoneNumber: phoneNumber?.number,
      },
    }
  }

  unavailable(session: AppointmentWizardSession): UnavailableAppointmentViewModel {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })

    const offender = session.dto.offender
    const displayName = getDisplayName(offender)
    const utm: Utm = { medium: UtmMedium.ArrangeAppointment, campaign: 'unavailable-' + session.dto.unavailableReason }
    return {
      step: AppointmentWizardStep.Unavailable,
      appointment,
      paths: {
        back: this.formBuilder.getBackUrl(session, AppointmentWizardStep.Unavailable),
      },
      reason: session.dto.unavailableReason,
      offender: {
        ids: {
          crn: offender.otherIds.crn.toUpperCase(),
          pnc: offender.otherIds.pncNumber,
        },
        displayName,
        shortName: getDisplayName(offender, { middleNames: false }),
        dateOfBirth: offender.dateOfBirth && DateTime.fromISO(offender.dateOfBirth),
      },
      links: {
        deliusContactLog: this.links.getUrl(BreadcrumbType.ExitToDeliusContactLogNow, { crn: session.crn, utm }),
        deliusHomePage: this.links.getUrl(BreadcrumbType.ExitToDeliusHomepageNow, { crn: session.crn, utm }),
      },
    }
  }
}
