import { Injectable } from '@nestjs/common'
import { AppointmentWizardSession } from '../dto/AppointmentWizardSession'
import { DeepPartial } from '../../app.types'
import { AppointmentBuilderDto } from '../dto/AppointmentBuilderDto'
import { ValidationError } from 'class-validator'
import {
  AppointmentAddNotesViewModel,
  AppointmentLocationViewModel,
  AppointmentNotesViewModel,
  AppointmentSchedulingViewModel,
  AppointmentSensitiveViewModel,
  AppointmentTypeViewModel,
  AppointmentWizardStep,
  AppointmentWizardViewModel,
  CheckAppointmentViewModel,
  ConfirmAppointmentViewModel,
} from '../dto/AppointmentWizardViewModel'
import { plainToClass } from 'class-transformer'
import { DEFAULT_GROUP } from '../../util/mapping'
import { isActiveDateRange } from '../../util'
import { DateTime } from 'luxon'
import { BreadcrumbType, LinksService } from '../../common/links'
import { ArrangeAppointmentService } from '../arrange-appointment.service'
import { AppointmentFormBuilderService } from '../appointment-form-builder.service'
import { ViewModelFactory } from '../../util/form-builder'

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

  async when(
    session: AppointmentWizardSession,
    body?: DeepPartial<AppointmentBuilderDto>,
    errors: ValidationError[] = [],
  ): Promise<AppointmentSchedulingViewModel> {
    const [offender, employment] = await Promise.all([
      this.service.getOffenderDetails(session.crn),
      this.service.getCurrentEmploymentCircumstances(session.crn),
    ])

    const disabilities = (offender.offenderProfile.disabilities || [])
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

    const language = offender.offenderProfile.offenderLanguages?.primaryLanguage

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
        firstName: offender.firstName,
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

  async confirm(session: AppointmentWizardSession): Promise<ConfirmAppointmentViewModel> {
    const appointment = plainToClass(AppointmentBuilderDto, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    const offenderDetails = await this.service.getOffenderDetails(session.crn)
    const phoneNumber = offenderDetails.contactDetails?.phoneNumbers.find(x => x.number)

    return {
      step: AppointmentWizardStep.Confirm,
      appointment,
      paths: {
        next: this.links.getUrl(BreadcrumbType.Case, { crn: offenderDetails.otherIds.crn }),
      },
      offender: {
        firstName: offenderDetails.firstName,
        phoneNumber: phoneNumber?.number,
      },
    }
  }
}
