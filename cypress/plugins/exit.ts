import { SeedFn } from './wiremock'

export const exit: SeedFn = context => {
  context.client.delius.get('/NDelius-war/delius/JSP/deeplink.jsp').html('<h1>Delius Exit</h1>')
  context.client.oasys.get('').html('<h1>OASys Exit</h1>')
}
