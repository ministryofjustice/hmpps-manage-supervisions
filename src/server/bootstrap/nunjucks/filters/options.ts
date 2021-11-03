import { NunjucksFilter } from './types'
import { get } from 'lodash'

interface RadioListItem {
  value?: any
  text?: string
  divider?: string
  checked?: boolean
  conditional?: {
    html: string
  }
}

export interface ToRadioListOptions {
  otherHtml?: string
  alternate?: {
    divider: string
    items: any[]
    valuePath: string
    textPath: string
  }
}

export class ToRadioList extends NunjucksFilter {
  private static getRadioListItem(item: any, value: any, valuePath: string, textPath: string): RadioListItem {
    return {
      text: get(item, textPath),
      value: get(item, valuePath),
      checked: value && get(item, valuePath) === value,
    }
  }

  /**
   * Maps an array of models to the item list required by govukRadios.
   * @param items the data array to map
   * @param value the current, selected value. The option with matching value will be checked.
   * @param valuePath the lodash compatible path of the value to map.
   * @param textPath the lodash compatible path of the text to map.
   * @param otherHtml if provided then an 'Other' option is rendered that, when selected, will display the specified html.
   */
  filter(
    items: any[],
    value: any,
    valuePath: string,
    textPath: string,
    { otherHtml, alternate }: ToRadioListOptions = {},
  ): RadioListItem[] {
    const result: RadioListItem[] = items.map(x => ToRadioList.getRadioListItem(x, value, valuePath, textPath))

    if (otherHtml) {
      result.push({ text: 'Other', value: 'other', checked: value === 'other', conditional: { html: otherHtml } })
    }

    if (typeof alternate === 'object') {
      result.push({ divider: alternate.divider })
      result.push(
        ...alternate.items.map(x => ToRadioList.getRadioListItem(x, value, alternate.valuePath, alternate.textPath)),
      )
    }

    return result
  }
}

interface SelectListItem {
  value: any
  text: string
  selected?: boolean
  disabled?: boolean
}

export interface ToSelectListOptions {
  emptyValue?: boolean
}

export class ToSelectList extends NunjucksFilter {
  /**
   * Maps an array of models to the item list required by govukSelect.
   * @param arr the array to map
   * @param value the current, selected value. The option with matching value will be selected.
   * @param valuePath the lodash compatible path of the value to map.
   * @param textPath the lodash compatible path of the text to map.
   * @param emptyValue if true then render an empty, disabled value.
   */
  filter(
    arr: any[],
    value: any,
    valuePath: string,
    textPath: string,
    { emptyValue = true }: ToSelectListOptions = {},
  ): SelectListItem[] {
    const result: SelectListItem[] = arr.map(x => ({
      text: get(x, textPath),
      value: get(x, valuePath),
      selected: value && get(x, valuePath) === value,
    }))
    if (emptyValue) {
      const anySelected = result.some(x => x.selected)
      result.unshift({ text: '', value: '', selected: !anySelected, disabled: true })
    }
    return result
  }
}
