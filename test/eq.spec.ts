import { diff } from '../src/diff'
import { atomEq, domEq } from '../src/eq'
import { VList } from '../src/v'

// lists
let parent: any
let prev: any
let next: any

// spies
let append: jest.SpyInstance
let remove: jest.SpyInstance
let insert: jest.SpyInstance
let replace: jest.SpyInstance

const run = (eq, P = new VList(...prev)) => {
  parent = P
  append = jest.spyOn(parent, 'appendChild')
  remove = jest.spyOn(parent, 'removeChild')
  insert = jest.spyOn(parent, 'insertBefore')
  replace = jest.spyOn(parent, 'replaceChild')
  diff(eq, parent, next, [...prev])
}

describe('eq', () => {
  it('case 1', () => {
    prev = [['text'], ['div'], ['span']]
    next = [['div'], ['div'], ['text'], ['span']]

    run(atomEq)

    expect(parent).toMatchSnapshot()
  })

  it('case 2', () => {
    const r = [['text'], ['text'], ['div'], ['span']]
    prev = [r[0], r[1], ['div'], ['span']]
    next = [r[1], r[2], r[3], r[0]]

    run(atomEq)

    expect(parent).toMatchSnapshot()
  })

  it('case 3', () => {
    prev = [
      ['foo', { key: 1, ref: true }],
      ['foo', { key: 2, ref: true }],
      ['foo', { key: 3, ref: true }],
    ]
    next = [
      ['foo', { key: 1 }],
      ['foo', { key: 3 }],
    ]

    run(atomEq)

    expect(parent).toMatchSnapshot()
  })

  it('case 4', () => {
    prev = [['foo'], ['foo'], ['foo']]
    next = [['bar']]

    run(domEq)

    expect(parent).toMatchSnapshot()
  })

  it('case 5', () => {
    parent = document.createElement('div')
    prev = [
      document.createElement('span'),
      document.createElement('span'),
      document.createElement('span'),
    ]

    parent.append(...prev)
    expect(parent).toMatchSnapshot()

    next = [new Comment()]

    run(domEq, parent)

    expect(parent).toMatchSnapshot()
    expect(insert).toHaveBeenCalledTimes(0)
    expect(remove).toHaveBeenCalledTimes(2)
    expect(append).toHaveBeenCalledTimes(0)
    expect(replace).toHaveBeenCalledTimes(1)
  })
})
