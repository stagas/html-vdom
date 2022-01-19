import { Fragment, VHook, current, h, render } from '../src'

let c: HTMLDivElement

const html = () => c.innerHTML
const $ = (sel: string) => c.querySelector(sel)!
const $$ = (sel: string) => c.querySelectorAll(sel)!

beforeEach(() => {
  c = document.createElement('div')
})

describe('render', () => {
  it('single div', () => {
    render(<div></div>, c)
    expect(html()).toMatchSnapshot()
  })

  it('morphs div to p', () => {
    render(<div></div>, c)
    expect(html()).toMatchSnapshot()

    render(<p></p>, c)
    expect(html()).toMatchSnapshot()
  })

  it('with child text', () => {
    render(<div>hello world</div>, c)
    expect(html()).toMatchSnapshot()
  })

  it('props create', () => {
    render(<div id="foo">hello world</div>, c)
    expect(html()).toMatchSnapshot()
  })

  it('props update', () => {
    render(<div id="foo">hello world</div>, c)
    expect(html()).toMatchSnapshot()
    render(<div id="bar">hello world</div>, c)
    expect(html()).toMatchSnapshot()
  })

  it('morph same lane', () => {
    render(
      <>
        hello
        <> there </>
        world
      </>,
      c
    )
    expect(html()).toMatchSnapshot()

    render(
      <>
        hello
        <div> there </div>
        world
      </>,
      c
    )
    expect(html()).toMatchSnapshot()
  })

  it('morphs child text keeping references', () => {
    render(<div>hello</div>, c)
    expect(html()).toMatchSnapshot()

    const el = $('div')
    const text = el.firstChild

    render(<div>world</div>, c)
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
      c
    )
    expect(html()).toMatchSnapshot()

    const lis = $$('li')

    render(
      <ul>
        <li key="c">c</li>
        <li key="a">a</li>
        <li key="b">b</li>
      </ul>,
      c
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
      c
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
        c
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
        c
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
        c
      )
      expect(html()).toMatchSnapshot()

      const res = $$('li')

      expect(res[0]).toBe(lis[1])
      expect(res[1]).toBe(lis[3])
    }

    {
      render(<ul></ul>, c)
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
      c
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
      c
    )
    expect(html()).toMatchSnapshot()

    const res = $$('button')

    expect(res[1]).toBe(bs[2])
    expect(res[3]).toBe(bs[1])
    expect(res[0]).toBe(bs[0])
  })

  describe('fragment', () => {
    it('simple text', () => {
      render(<>hello world</>, c)
      expect(html()).toMatchSnapshot()
    })

    it('changing text', () => {
      render(<>hello world</>, c)
      expect(html()).toMatchSnapshot()

      render(<>another world</>, c)
      expect(html()).toMatchSnapshot()
    })

    it('multiple children', () => {
      render(
        <>
          hello
          <div>world</div>
          <span>hey</span>
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
    })

    it('changing and reusing children', () => {
      render(
        <>
          hello
          <div>world</div>
          <span>hey</span>
        </>,
        c
      )
      expect(html()).toMatchSnapshot()

      const els = $$('*')

      render(
        <>
          <div>world</div>
          <div>other</div>
          another
          <span>yo</span>
        </>,
        c
      )
      expect(html()).toMatchSnapshot()

      const res = $$('*')

      expect(res[0]).toBe(els[0])
      expect(res[2]).toBe(els[1])
    })

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
        c
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
        c
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
        c
      )
      expect(html()).toMatchSnapshot()
    })
  })

  describe('arrays', () => {
    it('renders', () => {
      render(
        <ul>
          {'abc'.split('').map(x => (
            <li key={x}>{x}</li>
          ))}
        </ul>,
        c
      )
      expect(html()).toMatchSnapshot()
    })

    it('reorders', () => {
      render(
        <ul>
          {'abc'.split('').map(x => (
            <li key={x}>{x}</li>
          ))}
        </ul>,
        c
      )
      expect(html()).toMatchSnapshot()

      const lis = $$('li')

      render(
        <ul>
          {'cab'.split('').map(x => (
            <li key={x}>{x}</li>
          ))}
        </ul>,
        c
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
        c
      )
      expect(html()).toMatchSnapshot()
    })
  })

  describe('functions', () => {
    it('empty fragment', () => {
      const Foo = () => <></>
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
    })

    it('simple text', () => {
      const Foo = () => <>hello world</>
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
    })

    it('with children', () => {
      const Foo = ({ children }: { children?: never }) => <>{children}</>
      render(<Foo>hello world</Foo>, c)
      expect(html()).toMatchSnapshot()
    })

    it('pass props', () => {
      const Foo = ({ answer }: { answer: number }) => (
        <>
          answer is <b>{answer}</b>
        </>
      )
      render(<Foo answer={42} />, c)
      expect(html()).toMatchSnapshot()
    })
  })

  describe('hooks', () => {
    it('trigger', () => {
      let i = 0
      let hook!: VHook
      const Foo = () => {
        hook = current.hook!
        return <>{i++}</>
      }
      render(
        <>
          <Foo />
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('mulitple triggers', () => {
      let i = 0
      let hook!: VHook
      const Foo = () => {
        hook = current.hook!
        return <>{i++}</>
      }
      render(
        <>
          <Foo />
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('they dont leak', () => {
      const set: Set<VHook> = new Set()
      let i = 0
      let hook!: VHook
      const Foo = () => {
        hook = current.hook!
        set.add(hook)
        return <>{i++}</>
      }
      render(
        <>
          <Foo />
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      set.forEach(x => x.trigger())
      expect(html()).toMatchSnapshot()
      set.forEach(x => x.trigger())
      expect(html()).toMatchSnapshot()
      set.forEach(x => x.trigger())
      expect(html()).toMatchSnapshot()
      expect(set.size).toEqual(1)
    })

    it('deep they dont leak', () => {
      const set: Set<VHook> = new Set()
      let i = 0
      let hook!: VHook
      let hook_foo!: VHook
      const Bar = () => {
        hook = current.hook!
        set.add(hook)
        return <>{i++}</>
      }
      const Foo = () => {
        hook = current.hook!
        hook_foo = hook
        set.add(hook)
        return <Bar />
      }
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      expect(set.size).toEqual(2)
      hook_foo.trigger()
      // set.forEach(x => x.trigger())
      expect(html()).toMatchSnapshot()
      expect(set.size).toEqual(2)
      hook_foo.trigger()
      // set.forEach(x => x.trigger())
      expect(html()).toMatchSnapshot()
      expect(set.size).toEqual(2)
      // set.forEach(x => x.trigger())
      // expect(html()).toMatchSnapshot()
      // expect(set.size).toEqual(2)
    })

    it('updates only self', () => {
      let i = 0
      let hook!: VHook
      const Foo = () => {
        hook = current.hook!
        return <>{i++}</>
      }
      render(
        <>
          hello
          <Foo />
          world
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('changes top element', () => {
      let i = 0
      let hook!: VHook
      const Foo = () => {
        hook = current.hook!
        return i % 2 === 0 ? <>{i++}</> : <div>{i++}</div>
      }
      render(
        <>
          hello
          <Foo />
          world
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('changes deeply element', () => {
      let i = 0
      let hook_bar!: VHook
      const Bar = () => {
        hook_bar = current.hook!
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
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      hook_bar.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('changes deeply with children', () => {
      let i = 41
      let hook_bar!: VHook
      const Bar = ({ children }: { children?: never }) => {
        hook_bar = current.hook!
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
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      // render(<Foo />, c)
      hook_bar.trigger()
      expect(html()).toMatchSnapshot()
    })
  })
})

describe('quirky cases', () => {
  it('pass component in props', () => {
    let i = 0
    const Bar = ({ inner }) => (
      <p>
        {i++} {inner}
      </p>
    )
    const Foo = ({ Component, children }: { Component: any; children?: any }) => (
      <Component inner={children} />
    )
    render(<Foo Component={Bar}>hello</Foo>, c)
    expect(html()).toMatchSnapshot()
  })

  it('renders input elements correctly', () => {
    render(
      <>
        <input type="range" min="5" max="10" value="8" />
        <input type="number" min="5" max="10" value="8" />
      </>,
      c
    )
    expect(html()).toMatchSnapshot()
  })
})
