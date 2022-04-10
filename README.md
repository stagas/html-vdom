<h1>
html-vdom <a href="https://npmjs.org/package/html-vdom"><img src="https://img.shields.io/badge/npm-v2.0.1-F00.svg?colorA=000"/></a> <a href="src"><img src="https://img.shields.io/badge/loc-389-FFF.svg?colorA=000"/></a> <a href="https://cdn.jsdelivr.net/npm/html-vdom@2.0.1/dist/html-vdom.min.js"><img src="https://img.shields.io/badge/brotli-1.7K-333.svg?colorA=000"/></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F0B.svg?colorA=000"/></a>
</h1>

<p></p>

JSX virtual DOM using standard HTML

<h4>
<table><tr><td title="Triple click to select and copy paste">
<code>npm i html-vdom </code>
</td><td title="Triple click to select and copy paste">
<code>pnpm add html-vdom </code>
</td><td title="Triple click to select and copy paste">
<code>yarn add html-vdom</code>
</td></tr></table>
</h4>

## Examples

<details id="example$from-element" title="from-element" open><summary><span><a href="#example$from-element">#</a></span>  <code><strong>from-element</strong></code></summary>  <ul>    <details id="source$from-element" title="from-element source code" ><summary><span><a href="#source$from-element">#</a></span>  <code><strong>view source</strong></code></summary>  <a href="example/from-element.tsx">example/from-element.tsx</a>  <p>

```tsx
/** @jsxImportSource html-vdom */
import { render } from 'html-vdom'
import { fromElement } from 'html-vdom/from-element'

class FooElement extends HTMLElement {
  root = this.attachShadow({ mode: 'open' })
  set who(name: string) {
    this.root.innerHTML = 'Hello, ' + name
  }
}

const Foo = fromElement(FooElement)
render(<Foo who="world" />, document.body)
```

</p>
</details></ul></details><details id="example$simple" title="simple" open><summary><span><a href="#example$simple">#</a></span>  <code><strong>simple</strong></code></summary>  <ul>    <details id="source$simple" title="simple source code" open><summary><span><a href="#source$simple">#</a></span>  <code><strong>view source</strong></code></summary>  <a href="example/simple.tsx">example/simple.tsx</a>  <p>

```tsx
/** @jsxImportSource html-vdom */
import { $, render } from 'html-vdom'

const App: $<{ who: string }> = ({ who }) => <h1>Hello, {who}!</h1>
render(<App who="world" />, document.body)
```

</p>
</details></ul></details><details id="example$with-hook" title="with-hook" open><summary><span><a href="#example$with-hook">#</a></span>  <code><strong>with-hook</strong></code></summary>  <ul>    <details id="source$with-hook" title="with-hook source code" ><summary><span><a href="#source$with-hook">#</a></span>  <code><strong>view source</strong></code></summary>  <a href="example/with-hook.tsx">example/with-hook.tsx</a>  <p>

```tsx
/** @jsxImportSource html-vdom */
import { $, Hook, hook, render } from 'html-vdom'

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
```

</p>
</details></ul></details>

## API

<p>  <details id="Chunk$45" title="Class" ><summary><span><a href="#Chunk$45">#</a></span>  <code><strong>Chunk</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L113">src/jsx-runtime.ts#L113</a>  <ul>        <p>  <details id="constructor$46" title="Constructor" ><summary><span><a href="#constructor$46">#</a></span>  <code><strong>constructor</strong></code><em>(arrayLength)</em>    </summary>    <ul>    <p>  <details id="new Chunk$47" title="ConstructorSignature" ><summary><span><a href="#new Chunk$47">#</a></span>  <code><strong>new Chunk</strong></code><em>()</em>    </summary>    <ul><p><a href="#Chunk$45">Chunk</a></p>      <p>  <details id="arrayLength$48" title="Parameter" ><summary><span><a href="#arrayLength$48">#</a></span>  <code><strong>arrayLength</strong></code>    </summary>    <ul><p>number</p>        </ul></details></p>  </ul></details></p>    </ul></details><details id="dom$50" title="Property" ><summary><span><a href="#dom$50">#</a></span>  <code><strong>dom</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>[]</code></span>  </summary>  <a href="src/jsx-runtime.ts#L115">src/jsx-runtime.ts#L115</a>  <ul><p><span>El</span>  []</p>        </ul></details><details id="firstChild$49" title="Property" ><summary><span><a href="#firstChild$49">#</a></span>  <code><strong>firstChild</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L114">src/jsx-runtime.ts#L114</a>  <ul><p>any</p>        </ul></details><details id="last$51" title="Accessor" ><summary><span><a href="#last$51">#</a></span>  <code><strong>last</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L116">src/jsx-runtime.ts#L116</a>  <ul>        </ul></details><details id="nextSibling$53" title="Accessor" ><summary><span><a href="#nextSibling$53">#</a></span>  <code><strong>nextSibling</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L119">src/jsx-runtime.ts#L119</a>  <ul>        </ul></details><details id="after$61" title="Method" ><summary><span><a href="#after$61">#</a></span>  <code><strong>after</strong></code><em>(x)</em>    </summary>  <a href="src/jsx-runtime.ts#L128">src/jsx-runtime.ts#L128</a>  <ul>    <p>    <details id="x$63" title="Parameter" ><summary><span><a href="#x$63">#</a></span>  <code><strong>x</strong></code>    </summary>    <ul><p><span>Node</span></p>        </ul></details>  <p><strong>after</strong><em>(x)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="appendChild$58" title="Method" ><summary><span><a href="#appendChild$58">#</a></span>  <code><strong>appendChild</strong></code><em>(x)</em>    </summary>  <a href="src/jsx-runtime.ts#L125">src/jsx-runtime.ts#L125</a>  <ul>    <p>    <details id="x$60" title="Parameter" ><summary><span><a href="#x$60">#</a></span>  <code><strong>x</strong></code>    </summary>    <ul><p>any</p>        </ul></details>  <p><strong>appendChild</strong><em>(x)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="insertBefore$55" title="Method" ><summary><span><a href="#insertBefore$55">#</a></span>  <code><strong>insertBefore</strong></code><em>(x)</em>    </summary>  <a href="src/jsx-runtime.ts#L122">src/jsx-runtime.ts#L122</a>  <ul>    <p>    <details id="x$57" title="Parameter" ><summary><span><a href="#x$57">#</a></span>  <code><strong>x</strong></code>    </summary>    <ul><p>any</p>        </ul></details>  <p><strong>insertBefore</strong><em>(x)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="remove$66" title="Method" ><summary><span><a href="#remove$66">#</a></span>  <code><strong>remove</strong></code><em>()</em>    </summary>  <a href="src/jsx-runtime.ts#L134">src/jsx-runtime.ts#L134</a>  <ul>    <p>      <p><strong>remove</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="removeChild$68" title="Method" ><summary><span><a href="#removeChild$68">#</a></span>  <code><strong>removeChild</strong></code><em>(x)</em>    </summary>  <a href="src/jsx-runtime.ts#L138">src/jsx-runtime.ts#L138</a>  <ul>    <p>    <details id="x$70" title="Parameter" ><summary><span><a href="#x$70">#</a></span>  <code><strong>x</strong></code>    </summary>    <ul><p>any</p>        </ul></details>  <p><strong>removeChild</strong><em>(x)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="save$64" title="Method" ><summary><span><a href="#save$64">#</a></span>  <code><strong>save</strong></code><em>()</em>    </summary>  <a href="src/jsx-runtime.ts#L131">src/jsx-runtime.ts#L131</a>  <ul>    <p>      <p><strong>save</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details></p></ul></details><details id="DOMAttributes$85" title="Interface" ><summary><span><a href="#DOMAttributes$85">#</a></span>  <code><strong>DOMAttributes</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L8">src/jsx-runtime.ts#L8</a>  <ul>        <p>  <details id="innerHTML$89" title="Property" ><summary><span><a href="#innerHTML$89">#</a></span>  <code><strong>innerHTML</strong></code>     &ndash; Sets the <code>innerHTML</code> of an element to the <strong>exact</strong> string <strong>without</strong> escaping.</summary>  <a href="src/jsx-runtime.ts#L53">src/jsx-runtime.ts#L53</a>  <ul><p>string</p>        </ul></details></p></ul></details><details id="VRef$21" title="Interface" ><summary><span><a href="#VRef$21">#</a></span>  <code><strong>VRef</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L64">src/jsx-runtime.ts#L64</a>  <ul>        <p>  <details id="current$22" title="Property" ><summary><span><a href="#current$22">#</a></span>  <code><strong>current</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L65">src/jsx-runtime.ts#L65</a>  <ul><p><a href="#T$23">T</a></p>        </ul></details></p></ul></details><details id="$$14" title="TypeAlias" ><summary><span><a href="#$$14">#</a></span>  <code><strong>$</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L62">src/jsx-runtime.ts#L62</a>  <ul><p><details id="__type$15" title="Function" ><summary><span><a href="#__type$15">#</a></span>  <em>(props)</em>    </summary>    <ul>    <p>    <details id="props$17" title="Parameter" ><summary><span><a href="#props$17">#</a></span>  <code><strong>props</strong></code>    </summary>    <ul><p><a href="#T$20">T</a> &amp; {<p>  <details id="children$19" title="Property" ><summary><span><a href="#children$19">#</a></span>  <code><strong>children</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L62">src/jsx-runtime.ts#L62</a>  <ul><p>any</p>        </ul></details></p>}</p>        </ul></details>  <p><strong></strong><em>(props)</em>  &nbsp;=&gt;  <ul><span>JSX.Element</span></ul></p></p>    </ul></details></p>        </ul></details><details id="Hook$28" title="TypeAlias" ><summary><span><a href="#Hook$28">#</a></span>  <code><strong>Hook</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L85">src/jsx-runtime.ts#L85</a>  <ul><p><span>Fn</span> &amp; {<p>  <details id="fn$30" title="Property" ><summary><span><a href="#fn$30">#</a></span>  <code><strong>fn</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L85">src/jsx-runtime.ts#L85</a>  <ul><p><span>Fn</span></p>        </ul></details><details id="onremove$31" title="Property" ><summary><span><a href="#onremove$31">#</a></span>  <code><strong>onremove</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L85">src/jsx-runtime.ts#L85</a>  <ul><p><span>Fn</span></p>        </ul></details></p>} &amp; <span>Record</span>&lt;string, any&gt;</p>        </ul></details><details id="Props$32" title="TypeAlias" ><summary><span><a href="#Props$32">#</a></span>  <code><strong>Props</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L86">src/jsx-runtime.ts#L86</a>  <ul><p><span>Record</span>&lt;string, any&gt;</p>        </ul></details><details id="VFn$24" title="TypeAlias" ><summary><span><a href="#VFn$24">#</a></span>  <code><strong>VFn</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L70">src/jsx-runtime.ts#L70</a>  <ul><p><details id="__type$25" title="Function" ><summary><span><a href="#__type$25">#</a></span>  <em>(props)</em>    </summary>    <ul>    <p>    <details id="props$27" title="Parameter" ><summary><span><a href="#props$27">#</a></span>  <code><strong>props</strong></code>    </summary>    <ul><p>any</p>        </ul></details>  <p><strong></strong><em>(props)</em>  &nbsp;=&gt;  <ul><span>VKid</span></ul></p></p>    </ul></details></p>        </ul></details><details id="VNode$71" title="TypeAlias" ><summary><span><a href="#VNode$71">#</a></span>  <code><strong>VNode</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L87">src/jsx-runtime.ts#L87</a>  <ul><p>{<p>  <details id="hook$76" title="Property" ><summary><span><a href="#hook$76">#</a></span>  <code><strong>hook</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L91">src/jsx-runtime.ts#L91</a>  <ul><p><a href="#Hook$28">Hook</a></p>        </ul></details><details id="keep$77" title="Property" ><summary><span><a href="#keep$77">#</a></span>  <code><strong>keep</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L92">src/jsx-runtime.ts#L92</a>  <ul><p>boolean</p>        </ul></details><details id="key$75" title="Property" ><summary><span><a href="#key$75">#</a></span>  <code><strong>key</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L90">src/jsx-runtime.ts#L90</a>  <ul><p>string</p>        </ul></details><details id="kind$73" title="Property" ><summary><span><a href="#kind$73">#</a></span>  <code><strong>kind</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L88">src/jsx-runtime.ts#L88</a>  <ul><p><a href="#T$78">T</a></p>        </ul></details><details id="props$74" title="Property" ><summary><span><a href="#props$74">#</a></span>  <code><strong>props</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L89">src/jsx-runtime.ts#L89</a>  <ul><p><a href="#Props$32">Props</a></p>        </ul></details></p>}</p>        </ul></details><details id="Fragment$33" title="Variable" ><summary><span><a href="#Fragment$33">#</a></span>  <code><strong>Fragment</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>...</code></span>  </summary>  <a href="src/jsx-runtime.ts#L96">src/jsx-runtime.ts#L96</a>  <ul><p>typeof   <a href="#Fragment$33">Fragment</a></p>        </ul></details><details id="hook$44" title="Variable" ><summary><span><a href="#hook$44">#</a></span>  <code><strong>hook</strong></code>    </summary>  <a href="src/jsx-runtime.ts#L103">src/jsx-runtime.ts#L103</a>  <ul><p><a href="#Hook$28">Hook</a></p>        </ul></details><details id="createProps$1" title="Function" ><summary><span><a href="#createProps$1">#</a></span>  <code><strong>createProps</strong></code><em>(el, type, props, attrs, cacheRef)</em>    </summary>  <a href="src/props.ts#L129">src/props.ts#L129</a>  <ul>    <p>    <details id="el$3" title="Parameter" ><summary><span><a href="#el$3">#</a></span>  <code><strong>el</strong></code>    </summary>    <ul><p><span>Element</span></p>        </ul></details><details id="type$4" title="Parameter" ><summary><span><a href="#type$4">#</a></span>  <code><strong>type</strong></code>    </summary>    <ul><p>string</p>        </ul></details><details id="props$5" title="Parameter" ><summary><span><a href="#props$5">#</a></span>  <code><strong>props</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>{}</code></span>  </summary>    <ul><p><a href="#Props$32">Props</a></p>        </ul></details><details id="attrs$6" title="Parameter" ><summary><span><a href="#attrs$6">#</a></span>  <code><strong>attrs</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>{}</code></span>  </summary>    <ul><p><span>Record</span>&lt;string, <span>Attr</span>&gt;</p>        </ul></details><details id="cacheRef$7" title="Parameter" ><summary><span><a href="#cacheRef$7">#</a></span>  <code><strong>cacheRef</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>el</code></span>  </summary>    <ul><p>object</p>        </ul></details>  <p><strong>createProps</strong><em>(el, type, props, attrs, cacheRef)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="jsx$34" title="Function" ><summary><span><a href="#jsx$34">#</a></span>  <code><strong>jsx</strong></code><em>(kind, props, key)</em>    </summary>  <a href="src/jsx-runtime.ts#L97">src/jsx-runtime.ts#L97</a>  <ul>    <p>    <details id="kind$36" title="Parameter" ><summary><span><a href="#kind$36">#</a></span>  <code><strong>kind</strong></code>    </summary>    <ul><p>any</p>        </ul></details><details id="props$37" title="Parameter" ><summary><span><a href="#props$37">#</a></span>  <code><strong>props</strong></code>    </summary>    <ul><p>any</p>        </ul></details><details id="key$38" title="Parameter" ><summary><span><a href="#key$38">#</a></span>  <code><strong>key</strong></code>    </summary>    <ul><p>any</p>        </ul></details>  <p><strong>jsx</strong><em>(kind, props, key)</em>  &nbsp;=&gt;  <ul>any</ul></p></p>    </ul></details><details id="jsxs$39" title="Function" ><summary><span><a href="#jsxs$39">#</a></span>  <code><strong>jsxs</strong></code><em>(kind, props, key)</em>    </summary>  <a href="src/jsx-runtime.ts#L101">src/jsx-runtime.ts#L101</a>  <ul>    <p>    <details id="kind$41" title="Parameter" ><summary><span><a href="#kind$41">#</a></span>  <code><strong>kind</strong></code>    </summary>    <ul><p>any</p>        </ul></details><details id="props$42" title="Parameter" ><summary><span><a href="#props$42">#</a></span>  <code><strong>props</strong></code>    </summary>    <ul><p>any</p>        </ul></details><details id="key$43" title="Parameter" ><summary><span><a href="#key$43">#</a></span>  <code><strong>key</strong></code>    </summary>    <ul><p>any</p>        </ul></details>  <p><strong>jsxs</strong><em>(kind, props, key)</em>  &nbsp;=&gt;  <ul>any</ul></p></p>    </ul></details><details id="render$79" title="Function" ><summary><span><a href="#render$79">#</a></span>  <code><strong>render</strong></code><em>(n, el, doc, withNull)</em>    </summary>  <a href="src/jsx-runtime.ts#L162">src/jsx-runtime.ts#L162</a>  <ul>    <p>    <details id="n$81" title="Parameter" ><summary><span><a href="#n$81">#</a></span>  <code><strong>n</strong></code>    </summary>    <ul><p><span>VKid</span></p>        </ul></details><details id="el$82" title="Parameter" ><summary><span><a href="#el$82">#</a></span>  <code><strong>el</strong></code>    </summary>    <ul><p><span>TargetEl</span></p>        </ul></details><details id="doc$83" title="Parameter" ><summary><span><a href="#doc$83">#</a></span>  <code><strong>doc</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>html</code></span>  </summary>    <ul><p><span>Doc</span></p>        </ul></details><details id="withNull$84" title="Parameter" ><summary><span><a href="#withNull$84">#</a></span>  <code><strong>withNull</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>false</code></span>  </summary>    <ul><p>boolean</p>        </ul></details>  <p><strong>render</strong><em>(n, el, doc, withNull)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="updateProps$8" title="Function" ><summary><span><a href="#updateProps$8">#</a></span>  <code><strong>updateProps</strong></code><em>(el, type, next, cacheRef)</em>    </summary>  <a href="src/props.ts#L140">src/props.ts#L140</a>  <ul>    <p>    <details id="el$10" title="Parameter" ><summary><span><a href="#el$10">#</a></span>  <code><strong>el</strong></code>    </summary>    <ul><p><span>Element</span></p>        </ul></details><details id="type$11" title="Parameter" ><summary><span><a href="#type$11">#</a></span>  <code><strong>type</strong></code>    </summary>    <ul><p>string</p>        </ul></details><details id="next$12" title="Parameter" ><summary><span><a href="#next$12">#</a></span>  <code><strong>next</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>{}</code></span>  </summary>    <ul><p><a href="#Props$32">Props</a></p>        </ul></details><details id="cacheRef$13" title="Parameter" ><summary><span><a href="#cacheRef$13">#</a></span>  <code><strong>cacheRef</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>el</code></span>  </summary>    <ul><p>object</p>        </ul></details>  <p><strong>updateProps</strong><em>(el, type, next, cacheRef)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details></p>

## Credits

- [html-jsx](https://npmjs.org/package/html-jsx) by [stagas](https://github.com/stagas) &ndash; Extensible jsx type definitions for standard html interfaces.

## Contributing

[Fork](https://github.com/stagas/html-vdom/fork) or [edit](https://github.dev/stagas/html-vdom) and submit a PR.

All contributions are welcome!

## License

<a href="LICENSE">MIT</a> &copy; 2022 [stagas](https://github.com/stagas)
