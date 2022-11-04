// @env browser

/** @jsxImportSource ../src */
// import { fromElement } from '../src/from-element'
import { render } from '../src/jsx-runtime'

let t: HTMLDivElement

const html = () => t.innerHTML

beforeEach(() => {
  t = document.createElement('div')
})

describe('props', () => {
  describe('svg', () => {
    it('update', () => {
      render(
        <svg viewBox="0 0 10 10">
          <path pathLength="90" />
        </svg>,
        t
      )
      expect(html()).toEqual('<svg viewBox="0 0 10 10"><path pathLength="90"></path></svg>')
      render(
        <svg viewBox="0 0 20 20">
          <path pathLength="50" />
        </svg>,
        t
      )
      expect(html()).toEqual('<svg viewBox="0 0 20 20"><path pathLength="50"></path></svg>')
    })
  })
})
