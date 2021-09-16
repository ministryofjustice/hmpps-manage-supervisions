export enum BreadcrumbType {
  Cases,
  Case,
  PersonalDetails,
  PersonalAddresses,
  PersonalDisabilities,
  PersonalCircumstances,
  PersonalContact,
  CaseSentence,
  CaseSentenceOffences,
  CasePreviousConvictions,
  Compliance,
  CaseActivityLog,
  CaseSchedule,
  CaseRisk,
  NewAppointment,
  Appointment,
  Communication,
  OtherActivityLogEntry,
  RemovedRisksList,
  RiskDetails,
  RemovedRiskDetails,
  ExitToDelius,
  ExitToOASys,
}

export interface ResolveBreadcrumbOptions {
  id?: string | number
  entityName?: string
  crn?: string
  offenderName?: string

  /**
   * Override some parent meta.
   */
  parentOverrides?: Partial<Record<BreadcrumbType, BreadcrumbType>>
}

export interface BreadcrumbMeta {
  type: BreadcrumbType
  title: string | ((options: ResolveBreadcrumbOptions) => string)
  parent?: BreadcrumbType
}
