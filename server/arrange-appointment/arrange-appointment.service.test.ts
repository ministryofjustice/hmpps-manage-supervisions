import 'reflect-metadata'
import { createStubInstance, SinonStubbedInstance, match } from 'sinon'
import { RestClient } from '../data/RestClient'
import { RestClientFactory } from '../data/RestClientFactory'
import { fakeUserPrincipal } from '../authentication/user.fake'
import { ArrangeAppointmentService } from './arrange-appointment.service'
import {
  fakeAppointmentBuilderDto,
  fakeAppointmentCreateResponse,
  fakeOffenderDetailsResponse,
} from './dto/arrange-appointment.fake'
import * as faker from 'faker'
import { AppointmentCreateResponse } from './dto/AppointmentCreateResponse'
import { OffenderDetailsResponse } from './dto/OffenderDetailsResponse'

describe('ArrangeAppointmentService', () => {
  let client: SinonStubbedInstance<RestClient>
  let factory: SinonStubbedInstance<RestClientFactory>
  let user: UserPrincipal
  let subject: ArrangeAppointmentService

  beforeEach(() => {
    user = fakeUserPrincipal()
    client = createStubInstance(RestClient)
    factory = createStubInstance(RestClientFactory)
    factory.build.withArgs('community', user).resolves(client as any)
    subject = new ArrangeAppointmentService(factory as any)
  })

  it('creates appointment', async () => {
    const dto = fakeAppointmentBuilderDto()
    const response = fakeAppointmentCreateResponse()
    const crn = faker.datatype.uuid()

    const stub = client.post
      .withArgs(
        AppointmentCreateResponse,
        `/secure/offenders/crn/${crn}/sentence/${dto.sentenceId}/appointments`,
        match.any,
      )
      .resolves(response)

    const returned = await subject.createAppointment(dto, crn, user)

    expect(returned).toBe(response)
    expect(stub.getCall(0).args[2]).toEqual({
      data: {
        appointmentStart: dto.appointmentStart.toISO(),
        appointmentEnd: dto.appointmentEnd.toISO(),
        contactType: dto.contactType.code,
        notes: dto.notes,
        officeLocationCode: dto.officeLocationCode,
        providerCode: dto.providerCode,
        requirementId: dto.requirementId,
        staffCode: dto.staffCode,
        teamCode: dto.teamCode,
      },
    })
  })

  it('gets offender details', async () => {
    const response = fakeOffenderDetailsResponse()
    const crn = faker.datatype.uuid()

    client.get.withArgs(OffenderDetailsResponse, `/secure/offenders/crn/${crn}`).resolves(response)

    const returned = await subject.getOffenderDetails(crn, user)

    expect(returned).toBe(response)
  })
})
