import { h, render } from '../src'

let c: HTMLDivElement

const html = () => c.innerHTML
// const $ = (sel: string) => c.querySelector(sel)!
// const $$ = (sel: string) => c.querySelectorAll(sel)!

beforeEach(() => {
  c = document.createElement('div')
})

describe('render', () => {
  it('single div', () => {
    render(<div></div>, c)
    expect(html()).toEqual('<div></div>')
  })
})
