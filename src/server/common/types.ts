export interface BreadcrumbValue {
  text: string
  href?: string
}

export interface ViewModel {
  breadcrumbs?: BreadcrumbValue[]
}
