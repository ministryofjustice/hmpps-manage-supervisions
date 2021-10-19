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
  CaseActivityLogWithComplianceFilter,
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

export enum UtmSource {
  App = 'app',
}

export enum UtmMedium {
  Breadcrumb = 'breadcrumb',
  Personal = 'personal',
  ActivityLog = 'activity-log',
  Risk = 'risk',
  Compliance = 'compliance',
  Sentence = 'sentence',
}

export interface Utm {
  /**
   * The source of the link, the default is 'app' i.e. we're generating the links for ourselves.
   */
  source?: UtmSource
  medium: UtmMedium
  campaign: string
  content?: Record<string, any>
}

export interface RawUtm {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content?: string
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

  utm?: Utm
}

export interface BreadcrumbMeta {
  type: BreadcrumbType
  title: string | ((options: ResolveBreadcrumbOptions) => string)
  parent?: BreadcrumbType
  requiresUtm?: boolean
}
