import { Fragment, Hook, current, h, render } from '../../src'

let c: HTMLDivElement
beforeEach(() => (c = document.createElement('div')))

const clean = (s: string) =>
  s.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '').replaceAll('<!---->', '')
const html = () => clean(c.innerHTML)

describe('render', () => {
  describe('create', () => {
    it('Element', () => {
      render(<div></div>, c)
      expect(html()).toMatchSnapshot()
    })

    it('attribute: id', () => {
      render(<div id="foo"></div>, c)
      expect(html()).toMatchSnapshot()
    })

    it('Element with text child', () => {
      render(<div>hello</div>, c)
      expect(html()).toMatchSnapshot()
    })

    it('Element with number child', () => {
      render(<div>{123}</div>, c)
      expect(html()).toMatchSnapshot()
    })

    it('Fragment', () => {
      render(<>hello world</>, c)
      expect(html()).toMatchSnapshot()
    })

    it('Function', () => {
      const Foo = () => <>hello</>
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
    })

    it('Function returning Function', () => {
      const Bar = () => <>bar</>
      const Foo = () => <Bar />
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
    })
  })
  describe('update', () => {
    it('Element', () => {
      render(<div></div>, c)
      expect(html()).toMatchSnapshot()
      render(<p></p>, c)
      expect(html()).toMatchSnapshot()
    })

    it('Element with text child', () => {
      render(<div>hello</div>, c)
      expect(html()).toMatchSnapshot()
      render(<div>world</div>, c)
      expect(html()).toMatchSnapshot()
    })

    it('Element with number child', () => {
      render(<div>{123}</div>, c)
      expect(html()).toMatchSnapshot()
      render(<div>{456}</div>, c)
      expect(html()).toMatchSnapshot()
    })

    it('Fragment', () => {
      render(<>hello world</>, c)
      expect(html()).toMatchSnapshot()
      render(<>something else</>, c)
      expect(html()).toMatchSnapshot()
    })

    it('Function', () => {
      let i = 0
      const Foo = () => <>{i++}</>
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
    })

    it('Function returning Function', () => {
      let i = 0
      const Bar = () => <>{i++}</>
      const Foo = () => <Bar />
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
    })

    it('only updates what changed', () => {
      let i = 0
      const Bar = () => <p>{i++}</p>
      const Foo = () => (
        <div>
          <Bar />
        </div>
      )
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      // expect(c.innerHTML).toMatchSnapshot()
      const div = c.querySelector('div')
      const p = c.querySelector('p')
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      expect(c.querySelector('div')).toBe(div)
      expect(c.querySelector('p')).toBe(p)
      // expect(c.innerHTML).toMatchSnapshot()
    })
  })

  describe('hook', () => {
    it('updates', () => {
      let i = 0
      let hook!: Hook
      const Foo = () => {
        hook = current.hook!
        return <>{i++}</>
      }
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
    })

    it('is the same hook', () => {
      let i = 0
      let hook!: Hook
      const hooks: Set<Hook> = new Set()
      const Foo = () => {
        hook = current.hook!
        hooks.add(hook)
        return <>{i++}</>
      }
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      expect(hooks.size).toEqual(1)
    })

    it('works with nested', () => {
      let i = 0
      let hook!: Hook
      const hooks: Set<Hook> = new Set()
      const Bar = () => {
        hook = current.hook!
        hooks.add(hook)
        return <p>{i++}</p>
      }
      const Foo = () => (
        <div>
          <Bar />
        </div>
      )
      render(<Foo />, c)
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      hook.trigger()
      expect(html()).toMatchSnapshot()
      expect(hooks.size).toEqual(1)
    })
  })

  describe('keyed list', () => {
    it('create', () => {
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
    })

    it('change deep', () => {
      let i = 0
      render(
        <>
          {[1, 2, 3].map(x => (
            <li key={x}>
              {i++ % 2 === 0 && (
                <>
                  <span>{i}</span>
                  <span>{i}</span>
                  <span>{i}</span>
                </>
              )}
            </li>
          ))}
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      render(
        <>
          {[1, 2, 3].map(x => (
            <li key={x}>
              {i++ % 2 === 0 && (
                <>
                  <span>{i}</span>
                  <span>{i}</span>
                  <span>{i}</span>
                </>
              )}
            </li>
          ))}
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
    })

    it('rearrange', () => {
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
      const lis = c.querySelectorAll('li')
      render(
        <>
          {[3, 1, 2].map(x => (
            <Foo key={x} />
          ))}
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      const res = c.querySelectorAll('li')
      expect(res[0] === lis[2]).toEqual(true)
      expect(res[0]).toBe(lis[2])
      expect(res[1]).toBe(lis[0])
      expect(res[2]).toBe(lis[1])
    })

    it('insert', () => {
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
      const lis = c.querySelectorAll('li')
      render(
        <>
          {[0, 1, 2, 3].map(x => (
            <Foo key={x} />
          ))}
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      const res = c.querySelectorAll('li')
      expect(res[1]).toBe(lis[0])
      expect(res[2]).toBe(lis[1])
      expect(res[3]).toBe(lis[2])
    })

    it('remove', () => {
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
      const lis = c.querySelectorAll('li')
      expect(lis.length).toEqual(3)
      render(
        <>
          {[1, 3].map(x => (
            <Foo key={x} />
          ))}
        </>,
        c
      )
      expect(html()).toMatchSnapshot()
      const res = c.querySelectorAll('li')
      expect(res.length).toEqual(2)
      expect(res[0]).toBe(lis[0])
      expect(res[1]).toBe(lis[2])
    })
  })

  describe('svg', () => {
    it('svg', () => {
      render(<svg></svg>, c)
      expect(html()).toMatchSnapshot()
    })

    it('uses correct namespace', () => {
      render(<svg viewBox="0 0 10 10"></svg>, c)
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
        c
      )
      expect(html()).toMatchSnapshot()
    })
  })
})
