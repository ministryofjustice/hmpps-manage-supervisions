export enum BreadcrumbType {
  Cases,
  Case,
  PersonalDetails,
  PersonalAddresses,
  PersonalDisabilities,
  PersonalCircumstances,
  PersonalContact,
  CaseSentence,
  Compliance,
  CaseActivityLog,
  CaseSchedule,
  CaseRisk,
  NewAppointment,
  Appointment,
  OtherCommunication,
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
