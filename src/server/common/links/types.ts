export enum BreadcrumbType {
  Cases,
  Case,
  PersonalDetails,
  PersonalAddresses,
  PersonalDisabilities,
  PersonalCircumstances,
  PersonalContact,
  CaseSentence,
  CasePreviousConvictions,
  Compliance,
  CaseActivityLog,
  CaseSchedule,
  CaseRisk,
  NewAppointment,
  Appointment,
  OtherCommunication,
  RemovedRisksList,
  RiskDetails,
  RemovedRiskDetails,
  ExitToDelius,
}

export interface ResolveBreadcrumbOptions {
  id?: string | number
  entityName?: string
  crn?: string
  offenderName?: string
}

export interface BreadcrumbMeta {
  type: BreadcrumbType
  title: string | ((options: ResolveBreadcrumbOptions) => string)
  parent?: BreadcrumbType
}
