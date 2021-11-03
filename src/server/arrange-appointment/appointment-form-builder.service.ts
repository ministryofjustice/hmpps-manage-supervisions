import { Injectable } from '@nestjs/common'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { AppointmentTypeRequiresLocation } from '../community-api/client'
import { FormBuilderService, StepMeta, StepType } from '../util/form-builder'
import { BreadcrumbType, LinksService } from '../common/links'
import { AppointmentWizardStep } from './dto/arrange-appointment.types'

const meta: StepMeta<AppointmentBuilderDto, AppointmentWizardStep> = {
  [AppointmentWizardStep.Type]: {
    type: StepType.Update,
    next(model) {
      switch (model.requiresLocation) {
        case AppointmentTypeRequiresLocation.Optional:
        case AppointmentTypeRequiresLocation.Required:
          switch (model.availableLocations?.length) {
            case 0:
              if (model.requiresLocation === AppointmentTypeRequiresLocation.Required) {
                throw new Error('No locations available, location required & adding new locations is not implemented')
              }
              return AppointmentWizardStep.When

            case 1:
              // just one location, so we should select it and move onto the next step
              model.location = model.availableLocations[0].code
              model.locationDescription = model.availableLocations[0].description
              return AppointmentWizardStep.When

            default:
              return AppointmentWizardStep.Where
          }

        default:
          return AppointmentWizardStep.When
      }
    },
  },
  [AppointmentWizardStep.Where]: {
    type: StepType.Update,
    next: model => {
      if (model.unavailableReason) {
        return AppointmentWizardStep.Unavailable
      }
      return AppointmentWizardStep.When
    },
  },
  [AppointmentWizardStep.When]: {
    type: StepType.Update,
    next: AppointmentWizardStep.AddNotes,
  },
  [AppointmentWizardStep.AddNotes]: {
    type: StepType.Update,
    next(model) {
      return model.addNotes ? AppointmentWizardStep.Notes : AppointmentWizardStep.Sensitive
    },
  },
  [AppointmentWizardStep.Notes]: {
    type: StepType.Update,
    next: AppointmentWizardStep.Sensitive,
  },
  [AppointmentWizardStep.Sensitive]: {
    type: StepType.Update,
    next: AppointmentWizardStep.Check,
  },
  [AppointmentWizardStep.Check]: {
    type: StepType.Update,
    next: AppointmentWizardStep.Confirm,
  },
  [AppointmentWizardStep.Confirm]: {
    type: StepType.Confirmation,
    next: null,
  },
  [AppointmentWizardStep.Unavailable]: {
    type: StepType.Confirmation,
    next: null,
  },
}

@Injectable()
export class AppointmentFormBuilderService extends FormBuilderService<AppointmentBuilderDto, AppointmentWizardStep> {
  constructor(links: LinksService) {
    super(AppointmentBuilderDto, AppointmentWizardStep, meta, links, BreadcrumbType.NewAppointmentStep)
  }
}
