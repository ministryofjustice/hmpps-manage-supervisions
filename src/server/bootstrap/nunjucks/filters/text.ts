import { kebabCase } from 'lodash'
import { NunjucksFilter } from './types'
import { runtime } from 'nunjucks'

export class FullStop extends NunjucksFilter {
  filter(value: string): any {
    if (!value) {
      return value
    }

    value = value.trim()
    return value.endsWith('.') ? value : value + '.'
  }
}

export class Brackets extends NunjucksFilter {
  filter(value: string): any {
    if (!value) {
      return ''
    }
    return `(${value})`
  }
}

export class Slug extends NunjucksFilter {
  filter(value: string): any {
    if (!value) {
      return ''
    }
    return kebabCase(value)
  }
}

enum Abbreviation {
  CRN = 'Case reference number',
  PNC = 'Police national computer',
  RAR = 'Rehabilitation activity requirement',
}

export class Abbr extends NunjucksFilter {
  filter(value: Abbreviation): string {
    if (!Abbreviation[value]) throw new Error(`Undefined abbreviation: ${value}`)

    return `<abbr title="${Abbreviation[value]}">${value}</abbr>`
  }
}

function unwrapString(value: any): string {
  if (!value) {
    return value
  }
  switch (typeof value) {
    case 'string':
      return value
    case 'object':
      return value instanceof runtime.SafeString ? value.val : value.toString()
  }

  return value.toString()
}

/**
 * equivalent to:
 * "foo\nbar" | striptags(true) | escape | nl2br | safe
 */
export class Nl2brSafe extends NunjucksFilter {
  private readonly safe = this.environment.getFilter('safe')
  private readonly nl2br = this.environment.getFilter('nl2br')
  private readonly escape = this.environment.getFilter('escape')
  private readonly striptags = this.environment.getFilter('striptags')

  filter(value: any): any {
    const s = unwrapString(value)
    if (!s) {
      return s
    }

    return this.safe(this.nl2br(this.escape(this.striptags(value, true))))
  }
}

/**
 * Used for formatting "Notes" type fields with sensible defaults:
 * "foo\nbar"
 *    | striptags(true) # To remove evil tags from untrusted user input
 *    | escape          # Convert <, > etc to HTML-safe entities
 *    | nl2br           # Convert all \n newlines to <br>
 *    | urlize          # Convert all http://gov.uk urls to <a> anchor tags
 *    | safe            # Mark the final string as safe to output with HTML
 */
export class SafeNotes extends NunjucksFilter {
  private readonly safe = this.environment.getFilter('safe')
  private readonly urlize = this.environment.getFilter('urlize')
  private readonly nl2br = this.environment.getFilter('nl2br')
  private readonly escape = this.environment.getFilter('escape')
  private readonly striptags = this.environment.getFilter('striptags')

  filter(value: any): any {
    const s = unwrapString(value)
    if (!s) {
      return s
    }

    return this.safe(this.urlize(this.nl2br(this.escape(this.striptags(value, true)))))
  }
}

export class NoOrphans extends NunjucksFilter {
  filter(value: any): any {
    const indexOflastSpace = value.lastIndexOf(' ')
    if (indexOflastSpace === -1) {
      return value
    }

    const begin = value.substring(0, indexOflastSpace)
    const end = value.substring(indexOflastSpace + 1)
    return `${begin}&nbsp;${end}`
  }
}
