/** @jsxImportSource ../src */
import { fromElement } from '../src/from-element'
import { Hook, hook, render } from '../src/jsx-runtime'

let t: HTMLDivElement

const html = () => t.innerHTML
const $ = (sel: string) => t.querySelector(sel)!
const $$ = (sel: string) => t.querySelectorAll(sel)!

beforeEach(() => {
  t = document.createElement('div')
})

describe('all', () => {
  describe('render', () => {
    it('single div', () => {
      render(<div></div>, t)
      expect(html()).toMatchSnapshot()
    })

    it('morphs div to p', () => {
      render(<div></div>, t)
      expect(html()).toMatchSnapshot()

      render(<p></p>, t)
      expect(html()).toMatchSnapshot()
    })

    it('with child text', () => {
      render(<div>hello world</div>, t)
      expect(html()).toMatchSnapshot()
    })

    it('props create', () => {
      render(<div id="foo">hello world</div>, t)
      expect(html()).toMatchSnapshot()
    })

    it('props update', () => {
      render(<div id="foo">hello world</div>, t)
      expect(html()).toMatchSnapshot()
      render(<div id="bar">hello world</div>, t)
      expect(html()).toMatchSnapshot()
    })

    it('ref & pass ref', async () => {
      const ref = { current: null }
      render(<div ref={ref}>hello world</div>, t)
      expect(html()).toMatchSnapshot()
      const el = t.firstChild
      await Promise.resolve()
      expect(ref.current).toBe(el)
      render(<div ref={ref}>same element</div>, t)
      expect(html()).toMatchSnapshot()
      await Promise.resolve()
      expect(ref.current).toBe(el)
    })

    it('conditional swap raf', async () => {
      const refs = {
        a: { current: null },
        b: { current: null },
      }
      render(<div ref={refs.a}>hello world</div>, t)
      expect(html()).toMatchSnapshot()
      const el = t.firstChild
      await Promise.resolve()
      render(<p ref={refs.b}>other element</p>, t)
      expect(html()).toMatchSnapshot()
      expect(t.firstChild).not.toBe(el)
      render(<div ref={refs.a}>hello world</div>, t)
      expect(html()).toMatchSnapshot()
      expect(t.firstChild).toBe(el)
    })

    it('component conditional swap ref', async () => {
      const refs = {
        a: { current: null },
        b: { current: null },
      }
      const Foo = ({ kind }: any) => {
        if (kind === 'a') return <div ref={refs.a}>hello world</div>
        if (kind === 'b') return <p ref={refs.b}>other element</p>
      }
      render(<Foo kind="a" />, t)
      expect(html()).toMatchSnapshot()
      await Promise.resolve()
      const el = t.firstChild
      render(<Foo kind="b" />, t)
      expect(html()).toMatchSnapshot()
      expect(t.firstChild).not.toBe(el)
      render(<Foo kind="a" />, t)
      expect(html()).toMatchSnapshot()
      expect(t.firstChild).toBe(el)
    })

    it('morph same lane', () => {
      render(
        <>
          hello
          <>there</>
          world
        </>,
        t
      )
      expect(html()).toMatchSnapshot()

      render(
        <>
          hello
          <div>there</div>
          world
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
    })

    it('morphs child text keeping references', () => {
      render(<div>hello</div>, t)
      expect(html()).toMatchSnapshot()

      const el = $('div')
      const text = el.firstChild

      render(<div>world</div>, t)
      expect(html()).toMatchSnapshot()

      expect($('div')).toBe(el)
      expect($('div').firstChild).toBe(text)
    })

    it('ul multiple children', () => {
      render(
        <ul>
          <li key="a">a</li>
          <li key="b">b</li>
          <li key="c">c</li>
        </ul>,
        t
      )
      expect(html()).toMatchSnapshot()

      const lis = $$('li')

      render(
        <ul>
          <li key="c">c</li>
          <li key="a">a</li>
          <li key="b">b</li>
        </ul>,
        t
      )
      expect(html()).toMatchSnapshot()

      const res = $$('li')

      expect(res[1]).toBe(lis[0])
      expect(res[2]).toBe(lis[1])
      expect(res[0]).toBe(lis[2])
    })

    it('changing children multiple times', () => {
      render(
        <ul>
          <li key="a">a</li>
          <li key="b">b</li>
          <li key="c">c</li>
        </ul>,
        t
      )
      expect(html()).toMatchSnapshot()

      {
        const lis = $$('li')

        render(
          <ul>
            <li key="c">c</li>
            <li key="a">a</li>
            <li key="b">b</li>
          </ul>,
          t
        )
        expect(html()).toMatchSnapshot()

        const res = $$('li')

        expect(res[1]).toBe(lis[0])
        expect(res[2]).toBe(lis[1])
        expect(res[0]).toBe(lis[2])
      }

      {
        const lis = $$('li')

        render(
          <ul>
            <li key="a">a</li>
            <li key="d">d</li>
            <li key="c">c</li>
            <li key="b">b</li>
          </ul>,
          t
        )
        expect(html()).toMatchSnapshot()

        const res = $$('li')

        expect(res[0]).toBe(lis[1])
        expect(res[2]).toBe(lis[0])
        expect(res[3]).toBe(lis[2])
      }

      {
        const lis = $$('li')

        render(
          <ul>
            <li key="d">d</li>
            <li key="b">b</li>
          </ul>,
          t
        )
        expect(html()).toMatchSnapshot()

        const res = $$('li')

        expect(res[0]).toBe(lis[1])
        expect(res[1]).toBe(lis[3])
      }

      {
        render(<ul></ul>, t)
        expect(html()).toMatchSnapshot()
      }
    })

    it('complex tree', () => {
      render(
        <div>
          <ul>
            <li key="a">
              <button>
                some text <span>a</span>
              </button>
            </li>
            <li key="b">
              <button>
                here too <span>b</span>
              </button>
            </li>
            <li key="c">
              <button>
                <span>c</span> and here
              </button>
            </li>
          </ul>
        </div>,
        t
      )
      expect(html()).toMatchSnapshot()

      const bs = $$('button')

      render(
        <div>
          <ul>
            <li key="a">
              <button>
                some text <span>a</span>
              </button>
            </li>
            <li key="c">
              <button>
                <span>c</span> and here
              </button>
            </li>
            <li key="d">
              <button>
                hey <span>d</span> yo
              </button>
            </li>
            <li key="b">
              <button>
                here too <span>b</span>
              </button>
            </li>
          </ul>
        </div>,
        t
      )
      expect(html()).toMatchSnapshot()

      const res = $$('button')

      expect(res[1]).toBe(bs[2])
      expect(res[3]).toBe(bs[1])
      expect(res[0]).toBe(bs[0])
    })

    describe('fragment', () => {
      it('simple text', () => {
        render(<>hello world</>, t)
        expect(html()).toMatchSnapshot()
      })

      it('changing text', () => {
        render(<>hello world</>, t)
        expect(html()).toMatchSnapshot()

        render(<>another world</>, t)
        expect(html()).toMatchSnapshot()
      })

      it('multiple children', () => {
        render(
          <>
            hello
            <div>world</div>
            <span>hey</span>
          </>,
          t
        )
        expect(html()).toMatchSnapshot()
      })

      // it('changing and reusing children', () => {
      //   render(
      //     <>
      //       hello
      //       <div>world</div>
      //       <span>hey</span>
      //     </>,
      //     c
      //   )
      //   expect(html()).toMatchSnapshot()

      //   const els = $$('*')

      //   render(
      //     <>
      //       <div>world</div>
      //       <div>other</div>
      //       another
      //       <span>yo</span>
      //     </>,
      //     c
      //   )
      //   expect(html()).toMatchSnapshot()

      //   const res = $$('*')

      //   expect(res[0]).toBe(els[0])
      //   expect(res[2]).toBe(els[1])
      // })

      it('fragments within fragments', () => {
        render(
          <>
            <>one</>
            <>
              hello
              <div>world</div>
            </>
            <span>
              <>hey</>
            </span>
          </>,
          t
        )
        expect(html()).toMatchSnapshot()
      })

      it('changing fragments within fragments', () => {
        render(
          <>
            <>one</>
            <>
              hello
              <div>world</div>
            </>
            <span>
              <>hey</>
            </span>
          </>,
          t
        )
        expect(html()).toMatchSnapshot()

        render(
          <>
            <>
              hello
              <div>world</div>
            </>
            <span>
              <>hey</>
            </span>
            <>one</>
          </>,
          t
        )
        expect(html()).toMatchSnapshot()
      })
    })

    describe('arrays', () => {
      it('renders', () => {
        render(
          <ul>
            {'abc'.split('').map(x => <li key={x}>{x}</li>)}
          </ul>,
          t
        )
        expect(html()).toMatchSnapshot()
      })

      it('reorders', () => {
        render(
          <ul>
            {'abc'.split('').map(x => <li key={x}>{x}</li>)}
          </ul>,
          t
        )
        expect(html()).toMatchSnapshot()

        const lis = $$('li')

        render(
          <ul>
            {'cab'.split('').map(x => <li key={x}>{x}</li>)}
          </ul>,
          t
        )
        expect(html()).toMatchSnapshot()

        const res = $$('li')

        expect(res[1]).toBe(lis[0])
        expect(res[2]).toBe(lis[1])
        expect(res[0]).toBe(lis[2])
      })

      it('fragments', () => {
        render(
          <ul>
            {'abc'.split('').map(x => (
              <>
                <li>{x}</li>
              </>
            ))}
          </ul>,
          t
        )
        expect(html()).toMatchSnapshot()
      })
    })

    describe('functions', () => {
      it('empty fragment', () => {
        const Foo = () => <></>
        render(<Foo />, t)
        expect(html()).toMatchSnapshot()
      })

      it('simple text', () => {
        const Foo = () => <>hello world</>
        render(<Foo />, t)
        expect(html()).toMatchSnapshot()
      })

      it('with children', () => {
        const Foo = ({ children }: { children?: never }) => <>{children}</>
        render(<Foo>hello world</Foo>, t)
        expect(html()).toMatchSnapshot()
      })

      it('pass props', () => {
        const Foo = ({ answer }: { answer: number }) => (
          <>
            answer is <b>{answer}</b>
          </>
        )
        render(<Foo answer={42} />, t)
        expect(html()).toMatchSnapshot()
      })
    })

    describe('custom element', () => {
      it('using fromElement', () => {
        class FooElement extends HTMLElement {}
        const Foo = fromElement(FooElement)
        render(<Foo />, t)
        expect(html()).toContain('<x-foo')
        expect(html()).toContain('</x-foo')
      })
    })

    describe('hooks', () => {
      it('trigger', () => {
        let i = 0
        let h!: Hook
        const Foo = () => {
          h = hook
          return <>{i++}</>
        }
        render(
          <>
            <Foo />
          </>,
          t
        )
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
      })

      it('mulitple triggers', () => {
        let i = 0
        let h!: Hook
        const Foo = () => {
          h = hook
          return <>{i++}</>
        }
        render(
          <>
            <Foo />
          </>,
          t
        )
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
      })

      it('they dont leak', () => {
        const set: Set<() => void> = new Set()
        let i = 0
        let h!: Hook
        const Foo = () => {
          h = hook
          set.add(h)
          return <>{i++}</>
        }
        render(
          <>
            <Foo />
          </>,
          t
        )
        expect(html()).toMatchSnapshot()
        set.forEach(x => x())
        expect(html()).toMatchSnapshot()
        set.forEach(x => x())
        expect(html()).toMatchSnapshot()
        set.forEach(x => x())
        expect(html()).toMatchSnapshot()
        expect(set.size).toEqual(1)
      })

      it('deep they dont leak', () => {
        const set: Set<Hook> = new Set()
        let i = 0
        let h!: Hook
        let hook_foo!: Hook
        const Bar = () => {
          h = hook
          set.add(h)
          return <>{i++}</>
        }
        const Foo = () => {
          h = hook
          hook_foo = h
          set.add(h)
          return <Bar />
        }
        render(<Foo />, t)
        expect(html()).toMatchSnapshot()
        expect(set.size).toEqual(2)
        hook_foo()
        // set.forEach(x => x())
        expect(html()).toMatchSnapshot()
        expect(set.size).toEqual(2)
        hook_foo()
        // set.forEach(x => x())
        expect(html()).toMatchSnapshot()
        expect(set.size).toEqual(2)
        // set.forEach(x => x())
        // expect(html()).toMatchSnapshot()
        // expect(set.size).toEqual(2)
      })

      it('updates only self', () => {
        let i = 0
        let h!: () => void
        const Foo = () => {
          h = hook
          return <>{i++}</>
        }
        render(
          <>
            hello
            <Foo />
            world
          </>,
          t
        )
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
      })

      it('changes top element', () => {
        let i = 0
        let h!: Hook
        const Foo = () => {
          h = hook
          return i % 2 === 0 ? <>{i++}</> : <div>{i++}</div>
        }
        render(
          <>
            hello
            <Foo />
            world
          </>,
          t
        )
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
        h()
        expect(html()).toMatchSnapshot()
      })

      it('changes deeply element', () => {
        let i = 0
        let hook_bar!: Hook
        const Bar = () => {
          hook_bar = hook
          return <>{i++}</>
        }
        const Foo = () => {
          return (
            <main>
              <div>
                <Bar />
              </div>
            </main>
          )
        }
        render(<Foo />, t)
        expect(html()).toMatchSnapshot()
        hook_bar()
        expect(html()).toMatchSnapshot()
      })

      it('changes deeply with children', () => {
        let i = 41
        let hook_bar!: Hook
        const Bar = ({ children }: { children?: never }) => {
          hook_bar = hook
          return (
            <>
              {children} {i++}
            </>
          )
        }
        const Foo = () => {
          return (
            <main>
              <div>
                <Bar>
                  <span>the answer is</span>
                </Bar>
              </div>
            </main>
          )
        }
        render(<Foo />, t)
        expect(html()).toMatchSnapshot()
        // render(<Foo />, c)
        hook_bar()
        expect(html()).toMatchSnapshot()
      })
    })
  })

  describe('quirky cases', () => {
    it('pass component in props', () => {
      let i = 0
      const Bar = ({ inner }: any) => (
        <p>
          {i++} {inner}
        </p>
      )
      const Foo = ({ Component, children }: { Component: any; children?: any }) => <Component inner={children} />
      render(<Foo Component={Bar}>hello</Foo>, t)
      expect(html()).toMatchSnapshot()
    })

    it('renders input elements correctly', () => {
      render(
        <>
          <input type="range" min="5" max="10" value="8" />
          <input type="number" min="5" max="10" value="8" />
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
    })

    it('render children at same position properly', () => {
      let h!: Hook
      const childs: any = []
      let count = 0
      const toString: any = (x: any) => {
        return '(' + [x ?? x.toString()].join(':') + ')'
      }
      const Foo = ({ children }: { children?: any }) => {
        childs.push(toString(children))
        h = hook
        return (
          <div>
            {children} {++count}
          </div>
        )
      }
      render(<Foo>hello</Foo>, t)
      expect(childs).toMatchObject(['(hello)'])
      expect(html()).toMatchSnapshot()
      h()
      expect(childs).toMatchObject(['(hello)', '(hello)'])
      expect(html()).toMatchSnapshot()
      h()
      expect(childs).toMatchObject(['(hello)', '(hello)', '(hello)'])
      expect(html()).toMatchSnapshot()
    })

    it('less then many then less', () => {
      let h!: Hook
      let count = 5
      const Foo = () => {
        h = hook
        const evens = []
        const odds = []
        for (let i = 0; i < count; i++) {
          if (i % 2 === 0)
            evens.push(<p key={i}>{i}</p>)
          else
            odds.push(<p key={i}>{i}</p>)
        }
        return [[...evens, ...odds]]
      }
      render(
        <>
          <Foo />
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
      count = 10
      h()
      expect(html()).toMatchSnapshot()
      count = 4
      h()
      expect(html()).toMatchSnapshot()
      count = 10
      h()
      expect(html()).toMatchSnapshot()
    })

    it('keyed removed and added again', async () => {
      let h!: Hook
      const outputs = [
        '',
        'abcd',
        'ac',
        'abcde',
        'de',
        'ebc',
        'dce',
      ]
      const refs = new Map()
      let i = 0
      const Foo = () => {
        h = hook
        const output = outputs[i++]
        return [
          output.split('')
            .map(key => (
              <p
                key={key}
                ref={{
                  get current() {
                    return refs.get(key)
                  },
                  set current(el) {
                    refs.set(key, el!)
                  },
                }}
              >
                {key}
              </p>
            )),
        ]
      }
      render(
        <>
          <Foo />
        </>,
        t
      )
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      h()
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      h()
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      h()
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      h()
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      h()
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      h()
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
    })

    it('2 keyed removed and added again', async () => {
      let h!: Hook
      const outputs = [
        '',
        'abcde',
        'afbc',
      ]
      const refs = new Map()
      let i = 0
      const Foo = () => {
        h = hook
        if (i === 0) return i++, null
        const output = outputs[i++]
        return output.split('')
          .map(key => (
            <p
              key={key}
              ref={{
                get current() {
                  return refs.get(key)
                },
                set current(el) {
                  refs.set(key, el!)
                },
              }}
            >
              {key}
            </p>
          ))
      }
      render(
        <>
          <Foo />
        </>,
        t
      )
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      h()
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      h()
      await Promise.resolve()
      expect(html()).toMatchSnapshot()
      // h()
      // await Promise.resolve()
      // expect(html()).toMatchSnapshot()
      // h()
      // await Promise.resolve()
      // expect(html()).toMatchSnapshot()
      // h()
      // await Promise.resolve()
      // expect(html()).toMatchSnapshot()
      // h()
      // await Promise.resolve()
      // expect(html()).toMatchSnapshot()
    })
  })

  describe('svg', () => {
    it('svg', () => {
      render(<svg></svg>, t)
      expect(html()).toMatchSnapshot()
    })

    it('uses correct namespace', () => {
      render(<svg viewBox="0 0 10 10"></svg>, t)
      expect(html()).toMatchSnapshot()
    })

    it('svg then foreignObject', () => {
      render(
        <svg viewBox="0 0 10 10">
          <path pathLength="90" />
          <foreignObject>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <input autoFocus />
          </foreignObject>
        </svg>,
        t
      )
      expect(html()).toMatchSnapshot()
    })

    it('svg then foreignObject right attribute casing', () => {
      render(
        <svg viewBox="0 0 10 10">
          <path pathLength="90" />
          <foreignObject>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <input autofocus />
          </foreignObject>
        </svg>,
        t
      )
      expect(html()).toMatchSnapshot()
    })

    it('uses correct namespace after hook update', () => {
      let update!: Hook
      let pathLength = 50
      let count = 1
      const Foo = () => {
        update = hook
        return Array(count).fill(0).map(() => <path d="M 0,20 h100" pathLength={pathLength} />)
      }
      render(
        <div>
          <svg viewBox="0 0 10 10">
            <Foo />
          </svg>
        </div>,
        t
      )
      expect(html()).toMatchSnapshot()
      pathLength = 100
      count = 2
      update()
      expect(html()).toMatchSnapshot()
    })

    it('after hook update cached contents', () => {
      let update!: Hook
      let pathLength = 50
      let count = 0
      let output: any
      const makeContents = () => {
        output = Array(count).fill(0).map(() => <path d="M 0,20 h100" pathLength={pathLength} />)
      }
      const Foo = () => {
        update = hook
        return output
      }
      makeContents()
      render(
        <>
          <svg viewBox="0 0 10 10">
            <Foo />
          </svg>
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
      pathLength = 100
      count = 2
      makeContents()
      update()
      expect(html()).toMatchSnapshot()
    })
  })

  describe('return same reference', () => {
    it('shuffle', () => {
      const a = [1]
      const b = [2]
      const c = [3]
      const A = () => a
      const B = () => b
      const C = () => c
      render(
        <>
          <A key="a" />
          <B key="b" />
          <C key="c" />
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
      render(
        <>
          <B key="b" />
          <A key="a" />
          <C key="c" />
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
    })

    it('add + shuffle', () => {
      const a = [1]
      const b = [2]
      const c = [3]
      const d = [4]
      const A = () => a
      const B = () => b
      const C = () => c
      const D = () => d
      render(
        <>
          <A key="a" />
          <B key="b" />
          <C key="c" />
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
      render(
        <>
          <B key="b" />
          <D key="d" />
          <A key="a" />
          <C key="c" />
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
    })

    it('remove + shuffle', () => {
      const a = [1]
      const b = [2]
      const c = [3]
      const d = [4]
      const A = () => a
      const B = () => b
      const C = () => c
      const D = () => d
      render(
        <>
          <A key="a" />
          <B key="b" />
          <C key="c" />
          <D key="d" />
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
      render(
        <>
          <C key="c" />
          <A key="a" />
        </>,
        t
      )
      expect(html()).toMatchSnapshot()
    })
  })
})
