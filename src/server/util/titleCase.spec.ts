import { titleCase } from './titleCase'

describe('Convert to title case', () => {
  it('null string', () => {
    expect(titleCase(null)).toEqual('')
  })
  it('empty string', () => {
    expect(titleCase('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(titleCase('robert')).toEqual('Robert')
  })
  it('Upper Case', () => {
    expect(titleCase('ROBERT')).toEqual('Robert')
  })
  it('Mixed Case', () => {
    expect(titleCase('RoBErT')).toEqual('Robert')
  })
  it('Multiple words', () => {
    expect(titleCase('RobeRT SMiTH')).toEqual('Robert Smith')
  })
  it('Leading spaces', () => {
    expect(titleCase('  RobeRT')).toEqual('  Robert')
  })
  it('Trailing spaces', () => {
    expect(titleCase('RobeRT  ')).toEqual('Robert  ')
  })
  it('Hyphenated', () => {
    expect(titleCase('Robert-John SmiTH-jONes-WILSON')).toEqual('Robert-John Smith-Jones-Wilson')
  })
})
