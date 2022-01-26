/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, Hook, current, h, render } from '../../src'

let c: HTMLDivElement

const html = () => c.innerHTML
const $ = (sel: string) => c.querySelector(sel)!
const $$ = (sel: string) => c.querySelectorAll(sel)!

beforeEach(() => {
  c = document.createElement('div')
})

describe('keyed', () => {
  it('inherit keys', () => {
    const Foo = ({ key }: { key: number }) => <li>{key}</li>
    render(
      <>
        {[1, 2, 3].map(x => (
          <Foo key={x} />
        ))}
      </>,
      c
    )
    expect(html()).toMatchSnapshot()
    const lis = $$('li')
    expect(lis.length).toEqual(3)
    render(
      <>
        {[0, 1, 2, 3].map(x => (
          <Foo key={x} />
        ))}
      </>,
      c
    )
    expect(html()).toMatchSnapshot()
    const res = $$('li')
    expect(res.length).toEqual(4)
    expect(res[1]).toBe(lis[0])
  })

  it('reorder', () => {
    const randomly = () => (Math.random() > 0.85 ? Math.random() - 0.5 : 0)
    let i = 0
    const Bar = () => (
      <>
        {i++} <span>one</span> two
      </>
    )
    const Foo = () => (
      <p>
        {Array.from({ length: 20 + ((Math.random() * 10) | 0) })
          .map((_, i) => <Bar key={i} />)
          .sort(randomly)}
      </p>
    )
    for (let i = 0; i < 10; i++) {
      render(
        <div>
          and lets make it
          <Foo />
          <div>
            {[1, 2, 3].map(x => (
              <div>{x}</div>
            ))}
            a little<span style="color:blue">more realistic</span>
          </div>
        </div>,
        c
      )
    }
  })

  it('does not leak hooks', () => {
    const hooks: Set<Hook> = new Set()
    let xx = 1
    const Bar = ({ key }: { key: number }) => {
      hooks.add(current.hook!)
      return (
        <li>
          {xx === key && (
            <div>
              <span>1</span>
              <span>2</span>
              <span>3</span>
            </div>
          )}
        </li>
      )
    }
    const Foo = () => {
      hooks.add(current.hook!)
      return (
        <ul>
          {[1, 2, 3].map(x => (
            <Bar key={x} />
          ))}
        </ul>
      )
    }
    render(<Foo />, c)
    expect(html()).toMatchSnapshot()
    const lis = $$('li')
    expect(lis.length).toEqual(3)
    xx = 2
    expect(hooks.size).toEqual(4)
    ;[...hooks][0].trigger()
    expect(html()).toMatchSnapshot()
    expect(hooks.size).toEqual(4)
    hooks.forEach(hook => hook.trigger())
    expect(hooks.size).toEqual(4)
    expect(html()).toMatchSnapshot()
    hooks.forEach(hook => hook.trigger())
    expect(hooks.size).toEqual(4)
    expect(html()).toMatchSnapshot()
  })
})
