export enum DeploymentEnvironment {
  Local = 'local',
  Dev = 'dev',
}

export class Env {
  static get deployment(): DeploymentEnvironment {
    return this.get('DEPLOYMENT_ENV')
  }

  static get username() {
    return this.get('HMPPS_USERNAME')
  }

  static get password() {
    return this.get('HMPPS_PASSWORD')
  }

  private static get(name: string) {
    const value = Cypress.env(name)
    if (!value) {
      throw new Error(`environment variable '${name}' is required`)
    }
    return value
  }
}
