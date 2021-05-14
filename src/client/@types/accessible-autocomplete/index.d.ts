declare module 'accessible-autocomplete' {
  interface AccessibleAutoCompleteOptionsBase {
    /**
     * Set to true to highlight the first option when the user types in something and receives results. Pressing enter will select it.
     * (default: false)
     */
    autoselect?: boolean

    /**
     * The autocomplete will confirm the currently selected option when the user clicks outside of the component. Set to false to disable.
     * (default: true)
     */
    confirmOnBlur?: boolean

    /**
     * Use this property to override the BEM block name that the JavaScript component will use. You will need to rewrite the CSS class names to use your specified block name.
     * (default: 'autocomplete')
     */
    cssNamespace?: string

    /**
     * Specify a string to prefill the autocomplete with.
     * (default: '')
     */
    defaultValue?: string

    /**
     * You can set this property to specify the way the menu should appear, whether inline or as an overlay.
     * (default: 'inline')
     */
    displayMenu?: 'inline' | 'overlay'

    /**
     * The minimum number of characters that should be entered before the autocomplete will attempt to suggest options.
     * When the query length is under this, the aria status region will also provide helpful text to the user informing them they should type in more.
     * (default: 0)
     */
    minLength?: number

    /**
     * The name for the autocomplete input field, to use with a parent <form>.
     * (default: 'input-autocomplete')
     */
    name?: string

    /**
     * This function will be called when the user confirms an option, with the option they've confirmed.
     * (default: () => {})
     */
    onConfirm?: (confirmed: any) => void

    /**
     * This option will populate the placeholder attribute on the input element.
     * (default: '') ⚠️ not recommended ⚠️
     */
    placeholder?: string

    /**
     * The input field will be rendered with a required attribute,
     * (default: false)
     */
    required?: boolean

    /**
     * If this is set to true, all values are shown when the user clicks the input.
     * This is similar to a default dropdown, so the autocomplete is rendered with a dropdown arrow to convey this behaviour.
     * (default: false)
     */
    showAllValues?: boolean

    /**
     * The autocomplete will display a "No results found" template when there are no results. Set to false to disable.
     */
    showNoOptionsFound?: boolean

    templates?: {
      /**
       * inputValue is a function that receives one argument, the currently selected suggestion.
       * It returns the string value to be inserted into the input.
       */
      inputValue?: (selected: string) => string

      /**
       * suggestion is a function that receives one argument, a suggestion to be displayed.
       * It is used when rendering suggestions, and should return a string, which can contain HTML.
       * ⚠️ Caution: because this function allows you to output arbitrary HTML, you should make sure it's trusted, and accessible.
       */
      suggestion?: (suggestion: string) => string
    }

    /**
     * A function that gets passed an object with the property className ({ className: '' }) and should return a string of HTML.
     * ⚠️ Caution: because this function allows you to output arbitrary HTML, you should make sure it's trusted, and accessible.
     * (default: A rectangle pointing down)
     */
    dropdownArrow?: ({ className: string }) => string
  }

  interface AccessibleAutoCompleteOptions extends AccessibleAutoCompleteOptionsBase {
    /**
     * The container element in which the autocomplete will be rendered in.
     */
    element: HTMLElement

    /**
     * The id to assign to the autocomplete input field, to use with a <label for=id>.
     */
    id: string

    /**
     * An array of values to search when the user types in the input field,
     * or a function to take what the user types and call a callback function with the results to be displayed.
     */
    source: string[] | ((query: string, populateResults: (results: string) => void) => void)
  }

  interface EnhanceSelectElementOptions extends AccessibleAutoCompleteOptionsBase {
    /**
     * The instance of HTMLSelectElement to enhance.
     */
    selectElement: HTMLElement

    /**
     * Preserve options with no value in the autcomplete.
     */
    preserveNullOptions?: boolean
  }

  /**
   * Progressively enhance an existing select list.
   *
   * 1. Place an autocomplete input field after the specified <select>
   * 2. Default the autocomplete autoselect to true
   * 3. Default the autocomplete defaultValue to the select's option[selected]
   * 4. Default the autocomplete id to the <select>'s id
   * 5. Default the autocomplete name attribute to '' to prevent it being included in form submissions
   * 6. Default the autocomplete source to use existing <option>s from the <select>
   * 7. Hide the <select> using inline display: none
   * 8. Set the <select>'s id to ${id}-select to decouple from any <label>
   * 9. Upon confirming a value in the autocomplete, update the original <select>
   */
  function enhanceSelectElement(options: EnhanceSelectElementOptions)
}
