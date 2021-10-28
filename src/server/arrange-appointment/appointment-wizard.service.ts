import { AppointmentWizardStep } from './dto/AppointmentWizardViewModel'
import { Injectable } from '@nestjs/common'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { AppointmentTypeRequiresLocation } from '../community-api/client'
import { FormBuilder, StepMeta } from './form-builder'

const meta: StepMeta<AppointmentBuilderDto, AppointmentWizardStep> = {
  [AppointmentWizardStep.Type]: {
    next(model) {
      switch (model?.requiresLocation) {
        case AppointmentTypeRequiresLocation.Optional:
          return model.locationsAvailableForTeam ? AppointmentWizardStep.Where : AppointmentWizardStep.When
        case AppointmentTypeRequiresLocation.Required:
          return AppointmentWizardStep.Where
        default:
          return AppointmentWizardStep.When
      }
    },
  },
  [AppointmentWizardStep.Where]: {
    next: AppointmentWizardStep.When,
  },
  [AppointmentWizardStep.When]: {
    next: AppointmentWizardStep.AddNotes,
  },
  [AppointmentWizardStep.AddNotes]: {
    next(model) {
      return model?.addNotes ? AppointmentWizardStep.Notes : AppointmentWizardStep.Sensitive
    },
  },
  [AppointmentWizardStep.Notes]: {
    next: AppointmentWizardStep.Sensitive,
  },
  [AppointmentWizardStep.Sensitive]: {
    next: AppointmentWizardStep.Check,
  },
  [AppointmentWizardStep.Check]: {
    next: AppointmentWizardStep.Confirm,
  },
  [AppointmentWizardStep.Confirm]: {
    next: null,
  },
}

@Injectable()
export class AppointmentWizardService extends FormBuilder<AppointmentBuilderDto, AppointmentWizardStep> {
  constructor() {
    super(AppointmentBuilderDto, AppointmentWizardStep, meta)
  }
}
