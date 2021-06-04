import { Test } from '@nestjs/testing'
import { ContactMappingService } from './contact-mapping.service'
import { FakeConfigModule } from '../../config/config.fake'
import {
  WellKnownAppointmentType,
  WellKnownAppointmentTypeMeta,
  WellKnownCommunicationType,
  WellKnownCommunicationTypeMeta,
  WellKnownContactTypeCategory,
  WellKnownContactTypeConfig,
} from '../../config'
import { ConfigService } from '@nestjs/config'
import { fakeAppointmentType, fakeContactType, fakeStaffHuman } from '../../community-api/community-api.fake'
import { AppointmentMetaResult, CommunicationMetaResult, UnknownMetaResult } from './types'

describe('ContactMappingService', () => {
  let subject: ContactMappingService
  let officeVisit: WellKnownAppointmentTypeMeta
  let phoneCall: WellKnownCommunicationTypeMeta

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [FakeConfigModule.register()],
      providers: [ContactMappingService],
    }).compile()

    subject = module.get(ContactMappingService)
    const config = module.get(ConfigService).get<WellKnownContactTypeConfig>('contacts')
    officeVisit = config[WellKnownContactTypeCategory.Appointment][WellKnownAppointmentType.OfficeVisit]
    phoneCall = config[WellKnownContactTypeCategory.Communication][WellKnownCommunicationType.PhoneCall]
  })

  it('gets well known appointment type meta', () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman({ forenames: 'jOhN', surname: 'DOE', unallocated: false }),
      type: fakeAppointmentType({ contactType: officeVisit.codes.nonRar }),
    })
    expect(observed).toEqual({
      type: WellKnownContactTypeCategory.Appointment,
      name: 'Office visit with John Doe',
      value: officeVisit,
    } as AppointmentMetaResult)
  })

  it('gets well known appointment type meta without staff', () => {
    const observed = subject.getTypeMeta({
      type: fakeAppointmentType({ contactType: officeVisit.codes.nonRar }),
    })
    expect(observed).toEqual({
      type: WellKnownContactTypeCategory.Appointment,
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
      type: WellKnownContactTypeCategory.Appointment,
      name: 'Office visit',
      value: officeVisit,
    } as AppointmentMetaResult)
  })

  it('gets well known communication type meta', () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman({ forenames: 'jOhN', surname: 'DOE', unallocated: false }),
      type: fakeContactType({ code: phoneCall.code, appointment: false }),
    })
    expect(observed).toEqual({
      type: WellKnownContactTypeCategory.Communication,
      name: 'Phone call',
      value: phoneCall,
    } as CommunicationMetaResult)
  })

  it('gets non-well known appointment type meta', () => {
    const observed = subject.getTypeMeta({
      staff: fakeStaffHuman({ forenames: 'jOhN', surname: 'DOE', unallocated: false }),
      type: fakeAppointmentType({ contactType: 'NOT_WELL_KNOWN', description: 'Not well known' }),
    })
    expect(observed).toEqual({
      name: 'Not well known with John Doe',
      type: null,
      value: { appointment: true },
    } as UnknownMetaResult)
  })
})
