import { Test } from '@nestjs/testing'
import { ViewModelFactoryService } from './view-model-factory.service'
import { ArrangeAppointmentService } from '../arrange-appointment.service'
import { AppointmentFormBuilderService } from '../appointment-form-builder.service'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { MockLinksModule } from '../../common/links/links.mock'
import { AppointmentWizardSession } from '../dto/AppointmentWizardSession'
import {
  fakeAppointmentBuilderDto,
  fakeAvailableAppointmentTypes,
  fakeMaybeWellKnownAppointmentType,
} from '../dto/arrange-appointment.fake'
import { classToPlain } from 'class-transformer'
import { DEFAULT_GROUP } from '../../util/mapping'
import {
  AppointmentAddNotesViewModel,
  AppointmentLocationViewModel,
  AppointmentNotesViewModel,
  AppointmentRarViewModel,
  AppointmentSchedulingViewModel,
  AppointmentSensitiveViewModel,
  AppointmentTypeViewModel,
  CheckAppointmentViewModel,
  ConfirmAppointmentViewModel,
  UnavailableAppointmentViewModel,
} from '../dto/AppointmentWizardViewModel'
import { fakeValidationError } from '../../util/util.fake'
import { BreadcrumbType, UtmMedium } from '../../common/links'
import { AppointmentBookingUnavailableReason, AppointmentWizardStep } from '../dto/arrange-appointment.types'
import { DateTime } from 'luxon'

describe('ViewModelFactoryService', () => {
  let subject: ViewModelFactoryService
  let service: SinonStubbedInstance<ArrangeAppointmentService>
  let formBuilder: SinonStubbedInstance<AppointmentFormBuilderService>
  const dto = fakeAppointmentBuilderDto({
    cja2003Order: true,
    legacyOrder: true,
    unavailableReason: AppointmentBookingUnavailableReason.NewLocationRequired,
    offender: {
      firstName: 'Liz',
      middleNames: ['Danger'],
      surname: 'Haggis',
      dateOfBirth: '1999-10-10',
      otherIds: { crn: 'some-crn', pncNumber: 'some-pnc' },
      contactDetails: {
        phoneNumbers: [{ number: '1-530-861-4048' }],
      },
      offenderProfile: {
        offenderLanguages: { primaryLanguage: 'some-primary-language' },
        disabilities: [
          {
            disabilityType: { description: 'some-disability' },
            provisions: [{ provisionType: { description: 'some-provision' } }],
          },
        ],
      },
    },
  })
  const session: AppointmentWizardSession = {
    crn: 'some-crn',
    completedSteps: [],
    dto: classToPlain(dto, { groups: [DEFAULT_GROUP] }),
  }
  const errors = [fakeValidationError()]

  beforeAll(async () => {
    service = createStubInstance(ArrangeAppointmentService)
    formBuilder = createStubInstance(AppointmentFormBuilderService)

    const module = await Test.createTestingModule({
      imports: [MockLinksModule],
      providers: [
        ViewModelFactoryService,
        { provide: ArrangeAppointmentService, useValue: service },
        { provide: AppointmentFormBuilderService, useValue: formBuilder },
      ],
    }).compile()

    subject = module.get(ViewModelFactoryService)

    formBuilder.getBackUrl.withArgs(session, match.string).callsFake((session, step) => `/${step}/back`)
    formBuilder.getStepUrl.withArgs(session, match.string).callsFake((session, step) => `/${step}`)
  })

  it('type', async () => {
    const body = fakeAppointmentBuilderDto(
      {
        type: 'other',
        otherType: 'some-type',
      },
      { groups: [AppointmentWizardStep.Type] },
    )

    const availableTypes = fakeAvailableAppointmentTypes()
    service.getAppointmentTypes.withArgs(true, true).resolves(availableTypes)

    const type = fakeMaybeWellKnownAppointmentType()
    service.getAppointmentType.withArgs(match(dto)).resolves(type)

    const observed = await subject.type(session, body, errors)
    expect(observed).toEqual({
      step: AppointmentWizardStep.Type,
      errors,
      appointment: dto,
      paths: { back: '/type/back' },
      types: availableTypes,
      type: 'other',
      otherType: 'some-type',
    } as AppointmentTypeViewModel)
  })

  it('rar', () => {
    const body = fakeAppointmentBuilderDto({ isRar: true }, { groups: [AppointmentWizardStep.Rar] })
    const observed = subject.rar(session, body, errors)
    expect(observed).toEqual({
      step: AppointmentWizardStep.Rar,
      errors,
      appointment: dto,
      paths: { back: '/rar/back' },
      isRar: true,
    } as AppointmentRarViewModel)
  })

  it('when', async () => {
    service.getCurrentEmploymentCircumstances.withArgs(session.crn).resolves('some-employment-circumstances')

    const body = fakeAppointmentBuilderDto(
      {
        date: { day: 20, month: 2, year: 2021 },
        startTime: '10am',
        endTime: '12pm',
      },
      { groups: [AppointmentWizardStep.When] },
    )
    const observed = await subject.when(session, body, errors)

    expect(observed).toEqual({
      step: AppointmentWizardStep.When,
      errors,
      appointment: dto,
      paths: { back: '/when/back' },
      date: body.date,
      startTime: '10am',
      endTime: '12pm',
      offender: {
        firstName: 'Liz',
        personalCircumstances: {
          language: 'some-primary-language',
          employment: 'some-employment-circumstances',
          disabilities: 'some-disability (adjustments: some-provision)',
        },
      },
    } as AppointmentSchedulingViewModel)
  })

  it('where', () => {
    const body = fakeAppointmentBuilderDto({ location: 'some-location' }, { groups: [AppointmentWizardStep.Where] })
    const observed = subject.where(session, body, errors)

    expect(observed).toEqual({
      step: AppointmentWizardStep.Where,
      appointment: dto,
      locations: session.dto.availableLocations,
      alternateLocations: session.dto.alternateLocations,
      location: 'some-location',
      paths: { back: '/where/back' },
      errors,
    } as AppointmentLocationViewModel)
  })

  it('add-notes', () => {
    const body = fakeAppointmentBuilderDto({ addNotes: true }, { groups: [AppointmentWizardStep.AddNotes] })
    const observed = subject['add-notes'](session, body, errors)

    expect(observed).toEqual({
      step: AppointmentWizardStep.AddNotes,
      appointment: dto,
      paths: { back: '/add-notes/back' },
      errors,
      addNotes: true,
    } as AppointmentAddNotesViewModel)
  })

  it('notes', () => {
    const body = fakeAppointmentBuilderDto({ notes: 'some-notes' }, { groups: [AppointmentWizardStep.Notes] })
    const observed = subject.notes(session, body, errors)

    expect(observed).toEqual({
      step: AppointmentWizardStep.Notes,
      appointment: dto,
      paths: { back: '/notes/back' },
      errors,
      notes: 'some-notes',
    } as AppointmentNotesViewModel)
  })

  it('notes', () => {
    const body = fakeAppointmentBuilderDto({ sensitive: true }, { groups: [AppointmentWizardStep.Sensitive] })
    const observed = subject.sensitive(session, body, errors)

    expect(observed).toEqual({
      step: AppointmentWizardStep.Sensitive,
      appointment: dto,
      paths: { back: '/sensitive/back' },
      errors,
      sensitive: true,
    } as AppointmentSensitiveViewModel)
  })

  it('check', () => {
    const observed = subject.check(session)
    expect(observed).toEqual({
      step: AppointmentWizardStep.Check,
      appointment: dto,
      paths: {
        back: '/check/back',
        type: '/type',
        where: '/where',
        when: '/when',
        notes: '/notes',
        sensitive: '/sensitive',
      },
      rarDetails: { category: '', subCategory: '' },
      errors: [],
    } as CheckAppointmentViewModel)
  })

  it('confirm', () => {
    const observed = subject.confirm(session)

    const links = MockLinksModule.of({ crn: 'some-crn' })
    expect(observed).toEqual({
      step: AppointmentWizardStep.Confirm,
      appointment: dto,
      paths: { next: links.url(BreadcrumbType.Case) },
      offender: {
        firstName: 'Liz',
        phoneNumber: '1-530-861-4048',
        dateOfBirth: DateTime.fromISO('1999-10-10'),
        displayName: 'Liz Danger Haggis',
        ids: {
          crn: 'SOME-CRN',
          pnc: 'some-pnc',
        },
        shortName: 'Liz Haggis',
      },
      links: {
        deliusContactLog:
          '/ExitToDeliusContactLogNow?crn=some-crn&utm.campaign=no-phone-number&utm.medium=arrange-appointment',
      },
    } as ConfirmAppointmentViewModel)
  })

  it('confirm with no phone numbers', () => {
    const removed = fakeAppointmentBuilderDto({
      offender: {
        contactDetails: {
          phoneNumbers: null,
        },
      },
    })

    const sessionWithNoPhoneNo: AppointmentWizardSession = {
      crn: 'some-crn',
      completedSteps: [],
      dto: classToPlain(removed, { groups: [DEFAULT_GROUP] }),
    }

    const observed = subject.confirm(sessionWithNoPhoneNo)

    expect(observed.offender.phoneNumber).toEqual(undefined)
  })

  it('unavailable', () => {
    const observed = subject.unavailable(session)

    const links = MockLinksModule.of({ crn: 'some-crn' })
    expect(observed).toEqual({
      step: AppointmentWizardStep.Unavailable,
      appointment: dto,
      paths: { back: '/unavailable/back' },
      reason: AppointmentBookingUnavailableReason.NewLocationRequired,
      offender: {
        ids: {
          crn: 'SOME-CRN',
          pnc: 'some-pnc',
        },
        displayName: 'Liz Danger Haggis',
        shortName: 'Liz Haggis',
        dateOfBirth: DateTime.fromISO('1999-10-10'),
      },
      links: {
        deliusContactLog: links.url(BreadcrumbType.ExitToDeliusContactLogNow, {
          crn: session.crn,
          utm: {
            medium: UtmMedium.ArrangeAppointment,
            campaign: 'unavailable-new-location-required',
          },
        }),
        deliusHomePage: links.url(BreadcrumbType.ExitToDeliusHomepageNow, {
          crn: session.crn,
          utm: {
            medium: UtmMedium.ArrangeAppointment,
            campaign: 'unavailable-new-location-required',
          },
        }),
      },
    } as UnavailableAppointmentViewModel)
  })
})
