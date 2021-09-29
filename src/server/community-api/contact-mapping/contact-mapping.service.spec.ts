import { Test } from '@nestjs/testing'
import { COMMUNICATION_CATEGORY_CODE, ContactMappingService } from './contact-mapping.service'
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
import { AppointmentMetaResult, CommunicationMetaResult, SystemMetaResult } from './contact-mapping.types'

describe('ContactMappingService', () => {
  let subject: ContactMappingService
  let officeVisit: WellKnownAppointmentTypeMeta
  let emailText: WellKnownContactTypeMeta

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [FakeConfigModule.register()],
      providers: [ContactMappingService],
    }).compile()

    subject = module.get(ContactMappingService)
    const config = module.get(ConfigService).get<WellKnownContactTypeConfig>('contacts')
    officeVisit = config[ContactTypeCategory.Appointment][WellKnownAppointmentType.OfficeVisit]
    emailText = config[ContactTypeCategory.Communication][WellKnownCommunicationType.EmailTextFromOffender]
  })

  it('gets well known appointment type meta', async () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman({ forenames: 'jOhN', surname: 'DOE', unallocated: false }),
      type: fakeAppointmentType({ contactType: officeVisit.codes.nonRar }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Appointment,
      name: 'Office visit with John Doe',
      value: officeVisit,
    } as AppointmentMetaResult)
  })

  it('gets well known appointment type meta without staff', () => {
    const observed = subject.getTypeMeta({
      type: fakeAppointmentType({ contactType: officeVisit.codes.nonRar }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Appointment,
      name: 'Office visit',
      value: officeVisit,
    } as AppointmentMetaResult)
  })

  it('gets well known appointment type meta with unallocated staff', () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman({ unallocated: true }),
      type: fakeAppointmentType({ contactType: officeVisit.codes.nonRar }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Appointment,
      name: 'Office visit',
      value: officeVisit,
    } as AppointmentMetaResult)
  })

  it('gets non-well known appointment type meta', () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman({ forenames: 'jOhN', surname: 'DOE', unallocated: false }),
      type: fakeAppointmentType({ contactType: 'NOT_WELL_KNOWN', description: 'Not well known' }),
    })
    expect(observed).toEqual({
      name: 'Not well known with John Doe',
      type: ContactTypeCategory.Appointment,
      value: null,
    } as AppointmentMetaResult)
  })

  it('gets well known communication type meta', () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman(),
      type: fakeContactType({
        code: emailText.code,
        appointment: false,
        categories: [{ code: COMMUNICATION_CATEGORY_CODE }],
      }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Communication,
      name: 'Email/Text from Offender',
      value: emailText,
    } as CommunicationMetaResult)
  })

  it('gets non well known communication type meta', () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman(),
      type: fakeContactType({
        code: 'ABC123',
        appointment: false,
        description: 'Some communication',
        categories: [{ code: COMMUNICATION_CATEGORY_CODE }],
      }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.Communication,
      name: 'Some communication',
      value: null,
    } as CommunicationMetaResult)
  })

  it('gets system contact type meta', () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman(),
      type: fakeContactType({
        appointment: false,
        systemGenerated: true,
        description: 'System contact',
      }),
    })
    expect(observed).toEqual({
      type: ContactTypeCategory.System,
      name: 'System contact',
      value: null,
    } as SystemMetaResult)
  })
})
