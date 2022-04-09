/** @jsxImportSource ../src */
import { $, Hook, hook, render } from '../src'

let greeting = 'Hello'
let update: Hook

const App: $<{ who: string }> = ({ who }) => {
  update = hook
  return <h1>{greeting}, {who}!</h1>
}

render(<App who="world" />, document.body)

setTimeout(() => {
  greeting = 'Hiya'
  update()
}, 500)
