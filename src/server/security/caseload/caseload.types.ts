export class NonCaseloadAccessError extends Error {
  constructor(readonly crn: string, readonly username: string) {
    super(`offender with crn '${crn}' is not on the caseload for user '${username}'`)
  }
}
