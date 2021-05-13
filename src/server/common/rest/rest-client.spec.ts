import * as faker from 'faker'
import * as nock from 'nock'
import { RestClient, RestClientError } from './rest-client'
import { fakeConfig } from '../../config/config.fake'
import { ApiConfig } from '../../config'
import { Expose } from 'class-transformer'
import { HttpService } from '@nestjs/common'

class DummyDto {
  @Expose()
  id: number

  @Expose()
  name: string
}

function fakeDummyDto(): Partial<DummyDto> {
  return {
    id: faker.datatype.number(),
    name: faker.lorem.sentence(),
  }
}

describe('RestClient', () => {
  let config: ApiConfig
  let token: string
  let subject: RestClient

  beforeEach(() => {
    config = fakeConfig().apis.community
    token = faker.internet.password()
    const http = new HttpService()
    subject = new RestClient(http, 'test', config, token)
  })

  function havingApi() {
    return nock(config.url).matchHeader('authorization', `Bearer ${token}`)
  }

  it('successfully getting', async () => {
    const dto = fakeDummyDto()
    const query = { name: 'some-name' }
    havingApi().get('/some/path').query(query).reply(200, dto)
    const observed = await subject.get(DummyDto, '/some/path', { query })
    expect(observed).toBeInstanceOf(DummyDto)
    expect(observed).toEqual(dto)
  })

  it('successfully getting after retry', async () => {
    const dto = fakeDummyDto()
    const bad = havingApi().get('/some/path').reply(404, { message: 'not found' })
    const ok = havingApi().get('/some/path').reply(200, dto)
    const observed = await subject.get(DummyDto, '/some/path')
    expect(observed).toBeInstanceOf(DummyDto)
    expect(observed).toEqual(dto)
    expect(bad.isDone()).toBe(true)
    expect(ok.isDone()).toBe(true)
  })

  it('successfully getting many', async () => {
    const dtos = [fakeDummyDto(), fakeDummyDto()]
    havingApi().get('/some/path').reply(200, dtos)
    const observed = await subject.get<DummyDto[]>(DummyDto, '/some/path')
    expect(observed).toEqual(dtos)
  })

  it('failed to get', async () => {
    havingApi().get('/some/path').times(3).reply(404, { message: 'bad request' })
    await expect(subject.get(DummyDto, '/some/path')).rejects.toThrow(RestClientError)
  })

  it('successfully posting', async () => {
    const dto = fakeDummyDto()
    const data = { name: 'some-name' }
    havingApi().post('/some/path', data).reply(200, dto)
    const observed = await subject.post(DummyDto, '/some/path', { data })
    expect(observed).toBeInstanceOf(DummyDto)
    expect(observed).toEqual(dto)
  })

  it('successfully putting', async () => {
    const dto = fakeDummyDto()
    const data = { name: 'some-name' }
    havingApi().put('/some/path', data).reply(200, dto)
    const observed = await subject.put(DummyDto, '/some/path', { data })
    expect(observed).toBeInstanceOf(DummyDto)
    expect(observed).toEqual(dto)
  })

  it('successfully patching', async () => {
    const dto = fakeDummyDto()
    const data = { name: 'some-name' }
    havingApi().patch('/some/path', data).reply(200, dto)
    const observed = await subject.patch(DummyDto, '/some/path', { data })
    expect(observed).toBeInstanceOf(DummyDto)
    expect(observed).toEqual(dto)
  })

  it('successfully deleting', async () => {
    const dto = fakeDummyDto()
    havingApi().delete('/some/path').reply(200, dto)
    const observed = await subject.delete(DummyDto, '/some/path')
    expect(observed).toBeInstanceOf(DummyDto)
    expect(observed).toEqual(dto)
  })
})
