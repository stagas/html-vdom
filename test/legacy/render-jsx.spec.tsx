/// <reference lib="esnext" />
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, h, render } from '../../src'

let c: any
beforeEach(() => (c = document.createElement('div')))

const clean = (s: string) =>
  s.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '').replaceAll('<!---->', '')

describe('jsx', () => {
  it('single fragment', () => {
    render(<></>, c)
  })

  it('single fragment function', () => {
    const Foo = () => <></>
    render(<Foo />, c)
  })

  it('passing ...props to real element', () => {
    const Foo = (props: any) => <div {...props}></div>
    render(<Foo style="width:10px" />, c)
  })

  it('updating ...props to real element', () => {
    const Foo = (props: any) => <div {...props}></div>
    render(<Foo style="width:10px" />, c)
    render(<Foo style="width:10px" />, c)
  })

  it('x313 function w/keyed children', () => {
    const Foo = () => <li></li>
    {
      render(
        <>
          {[1, 2, 3].map(x => (
            <Foo key={x} />
          ))}
        </>,
        c
      )
      expect(clean(c.innerHTML)).toMatchSnapshot()
      const lis: any = Array.from(c.childNodes)
      expect(lis[0].nodeName).toEqual('LI')
      render(
        <>
          {[0, 1, 2, 3].map(x => (
            <Foo key={x} />
          ))}
        </>,
        c
      )
      expect(clean(c.innerHTML)).toMatchSnapshot()
      const res: any = Array.from(c.childNodes)
      expect(res[1]).toBe(lis[0])
    }
  })

  it('function w/keyed array and a different element', () => {
    const Foo = () => <li></li>
    {
      render(
        <>
          {[1, 2, 3].map(x => (
            <Foo key={x} />
          ))}
          <div id="another"></div>
        </>,
        c
      )
      expect(clean(c.innerHTML)).toMatchSnapshot()
      const lis: any = [...c.querySelectorAll('*')]
      expect(lis[0].nodeName).toEqual('LI')
      render(
        <>
          <div id="another"></div>
          {[0, 1, 2, 3].map(x => (
            <Foo key={x} />
          ))}
        </>,
        c
      )
      expect(clean(c.innerHTML)).toMatchSnapshot()
      render(
        <>
          {[0, 1, 2, 3, 4, 5].map(x => (
            <Foo key={x} />
          ))}
          <div id="another"></div>
        </>,
        c
      )
      expect(clean(c.innerHTML)).toMatchSnapshot()
    }
  })

  it('x function w/keyed children and value', () => {
    const Foo = ({ value }: any) => <li>{value}</li>
    {
      render(
        <>
          {[1, 2, 3].map(x => (
            <Foo key={x} value={x} />
          ))}
        </>,
        c
      )
      expect(clean(c.innerHTML)).toMatchSnapshot()
      const lis: any = c.querySelectorAll('li')
      expect(lis[0].nodeName).toEqual('LI')
      render(
        <>
          {[0, 1, 2, 3].map(x => (
            <Foo key={x} value={x} />
          ))}
        </>,
        c
      )
      expect(clean(c.innerHTML)).toMatchSnapshot()
      const res: any = c.querySelectorAll('li')
      expect(res[1]).toBe(lis[0])
      expect(res[2]).toBe(lis[1])
      expect(res[3]).toBe(lis[2])
      expect(res[0].textContent).toEqual('0')
      expect(res[1].textContent).toEqual('1')
      expect(res[2].textContent).toEqual('2')
      expect(res[3].textContent).toEqual('3')
    }
  })

  it('complex case 2', () => {
    let i = 10

    const prop = 'foo'
    const onClick = () => {
      /* void */
    }
    const randomly = () => Math.random() - 0.5

    const factory = () => (
      <div>
        <span class={prop}>{i}</span>
        and some text
        <input autofocus={i % 5 === 0} type="text" />
        <img crossorigin="anonymous" title="more" alt="to make it realistic" width="300" />
        <div>
          more
          <a>hey</a>
          <>
            {Array(count * 2 - i * 2)
              .fill(0)
              .map((_, i: number) => (
                <div key={i}>
                  nesting<div>!!!</div>
                </div>
              ))
              .sort(randomly)}
          </>
        </div>
        <ul>
          {Array(i * 2)
            .fill(0)
            .map((_, ii: number) => (
              <li
                key={ii}
                onclick={i % 5 === 0 ? onClick : undefined}
                style={
                  i % 3 !== 0
                    ? {
                        width: '200px',
                        height: '50px',
                        color: 'blue',
                        background: 'red',
                        overflow: 'hidden',
                      }
                    : { height: '250px', color: 'blue' }
                }
              >
                {i}
              </li>
            ))
            .sort(randomly)}
        </ul>
      </div>
    )

    const count = 10
    for (i = 0; i < count; i++) {
      render(factory(), c)
      expect(c.firstChild.nodeName).toEqual('DIV')
    }
    // expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('pass props correctly to children', () => {
    let i = 0
    const Foo = () => {
      return <div class={i % 2 === 0 ? 'yes' : 'no'}>{i++}</div>
    }
    render(
      <>
        {[1, 2, 3].map(x => (
          <Foo key={x} />
        ))}
      </>,
      c
    )
    expect(clean(c.innerHTML)).toMatchSnapshot()
    render(
      <>
        {[4, 5, 6].map(x => (
          <Foo key={x} />
        ))}
      </>,
      c
    )
    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('replaces an element node with a text node', () => {
    render(
      <>
        {false}
        <p>world</p>
      </>,
      c
    )

    expect(clean(c.innerHTML)).toMatchSnapshot()

    render(
      <>
        <p>hello</p>
        {false}
        <p>world</p>
      </>,
      c
    )

    expect(clean(c.innerHTML)).toMatchSnapshot()
  })

  it('replaces text nodes properly', () => {
    render(
      <>
        {'foo'}
        {'bar'}
      </>,
      c
    )

    expect(clean(c.innerHTML)).toMatchSnapshot()

    render(
      <>
        {'zoo'}
        {'foo'}
        {'bar'}
      </>,
      c
    )

    expect(clean(c.innerHTML)).toMatchSnapshot()
  })
})
