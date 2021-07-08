export enum BreadcrumbType {
  Cases,
  Case,
  PersonalDetails,
  PersonalAddresses,
  PersonalDisabilities,
  PersonalCircumstances,
  CaseSentence,
  CaseActivityLog,
  CaseSchedule,
  NewAppointment,
}

export interface ResolveBreadcrumbOptions {
  crn?: string
  offenderName?: string
}

export interface BreadcrumbMeta {
  type: BreadcrumbType
  title: string | ((options: ResolveBreadcrumbOptions) => string)
  parent?: BreadcrumbType
}
