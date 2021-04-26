import { Service } from 'typedi'
import { ExampleDto } from './example.dto'

@Service()
export class ExampleService {
  async get(): Promise<ExampleDto> {
    return new ExampleDto()
  }
}
