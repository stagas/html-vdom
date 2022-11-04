// @env browser
/** @jsxImportSource ../src */
import { Hook, hook, render } from '../src/jsx-runtime'

const r = (jsx: any, div = document.createElement('div')) => {
  render(jsx, div)
  return div
}

const o = (jsx: any, div?: any) => r(jsx, div).innerHTML

describe('all', () => {
  describe('render', () => {
    it('simple', () => {
      expect(o(<div />)).toMatchSnapshot()
    })

    it('functional simple', () => {
      const Foo = () => <div></div>
      expect(o(<Foo />)).toMatchSnapshot()
    })

    it('functional nested', () => {
      const Bar = ({ label }: any) => <p>{label}</p>
      const Foo = () => (
        <div>
          <Bar label="a" />
          <Bar label="b" />
        </div>
      )
      expect(o(<Foo />)).toMatchSnapshot()
    })

    it('two levels', () => {
      expect(
        o(
          <div>
            <p>hi</p>
          </div>
        )
      ).toMatchSnapshot()
    })

    it('fragment', () => {
      expect(
        o(
          <>
            <a />
            <b />
          </>
        )
      ).toMatchSnapshot()
    })

    it('text child', () => {
      expect(o(<p>hi</p>)).toMatchSnapshot()
    })

    it('multiple text childs', () => {
      const v = 'there'
      expect(o(<p>hi {v}</p>)).toMatchSnapshot()
    })
  })

  describe('patch', () => {
    it('replace node', () => {
      const el = r(<div />)
      expect(el.innerHTML).toMatchSnapshot()
      expect(o(<p />, el)).toMatchSnapshot()
    })

    it('functional update', () => {
      let i = 0
      const Foo = () => <div>{i++}</div>
      const el = r(<Foo />)
      const first = el.firstChild
      expect(el.innerHTML).toMatchSnapshot()
      expect(o(<Foo />, el)).toMatchSnapshot()
      expect(el.firstChild === first).toBe(true)
    })

    it('hook update', () => {
      let i = 0
      let h!: Hook
      const Foo = () => {
        h = hook
        return <div>{i++}</div>
      }
      const el = r(<Foo />)
      const first = el.firstChild
      expect(el.innerHTML).toMatchSnapshot()
      h()
      expect(el.innerHTML).toMatchSnapshot()
      expect(el.firstChild === first).toBe(true)
    })

    it('hook onremove', () => {
      let i = 0
      let h!: Hook
      const Foo = () => {
        h = hook
        return <div>{i++}</div>
      }
      const el = r(<Foo />)
      expect(el.innerHTML).toMatchSnapshot()
      let count = 0
      h.onremove = () => count++
      // console.log('---------------')
      h()
      expect(el.innerHTML).toMatchSnapshot()
      expect(count).toBe(0)
      expect(o(<></>, el)).toMatchSnapshot()
      expect(count).toBe(1)
    })

    it('hook is same object', () => {
      let h!: Hook
      const Foo = () => {
        h = hook
        h.i ??= 0
        return <div>{h.i++}</div>
      }
      const el = r(<Foo />)
      expect(el.innerHTML).toMatchSnapshot()
      h()
      expect(el.innerHTML).toMatchSnapshot()
      h()
      expect(el.innerHTML).toMatchSnapshot()
    })

    it('hook update single first undefined', () => {
      let i = 0
      let h!: Hook
      const Foo = () => {
        h = hook
        return i++ < 1 ? void 0 : i
      }
      const el = r(<Foo />)
      expect(el.innerHTML).toMatchSnapshot()
      h()
      expect(el.innerHTML).toMatchSnapshot()
    })

    it('hook update sibling first undefined', () => {
      let i = 0
      let h!: Hook
      const Foo = () => {
        if (!h) h = hook
        return i++ < 1 ? void 0 : i
      }
      const el = r(
        <>
          <Foo />
          <Foo />
        </>
      )
      expect(el.innerHTML).toMatchSnapshot()
      h()
      expect(el.innerHTML).toMatchSnapshot()
    })

    it('hook siblings update', () => {
      let i = 0
      let h!: Hook
      const Foo = () => {
        if (!h) h = hook
        return <div>{i++}</div>
      }
      const el = r(
        <>
          <Foo />
          <Foo />
        </>
      )
      const first = el.firstChild
      expect(el.innerHTML).toMatchSnapshot()
      h()
      expect(el.innerHTML).toMatchSnapshot()
      expect(el.firstChild === first).toBe(true)
    })

    it('hook siblings keyed update', () => {
      let i = 0
      let h!: Hook
      const Foo = () => {
        if (!h) h = hook
        return <div>{i++}</div>
      }
      const el = r(
        <>
          <Foo key="a" />
          <Foo key="b" />
        </>
      )
      const first = el.firstChild
      expect(el.innerHTML).toMatchSnapshot()
      h()
      expect(el.innerHTML).toMatchSnapshot()
      expect(el.firstChild === first).toBe(true)
    })

    it('functional nested update', () => {
      let i = 0
      const Bar = ({ label }: any) => <p>{label}</p>
      const Foo = () => (
        <div>
          <Bar label={++i} />
          <Bar label={++i} />
        </div>
      )
      const el = r(<Foo />)
      const first = el.firstChild!
      const firstFirst = first.firstChild
      expect(el.innerHTML).toMatchSnapshot()
      expect(o(<Foo />, el)).toMatchSnapshot()
      expect(el.firstChild === first).toBe(true)
      expect(el.firstChild!.firstChild === firstFirst).toBe(true)
    })

    it('functional nested drop', () => {
      let i = 0
      const Bar = ({ label }: any) => <p>{label}</p>
      const Foo = ({ count }: any) => (
        <div>
          {Array(count)
            .fill(0)
            .map(() => <Bar label={++i} />)}
        </div>
      )
      const el = r(<Foo count={2} />)
      const first = el.firstChild!
      const firstFirst = first.firstChild
      expect(el.innerHTML).toMatchSnapshot()
      expect(o(<Foo count={1} />, el)).toMatchSnapshot()
      expect(el.firstChild === first).toBe(true)
      expect(el.firstChild!.firstChild === firstFirst).toBe(true)
    })

    it('drop one node', () => {
      const el = r(
        <>
          <a />
          <b />
          <c />
        </>
      )
      const els = [...el.childNodes]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <a />
            <b />
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.childNodes]
      expect(els[0]).toBe(res[0])
      expect(els[1]).toBe(res[1])
    })

    it('two drop one', () => {
      const el = r(
        <>
          <a />
          <b />
        </>
      )
      const els = [...el.childNodes]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <a />
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.childNodes]
      expect(els[0]).toBe(res[0])
    })

    it('two drop first', () => {
      const el = r(
        <>
          <a />
          <b />
        </>
      )
      // const els = [...el.childNodes]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <b />
          </>,
          el
        )
      ).toMatchSnapshot()
      // const res = [...el.childNodes]
      // expect(els[0]).toBe(res[0])
    })

    it('keyed two drop first', () => {
      const el = r(
        <>
          <a key="a" />
          <b key="b" />
        </>
      )
      const els = [...el.childNodes]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <b key="b" />
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.childNodes]
      expect(els[1]).toBe(res[0])
    })

    it('replace text', () => {
      const el = r(<p>hi</p>)
      const first = el.firstChild!
      const text = first.firstChild
      expect(el.innerHTML).toMatchSnapshot()
      expect(o(<p>there</p>, el)).toMatchSnapshot()
      expect(el.firstChild).toBe(first)
      expect(el.firstChild!.firstChild).toBe(text)
    })

    it('insert text node', () => {
      const el = r(<p>hi</p>)
      const first = el.firstChild!
      // const text = first.firstChild
      const v = 'hey'
      expect(el.innerHTML).toMatchSnapshot()
      expect(o(<p>{v} hi</p>, el)).toMatchSnapshot()
      expect(el.firstChild).toBe(first)
      // expect(el.firstChild!.firstChild).toBe(text)
    })

    it('move keyed node', () => {
      const el = r(
        <>
          <li key="a" />
          <li key="b" />
        </>
      )
      const lis = [...el.querySelectorAll('li')]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <li key="b" />
            <li key="a" />
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.querySelectorAll('li')]
      expect(lis[0]).toBe(res[1])
      expect(lis[1]).toBe(res[0])
    })

    it('move key ref node', () => {
      const a = { a: true }
      const b = { b: true }

      const el = r(
        <>
          <li key={a} />
          <li key={b} />
        </>
      )
      const lis = [...el.querySelectorAll('li')]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <li key={b} />
            <li key={a} />
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.querySelectorAll('li')]
      expect(lis[0]).toBe(res[1])
      expect(lis[1]).toBe(res[0])
    })

    it('insert keyed node', () => {
      const el = r(
        <>
          <li key="a" />
          <li key="b" />
        </>
      )
      const lis = [...el.querySelectorAll('li')]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <li key="c" />
            <li key="a" />
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.querySelectorAll('li')]
      expect(lis[0]).toBe(res[1])
      expect(lis[1]).not.toBe(res[0])
    })

    it('insert keyed node svg', () => {
      const el = r(
        <svg>
          <rect key="a" />
          <rect key="b" />
        </svg>
      )
      const lis = [...el.querySelectorAll('rect')]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <svg>
            <rect key="c" />
            <rect key="a" />
          </svg>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.querySelectorAll('rect')]
      expect(lis[0]).toBe(res[1])
      expect(lis[1]).not.toBe(res[0])
    })

    it('insert replace keyed node', () => {
      const el = r(
        <>
          <li key="a" />
          <li key="b" />
        </>
      )
      const lis = [...el.querySelectorAll('li')]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <li key="d" />
            <li key="a" />
            <li key="c" />
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.querySelectorAll('li')]
      expect(lis[0]).toBe(res[1])
    })

    it('replace keyed node', () => {
      const el = r(
        <>
          <li key="a" />
          <li key="b" />
        </>
      )
      const lis = [...el.querySelectorAll('li')]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <li key="a" />
            <li key="c" />
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.querySelectorAll('li')]
      expect(lis[0]).toBe(res[0])
      expect(lis[1]).not.toBe(res[1])
    })

    it('replace multiple keyed node', () => {
      const el = r(
        <>
          <li key="a" />
          <li key="b" />
        </>
      )
      const lis = [...el.querySelectorAll('li')]
      expect(el.innerHTML).toMatchSnapshot()
      {
        expect(
          o(
            <>
              <li key="a" />
              <li key="c" />
            </>,
            el
          )
        ).toMatchSnapshot()
        const res = [...el.querySelectorAll('li')]
        expect(lis[0]).toBe(res[0])
        expect(lis[1]).not.toBe(res[1])
      }
      {
        expect(
          o(
            <>
              <li key="b" />
              <li key="c" />
            </>,
            el
          )
        ).toMatchSnapshot()
        const res = [...el.querySelectorAll('li')]
        expect(lis[1]).not.toBe(res[0])
        expect(lis[0]).not.toBe(res[1])
      }
    })

    it('deep move keyed node', () => {
      const el = r(
        <div>
          <li key="a" />
          <li key="b" />
        </div>
      )
      const first = el.firstChild
      const lis = [...el.querySelectorAll('li')]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <div>
            <li key="b" />
            <li key="a" />
          </div>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.querySelectorAll('li')]
      expect(el.firstChild).toBe(first)
      expect(lis[0]).toBe(res[1])
      expect(lis[1]).toBe(res[0])
    })

    it('move outer keyed node', () => {
      const el = r(
        <>
          <div key="a">
            <li key="a" />
            <li key="b" />
          </div>
          <div key="b">
            <li key="a" />
            <li key="b" />
          </div>
        </>
      )
      const divs = [...el.querySelectorAll('div')]
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <>
            <div key="b">
              <li key="a" />
              <li key="b" />
            </div>
            <div key="a">
              <li key="a" />
              <li key="b" />
            </div>
          </>,
          el
        )
      ).toMatchSnapshot()
      const res = [...el.querySelectorAll('div')]
      expect(divs[0]).toBe(res[1])
      expect(divs[1]).toBe(res[0])
    })

    it('replace inner node', () => {
      const el = r(
        <div>
          <p></p>
        </div>
      )
      const first = el.firstChild
      expect(el.innerHTML).toMatchSnapshot()
      expect(
        o(
          <div>
            <a></a>
          </div>,
          el
        )
      ).toMatchSnapshot()
      expect(el.firstChild).toBe(first)
    })
  })
})
