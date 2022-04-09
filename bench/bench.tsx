import { render as preact_render } from 'preact'
import * as preact from 'preact/jsx-runtime'
import * as vdom from '../src'
import { setEngine } from './jsx-runtime'

let render
const shuffle = (arr: any[]) => arr.sort(() => (Math.random() > 0.5 ? 1 : -1))
const shuffleOne = (arr: any[]) => {
  const index = Math.floor(Math.random() * arr.length)
  const item = arr.splice(index, 1)[0]
  arr.splice(Math.floor(Math.random() * arr.length), 0, item)
  return arr
}

export const cases = Object.fromEntries(
  Object.entries({
    // single: () => {
    //   render(
    //     <>
    //       <h1>hello world</h1>
    //     </>,
    //     document.body
    //   )
    // },

    // deep: () => {
    //   render(
    //     <>
    //       <div>
    //         <p>
    //           <h1>hello world</h1>
    //         </p>
    //         <p>
    //           <h1>hello world</h1>
    //         </p>
    //         <p>
    //           <h1>hello world</h1>
    //         </p>
    //       </div>
    //     </>,
    //     document.body
    //   )
    // },

    shuffleOne: () => {
      const Foo = ({ key }) => <h1 key={key}>{key}</h1>
      const list = shuffleOne([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      render(
        <>
          {list.map(x => <Foo key={x} />)}
        </>,
        document.body
      )
    },
    shuffleAll: () => {
      const Foo = ({ key }) => <h1 key={key}>{key}</h1>
      const list = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      render(
        <>
          {list.map(x => <Foo key={x} />)}
        </>,
        document.body
      )
    },
    shuffleHuge: () => {
      const Foo = ({ children, key }: any) => <h5 key={key}>{children}</h5>
      const list = shuffle(Array.from({ length: 100 }).map((_, i) => i))
      render(
        <>
          {list.map(x => <Foo key={x}>{x}</Foo>)}
        </>,
        document.body
      )
    },
  })
    .map(([c, fn]) => {
      return [
        [
          c + ' (vdom)',
          () => {
            setEngine(vdom)
            render = vdom.render
            fn()
          },
        ],
        [
          c + ' (preact)',
          () => {
            setEngine(preact)
            render = preact_render
            fn()
          },
        ],
      ]
    })
    .flat()
)
