import './sass/application.sass'
import * as govuk from 'govuk-frontend'
import '@ministryofjustice/frontend'
import * as accessibleAutocomplete from 'accessible-autocomplete'
import flatMap = require('lodash/flatMap')

govuk.initAll()

const times = flatMap([9, 10, 11, 12, 13, 14, 15, 16], x => {
  const hrs = x > 12 ? x - 12 : x
  const suffix = x >= 12 ? 'pm' : 'am'
  return [`${hrs}:00${suffix}`, `${hrs}:15${suffix}`, `${hrs}:30${suffix}`, `${hrs}:45${suffix}`]
})

const enhanceInputElement = configurationOptions => {
  if (configurationOptions.id === undefined) {
    configurationOptions.id = configurationOptions.element.id
  }

  configurationOptions.defaultValue = configurationOptions.element.value
  configurationOptions.name = configurationOptions.element.name

  const element = document.createElement('div')
  element.style.maxWidth = '110px'

  configurationOptions.element.parentNode.insertBefore(element, configurationOptions.element)

  accessibleAutocomplete({
    ...configurationOptions,
    element,
  })

  configurationOptions.element.remove()
}

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Progressively enhance any <select data-enhance="accessible-autocomplete"> element.
   */
  Array.prototype.forEach.call(document.querySelectorAll('select[data-enhance="accessible-autocomplete"]'), x => {
    accessibleAutocomplete.enhanceSelectElement({
      selectElement: x as HTMLElement,
      showAllValues: true,
      defaultValue: '',
      autoselect: false,
      displayMenu: 'overlay',
    })
  })

  Array.prototype.forEach.call(document.querySelectorAll('.time-input'), x => {
    enhanceInputElement({
      element: x,
      source: times,
      showAllValues: true,
      showNoOptionsFound: false,
    })
  })
})
