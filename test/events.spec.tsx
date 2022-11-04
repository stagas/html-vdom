// @env browser
/** @jsxImportSource ../src */
import { render } from '../src/jsx-runtime'

const r = (jsx: any, div = document.createElement('div')) => {
  render(jsx, div)
  return div
}

// const o = (jsx: any, div?: any) => r(jsx, div).innerHTML

describe('events', () => {
  describe('render', () => {
    it('simple', () => {
      let clicked = 0
      const onclick = () => {
        clicked++
      }
      const result = r(<button onclick={onclick} />)
      expect(result.innerHTML).toMatchSnapshot()
      expect(clicked).toBe(0)
      result.querySelector('button')!.click()
      expect(clicked).toBe(1)
    })

    it('replace', () => {
      let clickedOne = 0
      const onclickOne = () => {
        clickedOne++
      }

      let clickedTwo = 0
      const onclickTwo = () => {
        clickedTwo++
      }

      let result = r(<button onclick={onclickOne} />)
      expect(result.innerHTML).toMatchSnapshot()
      expect(clickedOne).toBe(0)
      const button = result.querySelector('button')!
      button.click()
      expect(clickedOne).toBe(1)

      result = r(<button onclick={onclickTwo} />, result)
      expect(result.innerHTML).toMatchSnapshot()
      expect(clickedTwo).toBe(0)
      button.click()
      expect(clickedTwo).toBe(1)
      expect(clickedOne).toBe(1)
    })
  })
})
