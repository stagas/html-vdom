import { VAtom, JSXChild, JSXFunction, JSXProps, JSXReturn } from '.'
import { VList } from './v'
import { diff } from './diff'
import { atomEq, domEq } from './eq'
import { createProps, updateProps } from './props'

// import { inspect } from 'util'
// const log = (...args: any[]) => console.log(...args.map(x => inspect(x, false, Infinity, true)))

type Doc = typeof xhtml
type View = VList<VAtom>
type VAtomFunc = VAtom & [JSXFunction, JSXProps, VList<JSXReturn>]
type VAtomHtml = VAtom & [string, JSXProps, VList<JSXChild>]
type VAtomText = VAtom & [typeof Text, null, string]

interface NodeFactory {
  create(atom: VAtom, doc: Doc): Node
  update(next: VAtom, prev: VAtom, node: Node): void
}

const MapIm = WeakMap // Map | WeakMap
const atoms: WeakMap<Node, VAtom> = new MapIm()
const nodes: WeakMap<VAtom, Node> = new MapIm()
const views: WeakMap<VAtom | Node, View> = new MapIm()
const hooks: WeakMap<VAtomFunc, VHook> = new MapIm()
const docs: WeakMap<View, Doc> = new MapIm()

const attach = (atom: VAtom, node: Node) => {
  nodes.set(atom, node)
  atoms.set(node, atom)
}

export const render = (next: VList<VAtom> | VAtom, target: Node | VAtom) => {
  mounted.clear()
  unmounted.clear()
  const view = renderList(next, target)
  captured.clear()
  materialize(view, target as Node)
  mounted.forEach(mount)
  unmounted.forEach(unmount)
}

export const renderList = (
  next: VList<VAtom> | VAtom,
  target: Node | VAtom,
  doc: Doc = xhtml
): View => {
  if (!(next instanceof VList)) return renderList(new VList(next), target, doc)

  // get or create the persistent view that will reflect the dom state
  let view = views.get(target)
  if (!view) views.set(target, (view = new VList<VAtom>()))

  const { added, removed } = diff(atomEq, view, next, view)
  added.forEach(x => mounted.add(x))
  removed.forEach(x => unmounted.add(x))

  let i = 0
  for (const atom of view) {
    const node = nodes.get(atom)

    // update
    if (node) {
      ctor(atom).update?.(next[i], atom, node)
      if (next[i][2] instanceof VList) renderList(next[i][2], atom, docs.get(atom[2]) ?? doc)
      else atom[2] = next[i][2]
    }

    // create
    else {
      attach(atom, ctor(atom).create(atom, docs.get(view) ?? doc))
      if (atom[2] instanceof VList) renderList(atom[2], atom, docs.get(atom[2]) ?? doc)
    }

    i++
  }

  return view
}

const triggerFactory = (event: 'mount' | 'unmount') =>
  function run(atom: VAtom | void) {
    if (!atom) return
    const hook = hooks.get(atom as VAtomFunc)
    const view = views.get(atom)
    if (hook) hook[event]()
    if (view) [...view].forEach(run)
  }

const mount = triggerFactory('mount')
const unmount = triggerFactory('unmount')
const mounted: Set<VAtom> = new Set()
const unmounted: Set<VAtom> = new Set()

const doms: WeakMap<Node, View> = new MapIm()
const prevs: WeakMap<View, Node[]> = new MapIm()
const targets: WeakMap<View, Node> = new MapIm()
const captured: Set<View> = new Set()

const materialize = (view: View, target: Node) => {
  if (!view) return target
  doms.set(target, view)
  const nextDOM = toDOM(view)
  const prevDOM = prevs.get(view)
  diff(domEq, <never>target, nextDOM, prevDOM)
  prevs.set(view, nextDOM)
  captured.add(view)
  if (target instanceof Node) captured.forEach(view => targets.set(view, target))
  return target
}

const toDOM = (view: View): Node[] =>
  new VList(
    ...[...new Set(view.flatten())].map(x => materialize(views.get(x)!, nodes.get(x)!))
  ).flatten()

type Fn = () => void

class VHook {
  #mounted = false
  onmount: Fn | null = null
  onunmount: Fn | null = null

  atom: VAtomFunc

  constructor(atom: VAtomFunc) {
    this.atom = atom
    hooks.set(atom, this)
  }

  trigger = () => {
    if (!this.#mounted) {
      console.trace(this.atom)
      throw new Error('Trigger failed: Hook is not mounted')
    }
    const { atom } = this
    const node = nodes.get(atom)!
    render(atom, node)
    const target = targets.get(views.get(atom)!)!
    materialize(doms.get(target)!, target)
  }

  mount = () => {
    this.#mounted = true
    this.onmount?.()
  }

  unmount = () => {
    this.#mounted = false
    this.onunmount?.()
  }
}

interface Provider {
  hook: VHook | null
}

export let current: Provider = { hook: null }

export const setCurrentProvider = (provider: Provider) => {
  current = provider
}

export type { VHook }

const Ctor: Map<never, NodeFactory> = new Map([
  // function
  [
    Function,
    {
      create(atom: VAtomFunc) {
        const [fn, props, children] = atom
        const parentHook = current.hook
        current.hook = hooks.get(atom) ?? new VHook(atom)
        atom[2] = new VList(fn({ ...props, children })) as VList<VAtom>
        current.hook = parentHook
        return new VList()
      },
      update(atom: VAtomFunc, prev: VAtomFunc) {
        const [fn, props, children] = atom
        const parentHook = current.hook
        current.hook = hooks.get(prev)!
        atom[2] = new VList(fn({ ...props, children })) as VList<VAtom>
        current.hook = parentHook
      },
    },
  ],

  // tag
  [
    String,
    {
      create([tagName, props, children]: VAtomHtml, doc: Doc): Node {
        if (tagName === 'svg') doc = svg
        const node = doc.createElement.call(document, tagName, props as ElementCreationOptions)
        if (tagName === 'foreignObject') doc = xhtml
        docs.set(children, doc)
        createProps(node, tagName, props)
        return node
      },
      update([tagName, props]: VAtomHtml, _: VAtomHtml, node: Element): void {
        updateProps(node, tagName, props)
      },
    },
  ],

  // text
  [
    Text,
    {
      create: ([, , next]: VAtomText): Node => new Text(next),
      update([, , next]: VAtomText, [, , prev]: VAtomText, node: Node): void {
        prev !== next && (node.nodeValue = next)
      },
    },
  ],

  // fragment
  [Symbol, { create: () => new VList() }],

  // comment
  [Comment, { create: () => new Comment() }],
] as [never, never][])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typeOf = (atom: VAtom) => ((atom[0] as any).prototype ? atom[0] : atom[0].constructor)
const ctor = (atom: VAtom) => (Ctor.get(typeOf(atom) as never) ?? Ctor.get(Symbol as never))!

/**
 * Returns a callback that will trigger
 * a rerender on the current component.
 *
 * ```tsx
 * let clicked = 0
 * const Foo = () => <>
 *   {clicked++}
 *   <button onclick={useHook()}>click me</button>
 * </>
 * ```
 *
 * @returns The hook callback
 */
export const useHook = () => current.hook!.trigger

/**
 * Wraps a function along with a hook
 * so when called will also trigger that hook.
 *
 * ```tsx
 * let clicked = 0
 * const Foo = () => {
 *   const inc = useCallback(() => clicked++)
 *   return <>
 *     {clicked}
 *     <button onclick={inc}>click me</button>
 *   </>
 * }
 * ```
 *
 * @param fn Any function to wrap with the hook
 * @returns The callback function
 */
export const useCallback = (fn: (...args: unknown[]) => void) => {
  const hook = useHook()
  return function (this: unknown, ...args: unknown[]) {
    const result = fn.apply(this, args)
    hook()
    return result
  }
}

const xhtml = {
  _xhtml: true,
  createElement: document.createElement,
}

const svg = {
  _svg: true,
  createElement: document.createElementNS.bind(document, 'http://www.w3.org/2000/svg'),
} as unknown as Doc
