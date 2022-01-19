/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, current, h, render, useCallback, useHook } from '../../src'

let c: any
beforeEach(() => (c = document.createElement('div')))

const clean = (s: string) =>
  s.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '').replaceAll('<!---->', '')

describe('hooks', () => {
  it('p', () => {
    let hook: any
    let content = 'foo'
    let called = 0
    const Foo = () => {
      hook = current.hook
      called++
      return <p>{content}</p>
    }
    render(<Foo />, c)
    expect(called).toEqual(1)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    content = 'bar'
    hook.trigger()
    expect(called).toEqual(2)
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('same tree', () => {
    const hooks: any[] = []
    let content = 'foo'
    let calledFoo = 0
    let calledBar = 0
    const Bar = () => {
      if (!hooks.includes(current.hook)) hooks.push(current.hook)
      calledBar++
      return <p>{content}</p>
    }
    const Foo = () => {
      if (!hooks.includes(current.hook)) hooks.push(current.hook)
      calledFoo++
      return <Bar />
    }
    render(<Foo />, c)
    expect(calledFoo).toEqual(1)
    expect(calledBar).toEqual(1)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(hooks.length).toEqual(2)
    content = 'bar'
    hooks.splice(0).forEach(hook => hook.trigger())
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(2)
    expect(calledBar).toEqual(3)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(2)
    expect(calledBar).toEqual(3)
    content = 'zoo'
    hooks.splice(0).forEach(hook => hook.trigger())
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(3)
    expect(calledBar).toEqual(5)
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('123 different tree', () => {
    const hooks: any[] = []
    let content = 'foo'
    let calledFoo = 0
    let calledBar = 0
    const Bar = () => {
      if (!hooks.includes(current.hook)) hooks.push(current.hook)
      calledBar++
      return <p>{content}</p>
    }
    const Foo = () => {
      if (!hooks.includes(current.hook)) hooks.push(current.hook)
      calledFoo++
      return (
        <div>
          <Bar />
        </div>
      )
    }
    render(<Foo />, c)
    expect(calledFoo).toEqual(1)
    expect(calledBar).toEqual(1)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(hooks.length).toEqual(2)
    content = 'bar'
    hooks.splice(0).forEach(hook => hook.trigger())
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(2)
    expect(calledBar).toEqual(3)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(calledFoo).toEqual(2)
    expect(calledBar).toEqual(3)
    content = 'zoo'
    hooks.splice(0).forEach(hook => hook.trigger())
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(3)
    expect(calledBar).toEqual(5)
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('same tree using useHook', () => {
    const hooks: any[] = []
    let content = 'foo'
    let calledFoo = 0
    let calledBar = 0
    const Bar = () => {
      const hook = useHook()
      if (!hooks.includes(hook)) hooks.push(hook)
      calledBar++
      return <p>{content}</p>
    }
    const Foo = () => {
      const hook = useHook()
      if (!hooks.includes(hook)) hooks.push(hook)
      calledFoo++
      return <Bar />
    }
    render(<Foo />, c)
    expect(calledFoo).toEqual(1)
    expect(calledBar).toEqual(1)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(hooks.length).toEqual(2)
    content = 'bar'
    hooks.splice(0).forEach(hook => hook())
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(2)
    expect(calledBar).toEqual(3)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(2)
    expect(calledBar).toEqual(3)
    content = 'zoo'
    hooks.splice(0).forEach(hook => hook())
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(3)
    expect(calledBar).toEqual(5)
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('different tree using useHook', () => {
    const hooks: any[] = []
    let content = 'foo'
    let calledFoo = 0
    let calledBar = 0
    const Bar = () => {
      const hook = useHook()
      if (!hooks.includes(hook)) hooks.push(hook)
      calledBar++
      return <p>{content}</p>
    }
    const Foo = () => {
      const hook = useHook()
      if (!hooks.includes(hook)) hooks.push(hook)
      calledFoo++
      return (
        <div>
          <Bar />
        </div>
      )
    }
    render(<Foo />, c)
    expect(calledFoo).toEqual(1)
    expect(calledBar).toEqual(1)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(hooks.length).toEqual(2)
    content = 'bar'
    hooks.splice(0).forEach(hook => hook())
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(2)
    expect(calledBar).toEqual(3)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(2)
    expect(calledBar).toEqual(3)
    content = 'zoo'
    hooks.splice(0).forEach(hook => hook())
    expect(hooks.length).toEqual(2)
    expect(calledFoo).toEqual(3)
    expect(calledBar).toEqual(5)
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('p inc a number', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return <p>{i++}</p>
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook.trigger()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook.trigger()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook.trigger()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('fragment top', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return <>{i++}</>
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook.trigger()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook.trigger()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook.trigger()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('fragment deep level 1', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        <Foo />
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div>0</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>1</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>2</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>3</div>')
  })

  it('fragment deep level 2', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        <p>
          <Foo />
        </p>
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div><p>0</p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p>1</p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p>2</p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p>3</p></div>')
  })

  it('fragment deep level 3', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        <p>
          <b>
            <Foo />
          </b>
        </p>
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div><p><b>0</b></p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p><b>1</b></p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p><b>2</b></p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p><b>3</b></p></div>')
  })

  it('fragment siblings (last)', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        {[1, 2, 3].map(x => (
          <li key={x}>
            <Foo />
          </li>
        ))}
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div><li>0</li><li>1</li><li>2</li></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><li>0</li><li>1</li><li>3</li></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><li>0</li><li>1</li><li>4</li></div>')
  })

  it('fragment siblings (first)', () => {
    let hook: any
    let i = 0
    const Foo = ({ id }: any) => {
      if (id === 1) hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        {[1, 2, 3].map(x => (
          <li key={x}>
            <Foo id={x} />
          </li>
        ))}
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div><li>0</li><li>1</li><li>2</li></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><li>3</li><li>1</li><li>2</li></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><li>4</li><li>1</li><li>2</li></div>')
  })

  it('fragment siblings (middle)', () => {
    let hook: any
    let i = 0
    const Foo = ({ id }: any) => {
      if (id === 2) hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        {[1, 2, 3].map(x => (
          <li key={x}>
            <Foo id={x} />
          </li>
        ))}
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div><li>0</li><li>1</li><li>2</li></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><li>0</li><li>3</li><li>2</li></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><li>0</li><li>4</li><li>2</li></div>')
  })

  it('fragment siblings (top last)', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        {[1, 2, 3].map(x => (
          <Foo key={x} />
        ))}
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div>012</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>013</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>014</div>')
  })

  it('fragment siblings (top first)', () => {
    let hook: any
    let i = 0
    const Foo = ({ id }: any) => {
      if (id === 1) hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        {[1, 2, 3].map(x => (
          <Foo key={x} id={x} />
        ))}
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div>012</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>312</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>412</div>')
  })

  it('fragment siblings (top middle)', () => {
    let hook: any
    let i = 0
    const Foo = ({ id }: any) => {
      if (id === 2) hook = current.hook
      return <>{i++}</>
    }
    render(
      <div>
        {[1, 2, 3].map(x => (
          <Foo key={x} id={x} />
        ))}
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div>012</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>032</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>042</div>')
  })

  it('multiple deep', () => {
    let hook_bar: any
    let hook_foo: any
    let i = 0
    const Bar = () => {
      hook_bar = hook_bar ?? current.hook
      return <b>{i++}</b>
    }
    const Foo = () => {
      hook_foo = hook_foo ?? current.hook
      return (
        <p>
          {i++}
          <Bar />
        </p>
      )
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toEqual('<p>0<b>1</b></p>')
    hook_bar.trigger()
    expect(clean(c.innerHTML)).toEqual('<p>0<b>2</b></p>')

    hook_foo.trigger()
    expect(clean(c.innerHTML)).toEqual('<p>3<b>4</b></p>')

    hook_bar.trigger()
    expect(clean(c.innerHTML)).toEqual('<p>3<b>5</b></p>')
  })

  it('deep and change', () => {
    let hook_bar: any
    let hook_foo: any
    let i = 0
    const Bar = () => {
      hook_bar = current.hook
      return <b>{i++}</b>
    }
    const Foo = () => {
      hook_foo = current.hook
      return <p>{i++}</p>
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook_foo.trigger()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    render(<Bar />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook_bar.trigger()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('fragment multiple', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return (
        <>
          {i++}
          {i++}
        </>
      )
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toEqual('01')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('23')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('45')
  })

  it('fragment multiple deep level 1', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return (
        <>
          {i++}
          {i++}
        </>
      )
    }
    render(
      <div>
        <Foo />
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div>01</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>23</div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div>45</div>')
  })

  it('fragment multiple deep level 2', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return (
        <>
          {i++}
          {i++}
        </>
      )
    }
    render(
      <div>
        <p>
          <Foo />
        </p>
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div><p>01</p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p>23</p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p>45</p></div>')
  })

  it('fragment siblings multiple deep level 2', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return (
        <>
          {i++}
          {i++}
        </>
      )
    }
    render(
      <div>
        <p>
          {[1, 2, 3].map(x => (
            <Foo key={x} />
          ))}
        </p>
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div><p>012345</p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p>012367</p></div>')
  })

  it('fragment siblings multiple deep level 2 under element', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = current.hook
      return (
        <>
          {i++}
          {i++}
        </>
      )
    }
    render(
      <div>
        <p>
          {[1, 2, 3].map(x => (
            <li key={x}>
              <Foo key={x} />
            </li>
          ))}
        </p>
      </div>,
      c
    )
    expect(clean(c.innerHTML)).toEqual('<div><p><li>01</li><li>23</li><li>45</li></p></div>')
    hook.trigger()
    expect(clean(c.innerHTML)).toEqual('<div><p><li>01</li><li>23</li><li>67</li></p></div>')
  })

  it('useHook', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      hook = useHook()
      return <p>{i++}</p>
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('useCallback', () => {
    let fn: any
    let i = 0
    const Foo = () => {
      fn = useCallback(() => i++)
      return <p>{i}</p>
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    fn()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    fn()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('useCallback passes arguments and this', () => {
    let fn: any
    let i = 0
    let target
    let self
    const Foo = () => {
      fn = useCallback(function (this: any, e: any) {
        i++
        target = e.target
        self = this
      })
      return <button onclick={fn}>{i}</button>
    }
    render(<Foo />, c)
    const button = c.querySelector('button')
    expect(button.nodeName).toEqual('BUTTON')
    expect(button.textContent).toEqual('0')
    expect(clean(c.innerHTML)).toMatchSnapshot()
    button.click()
    expect(button.textContent).toEqual('1')
    expect(target).toBe(button)
    expect(self).toBe(button)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    button.click()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    expect(target).toBe(button)
    expect(self).toBe(button)
  })

  it('useCallback return value on original handler (sanity)', () => {
    let fn: any
    let i = 0
    let target
    let self
    let prevented = false
    const onClick = (e: any) => {
      prevented = e.defaultPrevented
    }
    const Foo = () => {
      fn = useCallback(function (this: any, e: any) {
        i++
        target = e.target
        self = this
      })
      return (
        <div onclick={onClick}>
          <button onclick={fn}>{i}</button>
        </div>
      )
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    const button = c.querySelector('button')
    expect(button.nodeName).toEqual('BUTTON')
    expect(button.textContent).toEqual('0')
    button.click()
    expect(button.textContent).toEqual('1')
    expect(target).toBe(button)
    expect(self).toBe(button)
    expect(prevented).toBe(false)
  })

  it('useCallback return value on original handler (return false)', () => {
    let fn: any
    let i = 0
    let target
    let self
    let prevented = false
    const onClick = (e: any) => {
      prevented = e.defaultPrevented
    }
    const Foo = () => {
      fn = useCallback(function (this: any, e: any) {
        i++
        target = e.target
        self = this
        return false
      })
      return (
        <div onclick={onClick}>
          <button onclick={fn}>{i}</button>
        </div>
      )
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    const button = c.querySelector('button')
    expect(button.nodeName).toEqual('BUTTON')
    expect(button.textContent).toEqual('0')
    button.click()
    expect(button.textContent).toEqual('1')
    expect(target).toBe(button)
    expect(self).toBe(button)
    expect(prevented).toBe(true)
  })

  it('deep hook 2 layers', () => {
    let hook: any
    let i = 0
    const Bar = () => {
      hook = useHook()
      return <p>{i++}</p>
    }
    const Foo = () => {
      return <Bar />
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('deep hook 3 layers', () => {
    let hook: any
    let i = 0
    const Zoo = () => {
      hook = useHook()
      return <p>{i++}</p>
    }
    const Bar = () => {
      return <Zoo />
    }
    const Foo = () => {
      return <Bar />
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('deep hook 3 layers, top div', () => {
    let hook: any
    let i = 0
    const Zoo = () => {
      hook = useHook()
      return <p>{i++}</p>
    }
    const Bar = () => {
      return <Zoo />
    }
    const Foo = () => {
      return (
        <div>
          <Bar />
        </div>
      )
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('prevent retrigger', () => {
    let hook: any
    let i = 0
    const Foo = () => {
      if (!hook) hook = useHook()
      return <p>{i++}</p>
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hook()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('empty fragment that updates', () => {
    let hook: any
    let cond = false
    const Foo = () => {
      hook = current.hook
      return !cond ? <></> : <div>ok</div>
    }
    render(<Foo />, c)
    expect(c.textContent).toEqual('')
    cond = true
    hook.trigger()
    expect(c.textContent).toEqual('ok')
  })

  it('fragment that updates deep', () => {
    let hook: any
    let cond = false
    const Bar = () => {
      hook = current.hook
      return !cond ? <></> : <div>ok</div>
    }
    const Foo = () => {
      return <Bar />
    }
    render(<Foo />, c)
    expect(c.textContent).toEqual('')
    cond = true
    hook.trigger()
    expect(c.textContent).toEqual('ok')
  })

  it('xx fragment that updates deep fragment', () => {
    let hook: any
    let cond = false
    const called: string[] = []
    const Bar = () => {
      hook = current.hook
      called.push('bar')
      return !cond ? <></> : <>ok</>
    }
    const Foo = () => {
      called.push('foo')
      return <Bar />
    }
    render(<Foo />, c)
    expect(c.textContent).toEqual('')
    expect(called).toEqual(['foo', 'bar'])

    cond = true
    hook.trigger()
    expect(c.textContent).toEqual('ok')
    expect(called).toEqual(['foo', 'bar', 'bar'])
  })

  it('fragment that updates deep fragment, first div', () => {
    let hook: any
    let cond = false
    const Bar = () => {
      hook = current.hook
      return !cond ? <div></div> : <>ok</>
    }
    const Foo = () => {
      return <Bar />
    }
    render(<Foo />, c)
    expect(c.textContent).toEqual('')
    cond = true
    hook.trigger()
    expect(c.textContent).toEqual('ok')
  })

  it('multiple hooks same parent', () => {
    let hookA: any
    let hookB: any
    let i = 0
    const Foo = () => {
      hookA = useHook()
      hookB = useHook()
      return <p>{i++}</p>
    }
    render(<Foo />, c)
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hookA()
    expect(clean(c.innerHTML)).toMatchSnapshot()
    hookB()
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })
})
