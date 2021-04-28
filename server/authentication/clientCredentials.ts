import { ConfigService } from '../config'

const config = ConfigService.INSTANCE

export default function generateOauthClientToken(
  clientId: string = config.apis.hmppsAuth.apiClientCredentials.id,
  clientSecret: string = config.apis.hmppsAuth.apiClientCredentials.secret
): string {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  return `Basic ${token}`
}
