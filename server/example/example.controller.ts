import { validate } from 'class-validator'
import { ViewModel, Body, Controller, Get, Param, Post, Query, Render, Res, RedirectException } from '../mvc'
import { ExampleDto } from './example.dto'
import { ExampleService } from './example.service'

export interface ExampleViewModel extends ViewModel<ExampleDto> {
  id: number
  name?: string
}

/**
 * Example get-post(validate)-redirect
 */
@Controller('/example')
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  @Get('/:id(\\d+)')
  @Render('pages/example/index')
  async get(
    @Param('id') id: number,
    @Query('name') name: string | undefined,
    @Res() response: any // as an example, you can also get @Req
  ): Promise<ExampleViewModel> {
    const dto = await this.service.get()
    return { id, name, dto }
  }

  @Post('/:id(\\d+)')
  @Render('pages/example/index')
  async post(@Param('id') id: number, @Body() dto: ExampleDto): Promise<ExampleViewModel | null> {
    const errors = await validate(dto)
    if (errors.length === 0) {
      throw new RedirectException(`/example/${id}/result`)
    }
    return { id, dto, errors }
  }

  @Get('/:id(\\d+)/result')
  @Render('pages/example/result')
  async result(@Param('id') id: number): Promise<ExampleViewModel> {
    const dto = await this.service.get()
    return { id, dto }
  }
}
