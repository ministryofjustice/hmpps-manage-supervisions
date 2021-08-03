import { AppointmentDetail } from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakeAppointmentDetail } from '../../src/server/community-api/community-api.fake'

export const APPOINTMENTS: DeepPartial<AppointmentDetail>[] = [
  {
    appointmentId: 1,
    appointmentStart: '2200-01-02T13:30:00',
    appointmentEnd: '2200-01-02T14:00:00',
    notes: 'Some home visit appointment\n\nWith a new line!',
    outcome: null,
    sensitive: true,
    type: { contactType: 'CHVS', description: 'Home Visit to Case (NS)' },
    staff: { forenames: 'Catherine', surname: 'Ellis', unallocated: false },
    rarActivity: true,
    requirement: {
      isRar: true,
      isActive: true,
    },
  },
  {
    appointmentId: 2,
    appointmentStart: '2020-02-03T10:00:00',
    appointmentEnd: '2020-02-03T11:00:00',
    notes: 'Some unknown appointment type',
    outcome: {
      attended: true,
      complied: true,
      description: 'Some outcome description',
    },
    sensitive: true,
    type: {
      contactType: 'P123',
      description: 'Some recent appointment',
    },
    staff: { forenames: 'Unallocated', surname: 'Staff', unallocated: true },
    rarActivity: true,
    requirement: {
      isRar: true,
      isActive: true,
    },
  },
]

export function appointments(
  crn: string,
  convictionId: number,
  partials: DeepPartial<AppointmentDetail>[] = APPOINTMENTS,
): SeedFn {
  return async context => {
    const appointments = partials.map(p => fakeAppointmentDetail(p))
    await Promise.all([
      context.client.community.get(`/secure/offenders/crn/${crn}/appointments`).returns(appointments),
      context.client.community.post(`/secure/offenders/crn/${crn}/sentence/${convictionId}/appointments`).returns({
        appointmentId: 1,
      }),
      ...appointments.map(a =>
        context.client.community.get(`/secure/offenders/crn/${crn}/appointments/${a.appointmentId}`).returns(a),
      ),
    ])
  }
}
