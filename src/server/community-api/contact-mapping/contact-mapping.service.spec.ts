import { Test } from '@nestjs/testing'
import { ContactMappingService } from './contact-mapping.service'
import { FakeConfigModule } from '../../config/config.fake'
import {
  WellKnownAppointmentType,
  WellKnownAppointmentTypeMeta,
  WellKnownCommunicationType,
  WellKnownContactTypeMeta,
  ContactTypeCategory,
  WellKnownContactTypeConfig,
} from '../../config'
import { ConfigService } from '@nestjs/config'
import { fakeAppointmentType, fakeContactType, fakeStaffHuman } from '../community-api.fake'
import { AppointmentMetaResult, CommunicationMetaResult } from './contact-mapping.types'
import { ContactTypesService } from '../contact-types'
import { createStubInstance, SinonStubbedInstance } from 'sinon'

describe('ContactMappingService', () => {
  let subject: ContactMappingService
  let officeVisit: WellKnownAppointmentTypeMeta
  let emailText: WellKnownContactTypeMeta
  let mockContactTypesService: SinonStubbedInstance<ContactTypesService>

  beforeEach(async () => {
    mockContactTypesService = createStubInstance(ContactTypesService)

    const module = await Test.createTestingModule({
      imports: [FakeConfigModule.register()],
      providers: [ContactMappingService, { provide: ContactTypesService, useValue: mockContactTypesService }],
    }).compile()

    subject = module.get(ContactMappingService)
    const config = module.get(ConfigService).get<WellKnownContactTypeConfig>('contacts')
    officeVisit = config[ContactTypeCategory.Appointment][WellKnownAppointmentType.OfficeVisit]
    emailText = config[ContactTypeCategory.Communication][WellKnownCommunicationType.EmailTextFromOffender]
  })

  it('gets well known appointment type meta', async () => {
    const observed = await subject.getTypeMeta({
      staff: fakeStaffHuman({ forenames: 'jOhN', surname: 'DOE', unallocated: false }),
      type: fakeAppointmentType({ contactType: officeVisit.codes.nonRar }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Appointment,
      name: 'Office visit with John Doe',
      value: officeVisit,
    } as AppointmentMetaResult)
  })

  it('gets well known appointment type meta without staff', async () => {
    const observed = await subject.getTypeMeta({
      type: fakeAppointmentType({ contactType: officeVisit.codes.nonRar }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Appointment,
      name: 'Office visit',
      value: officeVisit,
    } as AppointmentMetaResult)
  })

  it('gets well known appointment type meta with unallocated staff', async () => {
    const observed = await subject.getTypeMeta({
      staff: fakeStaffHuman({ unallocated: true }),
      type: fakeAppointmentType({ contactType: officeVisit.codes.nonRar }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Appointment,
      name: 'Office visit',
      value: officeVisit,
    } as AppointmentMetaResult)
  })

  it('gets non-well known appointment type meta', async () => {
    const observed = await subject.getTypeMeta({
      staff: fakeStaffHuman({ forenames: 'jOhN', surname: 'DOE', unallocated: false }),
      type: fakeAppointmentType({ contactType: 'NOT_WELL_KNOWN', description: 'Not well known' }),
    })
    expect(observed).toEqual({
      name: 'Not well known with John Doe',
      type: ContactTypeCategory.Appointment,
      value: null,
    } as AppointmentMetaResult)
  })

  it('gets well known communication type meta', async () => {
    mockContactTypesService.isCommunicationContactType.resolves(true)
    const observed = await subject.getTypeMeta({
      staff: fakeStaffHuman(),
      type: fakeContactType({ code: emailText.code, appointment: false }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Communication,
      name: 'Email/Text from Offender',
      value: emailText,
    } as CommunicationMetaResult)
  })

  it('gets non well known communication type meta', async () => {
    mockContactTypesService.isCommunicationContactType.resolves(true)
    const observed = await subject.getTypeMeta({
      staff: fakeStaffHuman(),
      type: fakeContactType({ code: 'ABC123', appointment: false, description: 'Some communication' }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Communication,
      name: 'Some communication',
      value: null,
    } as CommunicationMetaResult)
  })
})
