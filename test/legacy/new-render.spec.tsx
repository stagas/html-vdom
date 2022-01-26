/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, Hook, current, h, render } from '../../src'

let c: HTMLDivElement

const html = () => c.innerHTML
const $ = (sel: string) => c.querySelector(sel)!
const $$ = (sel: string) => c.querySelectorAll(sel)!

beforeEach(() => {
  c = document.createElement('div')
})

describe('render', () => {
  it('single child', () => {
    render(<p></p>, c)
    expect(html()).toMatchSnapshot()
  })

  it('fragment', () => {
    render(<>1</>, c)
    expect(html()).toMatchSnapshot()
  })

  it('children text', () => {
    render(<p>foo bar</p>, c)
    expect(html()).toMatchSnapshot()
  })

  describe('array', () => {
    it('render', () => {
      render(<>{[1, 2, 3]}</>, c)
      expect(html()).toMatchSnapshot()
    })
  })

  describe('function', () => {
    it('single: render', () => {
      const Foo = () => <p></p>
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
    })

    it('single: fragment', () => {
      const Foo = () => <>1</>
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
    })

    it('single: trigger hook', () => {
      let hook!: Hook
      let i = 0
      const Foo = () => {
        hook = current.hook!
        return <p>{++i}</p>
      }
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('fragment: trigger hook', () => {
      let hook!: Hook
      let i = 0
      const Foo = () => {
        hook = current.hook!
        return <>{++i}</>
      }
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('div then boolean', () => {
      let hook!: Hook
      let i = 0
      const Foo = () => {
        hook = current.hook!
        i++
        return i === 1 ? <div>{i}</div> : i === 2 ? <div>{true}</div> : <div>{false}</div>
      }
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('div then nullish', () => {
      let hook!: Hook
      let i = 0
      const Foo = () => {
        hook = current.hook!
        i++
        return i === 1 ? <div>{i}</div> : i === 2 ? <div>{null}</div> : <div>{undefined}</div>
      }
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('deep: trigger hook', () => {
      let hook!: Hook
      let i = 0
      const called: string[] = []
      const Bar = () => {
        hook = current.hook!
        called.push('bar')
        return <p>{++i}</p>
      }
      const Foo = () => {
        called.push('foo')
        return (
          <div>
            <Bar />
          </div>
        )
      }
      render(<Foo />, c)
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
    })

    it('deep fragment: trigger hook', () => {
      let hook!: Hook
      let i = 0
      const called: string[] = []
      const Bar = () => {
        hook = current.hook!
        called.push('bar')
        return <>{++i}</>
      }
      const Foo = () => {
        called.push('foo')
        return (
          <>
            <Bar />
          </>
        )
      }
      render(<Foo />, c)
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
    })

    it('deep fragment: first fragment then div', () => {
      let hook!: Hook
      let i = 0
      const called: string[] = []
      const Bar = () => {
        hook = current.hook!
        called.push('bar')
        return i === 0 ? <>{++i}</> : <div>{++i}</div>
      }
      const Foo = () => {
        called.push('foo')
        return (
          <>
            <a />
            <Bar />
            <b />
          </>
        )
      }
      render(<Foo />, c)
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
    })

    it('deep fragment: first div then fragment', () => {
      let hook!: Hook
      let i = 0
      const called: string[] = []
      const Bar = () => {
        hook = current.hook!
        called.push('bar')
        return i === 0 ? <div>{++i}</div> : <>{++i}</>
      }
      const Foo = () => {
        called.push('foo')
        return (
          <>
            <a />
            <Bar />
            <b />
          </>
        )
      }
      render(<Foo />, c)
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
    })

    it('deep fragment: multiple changing children', () => {
      let hook!: Hook
      let i = 0
      const called: string[] = []
      const Bar = () => {
        hook = current.hook!
        called.push('bar')
        i++
        return i === 1 ? (
          <>{null}</>
        ) : i === 2 ? (
          <>
            {i}
            <x />
            <y />
          </>
        ) : i === 3 ? (
          <>
            {i}
            <x />
            <y />
            <z />
          </>
        ) : (
          <>
            {i}
            <y />
          </>
        )
      }
      const Foo = () => {
        called.push('foo')
        return (
          <>
            <a />
            <Bar />
            <b />
          </>
        )
      }
      render(<Foo />, c)
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(called).toMatchSnapshot()
      expect(html()).toMatchSnapshot()
    })
  })
})
