import './sass/application.sass'
import * as govuk from 'govuk-frontend'
import '@ministryofjustice/frontend'
import * as accessibleAutocomplete from 'accessible-autocomplete'

govuk.initAll()

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Progressively enhance any <select data-enhance="accessible-autocomplete"> element.
   */
  document.querySelectorAll('select[data-enhance="accessible-autocomplete"]').forEach(x => {
    accessibleAutocomplete.enhanceSelectElement({
      selectElement: x as HTMLElement,
      showAllValues: true,
      defaultValue: '',
      autoselect: false,
      displayMenu: 'overlay',
    })
  })
})
