export * from 'html-jsx'
import type * as jsxi from 'html-jsx'
import { createProps, updateProps } from './props'
export { createProps, updateProps }

declare module 'html-jsx' {
  // eslint-disable-next-line
  interface DOMAttributes<T> extends JSX.IntrinsicAttributes {}
}

/**
 * JSX types
 * @private
 */
declare global {
  namespace JSX {
    /**
     * The type returned by our `jsx` factory.
     * @private
     */
    type Element = VKid

    interface IntrinsicElements extends jsxi.IntrinsicElements {
      /**
       * This allows for any tag to be used.
       * @private
       */
      [k: string]: unknown
    }

    interface IntrinsicAttributes {
      /**
       * Pass an object that will be assigned the DOM element reference in its `current` property.
       * @private
       */
      ref?: VRef<unknown> | null

      /**
       * List index key - each item's `key` must be unique.
       * @private
       */
      key?: string | number

      /**
       * Custom hook for when element is created.
       */
      onref?: (el: any) => (() => void) | void

      /**
       * Custom hook for when element is removed.
       */
      onunref?: (el: any) => (() => void) | void

      /**
       * Children.
       * @private
       */
      children?: JSX.Element

      /**
       * Sets the `innerHTML` of an element to the **exact** string **without** escaping.
       */
      innerHTML?: string
    }

    interface HTMLAttributes<T> extends jsxi.HTMLAttributes<T> {}
    interface SVGAttributes<T> extends jsxi.SVGAttributes<T> {}
    interface DOMAttributes<T> extends jsxi.DOMAttributes<T> {}
  }
}

export type $<T> = (props: T & { children?: any }) => JSX.Element

export interface VRef<T> {
  current?: T | null | void
}

type Fn = (...args: any) => any
export type Doc = (tag: string, opts?: ElementCreationOptions) => Element
export type VFn = (props: any) => VKid
export type VKid = VKids | VNode<any> | string | number | boolean | null | undefined | void
type VKids =
  & VKid[]
  & Partial<{
    running: boolean
    dom: El[]
    flatDom: DomEl[]
    keyed: Map<string, number>
    mapped: Map<El, VKid>
  }>
type DomEl = Element | CharacterData | ChildNode
type El = DomEl | Chunk
type TargetEl = El | ShadowRoot
type VAny = VNode<any>
export type Hook = Fn & { fn: Fn; onremove?: Fn } & Record<string, any>
export type Props = Record<string, any>
type VNode<T extends string | symbol | typeof Text | typeof Comment | VFn> = {
  kind: T
  props: Props
  key?: string
  hook?: Hook
  keep?: boolean
  onunref?: () => void
}

const anchor = new Comment()
export const Fragment = Symbol()
export const jsx = (kind: any, props: any, key: any) =>
  kind === Fragment
    ? props.children
    : { kind, props, key } as VNode<typeof kind>
export const jsxs = jsx

export let hook: Hook
const createHook = () =>
  function current(fn: Fn = (current as Hook).fn) {
    const prev = hook
    hook = current as Hook
    hook.fn = fn
    fn()
    hook = prev
  } as Hook

class Chunk extends Array {
  firstChild?: any
  dom: El[] = []
  get last() {
    return this.dom.at(-1)
  }
  get nextSibling(): El | null | undefined {
    return this.last?.nextSibling
  }
  // insertBefore(x: any) {
  //   this.unshift(x)
  // }
  appendChild(x: any) {
    this.push(x)
  }
  after(x: Node) {
    this.last?.after(x)
  }
  save() {
    this.dom = [...this]
  }
  remove() {
    this.dom.forEach(el => {
      ;(el as any).onunref?.()
      el.remove()
    })
    this.splice(0)
  }
  removeChild(x: any) {
    const i = this.indexOf(x)
    ~i && this.splice(i, 1)
    // i = this.dom.indexOf(x)
    // ~i && this.dom.splice(i, 1)
  }
}

export type { Chunk, VNode }

const { TEXT_NODE, COMMENT_NODE } = document
export const html = document.createElement.bind(document)
export const svg = document.createElementNS.bind(document, 'http://www.w3.org/2000/svg')
const forceArray = <T>(x: any, withNull: boolean): T =>
  (Array.isArray(x) ? (withNull && !x.length ? [null] : x) : x == null && !withNull ? [] : [x]) as unknown as T
const flatDom = (arr: El[], res: DomEl[] = []) => {
  for (const el of arr) {
    if ((el as Chunk).dom) res.push(...flatDom((el as Chunk).dom!))
    else res.push(el as DomEl)
  }
  return res
}

const prevs = new WeakMap()
export const render = (n: VKid, el: TargetEl, doc: Doc = html, withNull = false) =>
  reconcile(el, forceArray(n, withNull), prevs.get(el), doc)

const reconcile = (parent: TargetEl, nk: VKids, pk: VKids | VKid, doc: Doc) => {
  if ((pk as VKids)?.running) {
    console.warn('attempt to reconcile lane which is reconciling')
    return
  }

  if (pk === nk) nk = [...nk]

  for (const [i, n] of nk.entries() as any) {
    nk[i] = n?.valueOf?.()
  }

  prevs.set(parent, nk)

  nk.running = true
  nk.dom = Array(nk.length)
  nk.keyed = new Map()
  nk.mapped = new Map()

  if (Array.isArray(pk)) {
    const keep = new Set()
    for (let i = 0, n, el, p, pel, k, pi; i < nk.length; i++) {
      n = nk[pi = i]
      k = (n as VAny)?.key
      if (k != null) {
        nk.keyed.set(k, i)
        pi = pk.keyed!.get(k) ?? -1
      }
      p = pk[pi]
      pel = pk.dom![pi]
      nk.dom[i] = el = create(doc, n, p, pel)
      if (el === pel) keep.add(pel)
    }
    for (const pel of pk.dom!) {
      if (!keep.has(pel)) {
        ;(pel as any).onunref?.()
        if (parent instanceof Chunk) parent.removeChild(pel)
        pel.remove()
        ;(pk.mapped!.get(pel) as VNode<VFn>)?.hook?.onremove?.()
      }
    }
  } else {
    for (let i = 0, n, el, k; i < nk.length; i++) {
      n = nk[i]
      k = (n as VAny)?.key
      if (k != null) nk.keyed.set(k, i)
      nk.dom[i] = el = create(doc, n)
      nk.mapped.set(el, n)
    }
  }

  nk.flatDom = flatDom(nk.dom)
  if ((pk as VKids)?.flatDom)
    diff(parent, nk.flatDom, (pk as VKids)!.flatDom!)
  else
    nk.flatDom.forEach(el => parent.appendChild(el))

  nk.running = false
}

// scheduling to prevent triggering ref effects before this render finishes
// TODO: has to be put in a proper queue instead of relying on the microtask
const mount = (el: DomEl & { ref: VRef<any>; onref: any; onunref?: any }) => {
  queueMicrotask(() => {
    if (el?.ref && el !== el.ref.current) {
      el.ref.current = el
    }
    if (el?.onref) {
      el.onunref = el.onref(el)
    }
  })
  return el
}

const diff = (parent: TargetEl, n: DomEl[], p: DomEl[], i = 0, len = n.length, el?: DomEl, last?: DomEl) => {
  if (parent instanceof Chunk) {
    // parent.splice(0) // , parent.length, ...n)
    // TODO: optimize this
    for (; i < len; i++) {
      el = n[i]
      if (i < parent.length) {
        if (p[i] === el) continue
        parent[i] = el
      } else {
        parent.push(el)
      }
    }
    let d = parent.length - len
    while (d--) parent.pop()
  } else {
    for (; i < len; i++) {
      el = n[i]
      if (p[i] === el) last = el
      else if (!i) parent.insertBefore(last = el, parent.firstChild)
      else last!.after(last = el)
    }
  }
}

const create = (doc: Doc, n: VKid, p?: VKid, pel?: El | null) => {
  let el: El | null
  switch (typeof n) {
    case 'string':
    case 'number':
      if ((pel as Node)?.nodeType === TEXT_NODE) {
        if (p != n) (pel as Node).nodeValue = n as string
        return pel as El
      }
      el = new Text(n as string)
      return el
    case 'object':
      if (!n) break
      if (Array.isArray(n)) {
        if (pel && Array.isArray(p)) el = pel as Chunk
        else el = new Chunk()
        if (!n.length) n.push(null)
        reconcile(el, n, p, doc)
        el.save()
      } else if (typeof n.kind === 'string') {
        // maybe switch to svg namespace
        if (n.kind === 'svg') doc = svg
        if (
          ( // if we pass explicit element reference, and is the right tag, use that
            n.props.ref?.current
            && n.props.ref.current.tagName.toLowerCase() === n.kind
            && (el = n.props.ref.current as El)
          ) || (
            // if the previous element is of the same kind, use that
            pel
            && (p as VNode<string>)?.kind === n.kind
            && (el = pel)
          )
        ) {
          // only update props if we have the element
          updateProps(doc, el as Element, n.kind, n.props)
        } else {
          // otherwise create an element and props
          el = doc(n.kind, 'is' in n.props ? { is: n.props.is } : void 0)
          createProps(doc, el as Element, n.kind, n.props)
        }
        // maybe switch to xhtml namespace
        if (n.kind === 'foreignObject') doc = html
        // render children
        render(n.props.children, el, doc)
        mount(el as any)
      } else {
        let initial = true
        if (!((el = pel!) && (n.hook = (p as VNode<VFn>)?.hook))) {
          el = new Chunk()
          n.hook = createHook()
        }
        let prevDom: DomEl[]
        let nextDom: DomEl[]
        n.hook(() => {
          let next!: ChildNode | null
          if (!initial && !(next = el!.nextSibling as ChildNode)) el!.after(next = anchor)
          render(n.kind(n.props), el!, doc, true)
          ;(el as Chunk).save()
          if (!initial && next) {
            nextDom = flatDom(el as Chunk)
            if (prevDom?.length > 0) {
              for (let i = 0, e: El; i < nextDom.length; i++) {
                e = nextDom[i]
                if (prevDom[i] !== e) next.before(e)
              }
            } else {
              for (const e of nextDom) next.before(e)
            }
            prevDom = nextDom
            next === anchor && next.remove()
          } else {
            initial = false
          }
        })
      }
      return el
  }
  if ((pel as Node)?.nodeType === COMMENT_NODE) return pel as El
  el = new Comment()
  return el
}
