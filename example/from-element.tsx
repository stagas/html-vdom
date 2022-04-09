/** @jsxImportSource ../src */
import { render } from '../src'
import { fromElement } from '../src/from-element'

class FooElement extends HTMLElement {
  root = this.attachShadow({ mode: 'open' })
  set who(name: string) {
    this.root.innerHTML = 'Hello, ' + name
  }
}

const Foo = fromElement(FooElement)
render(<Foo who="world" />, document.body)
