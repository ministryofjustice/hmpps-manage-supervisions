import './sass/application.sass'
import * as $ from 'jquery'
import 'jquery-ui'
import * as govuk from 'govuk-frontend'
import '@ministryofjustice/frontend'
import * as accessibleAutocomplete from 'accessible-autocomplete'

govuk.initAll()

$(() => {
  /**
   * Progressively enhance any <select data-enhance="accessible-autocomplete"> element.
   */
  $('select[data-enhance="accessible-autocomplete"]').each((i, x) => {
    accessibleAutocomplete.enhanceSelectElement({
      selectElement: x,
      showAllValues: true,
      defaultValue: '',
      autoselect: false,
      displayMenu: 'overlay',
    })
  })
})
