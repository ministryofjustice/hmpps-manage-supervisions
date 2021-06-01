import { ColumnType, ToTableRows } from './table'

describe('ToTableRows', () => {
  it('generates all column types', () => {
    const data = [
      { a: 'text1', b1: 'link1', b2: 'href1', c: '2021-05-26', d1: '12:00', d2: '12:30' },
      { a: 'text2', b1: 'link2', b2: 'href2', c: '2021-05-27', d1: '14:00', d2: '15:00' },
    ]
    const observed = new ToTableRows().filter(data, [
      { type: ColumnType.Text, path: 'a', classes: 'some-class' },
      { type: ColumnType.Link, path: 'b1', href: 'b2', attributes: { key: 'value' } },
      { type: ColumnType.LongDate, path: 'c' },
      { type: ColumnType.TimeRange, from: 'd1', to: 'd2' },
    ])
    expect(observed).toEqual([
      [
        { text: 'text1', classes: 'some-class' },
        { html: `<a href="href1">link1</a>`, attributes: { key: 'value' } },
        { text: 'Wednesday 26 May 2021' },
        { text: '12pm to 12:30pm' },
      ],
      [
        { text: 'text2', classes: 'some-class' },
        { html: `<a href="href2">link2</a>`, attributes: { key: 'value' } },
        { text: 'Thursday 27 May 2021' },
        { text: '2pm to 3pm' },
      ],
    ])
  })
})