import { bindAll, EventEmitter } from 'everyday-utils'
import type * as jsxi from 'html-jsx'

export * from 'html-jsx'

import { createProps, updateProps } from './props'
export { createProps, updateProps }

declare module 'html-jsx' {
  // eslint-disable-next-line
  interface DOMAttributes<T> extends JSX.IntrinsicAttributes { }
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
      key?: object | symbol | string | number

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

      class?: string
      className?: string
      style?: Partial<CSSStyleDeclaration> | string | false | null | void
      part?: string

      /**
       * Sets the `innerHTML` of an element to the **exact** string **without** escaping.
       */
      innerHTML?: string
    }

    interface HTMLAttributes<T> extends jsxi.HTMLAttributes<T> { }
    interface SVGAttributes<T> extends jsxi.SVGAttributes<T> { }
    interface DOMAttributes<T> extends jsxi.DOMAttributes<T> {
    }
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
type TargetEl = El | DocumentFragment
type VAny = VNode<any>

export type Hook = Fn & {
  fn: Fn
  onremove?: Fn
  onstart?: Fn
  onend?: Fn
} & EventEmitter<{
  remove: () => void,
  start: () => void,
  end: () => void
}>
  & Record<string, any>

export type Props = Record<string, any>

type VNode<T extends string | symbol | typeof Text | typeof Comment | VFn> = {
  kind: T
  props: Props
  key?: string
  hook?: Hook | undefined
  keep?: boolean
  onunref?: () => void
}

export const Fragment = Symbol()
export const jsx = (kind: any, props: any, key: any) =>
  kind === Fragment
    ? props.children as VKid
    : { kind, props, key } as VNode<typeof kind>
export const jsxs = jsx

export let hook: Hook
export const createHook = () =>
  bindAll(new EventEmitter(), function current(fn: Fn = (current as Hook).fn) {
    const prev = hook
    hook = current as Hook
    hook.fn = fn

    hook.onstart?.()
    hook.emit('start')
    fn()
    hook.onend?.()
    hook.emit('end')

    hook = prev
  }) as Hook

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
      ; (el as any).onunref?.()
      el.remove()

      // if ((el as any)?.ref?.current) {
      // console.log('removing', el)
      // ; (el as any).ref.current = null
      // }

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

export const renderCache = new WeakMap()
export function render(n: VKid): DocumentFragment
export function render<T extends TargetEl>(n: VKid, el: T, doc?: Doc, withNull?: boolean): T
export function render(n: VKid, el: DocumentFragment = document.createDocumentFragment(), doc: Doc = html, withNull = false) {
  reconcileVDom(el, forceArray(n, withNull), renderCache.get(el), doc)
  return el
}

function reconcileVDom(parent: TargetEl, nk: VKids, pk: VKids | VKid, doc: Doc) {
  if ((pk as VKids)?.running) {
    console.warn('attempt to reconcile lane which is reconciling')
    return
  }

  if (pk === nk) {
    // same?
    // return
    nk = [...nk]
  }

  // ?
  nk.running = true

  renderCache.set(parent, nk)

  // for (const [i, n] of nk.entries() as any) {
  //   nk[i] = n?.valueOf?.()
  // }

  nk.dom = Array(nk.length)
  nk.keyed = new Map()
  nk.mapped = new Map()

  if (Array.isArray(pk)) {
    const keep = new Set()
    for (let i = 0, n, el, p, pel, k, pi; i < nk.length; i++) {
      n = nk[pi = i]
      k = (n as VAny)?.key ?? (n as any)?.ref?.key
      if (k != null) {
        nk.keyed.set(k, i)
        pi = pk.keyed!.get(k) ?? -1
      }
      p = pk[pi]
      pel = pk.dom![pi]
      nk.dom[i] = el = reconcileNode(doc, n, p, pel)
      nk.mapped.set(el, n)
      if (el === pel)
        keep.add(pel)
    }
    for (const pel of pk.dom!) {
      if (!keep.has(pel)) {
        ; (pel as any).onunref?.()
        // if ((pel as any)?.ref?.current) {
        // console.log('removing', pel)
        // ; (pel as any).ref.current = null
        // }
        // TODO: this line commented is breaking things if enabled
        // and other things break if disabled?
        // if (parent instanceof Chunk) parent.removeChild(pel)
        pel.remove()
        const hook = (pk.mapped!.get(pel) as VNode<VFn>)?.hook
        hook?.onremove?.()
        hook?.emit('remove')
        // render(null, pel)
      }
    }
  } else {
    for (let i = 0, n, el, k; i < nk.length; i++) {
      n = nk[i]
      k = (n as VAny)?.key ?? (n as any)?.ref?.key
      if (k != null)
        nk.keyed.set(k, i)
      nk.dom[i] = el = reconcileNode(doc, n)
      nk.mapped.set(el, n)
    }
  }

  nk.flatDom = flatDom(nk.dom)
  if ((pk as VKids)?.flatDom)
    diffDom(parent, nk.flatDom, (pk as VKids)!.flatDom!)

  else
    nk.flatDom.forEach(el => parent.appendChild(el))

  nk.running = false
}

// scheduling to prevent triggering ref effects before this render finishes
// TODO: has to be put in a proper queue instead of relying on the microtask
function mountEl(el: DomEl & { ref: VRef<any>; onref: any; onunref?: any }) {
  if (el?.ref && el !== el.ref.current) {
    queueMicrotask(() => {
      if (el.isConnected) {
        el.ref.current = el
      }
    })
  }
  if (el?.onref) {
    queueMicrotask(() => {
      if (el.isConnected) {
        el.onunref = el.onref(el)
      }
    })
  }

  return el
}

function diffDom(parent: TargetEl, n: DomEl[], p: DomEl[], i = 0, len = n.length, el?: DomEl, last?: DomEl) {
  if (parent instanceof Chunk) {
    // parent.splice(0) // , parent.length, ...n)
    // TODO: optimize this
    for (; i < len; i++) {
      el = n[i]
      if (i < parent.length) {
        if (p[i] === el)
          continue
        parent[i] = el
      } else {
        parent.push(el)
      }
    }
    let d = parent.length - len
    while (d--)
      parent.pop()
  } else {
    for (; i < len; i++) {
      el = n[i]
      if (p[i] === el)
        last = el
      else if (!i)
        parent.insertBefore(last = el, parent.firstChild)
      else
        last!.after(last = el)
    }
  }
}

function reconcileNode(doc: Doc, n: VKid, p?: VKid, pel?: El | null) {
  let el: El | null
  switch (typeof n) {
    case 'string':
    case 'number':
      if ((pel as Node)?.nodeType === TEXT_NODE) {
        if (p != n)
          (pel as Node).nodeValue = n as string
        return pel as El
      }
      el = new Text(n as string)
      return el
    case 'object':
      if (!n)
        break
      if (Array.isArray(n)) {
        if (pel && Array.isArray(p))
          el = pel as Chunk
        else
          el = new Chunk()
        if (!n.length)
          n.push(null)
        reconcileVDom(el, n, p, doc)
        el.save()
      } else if (typeof n.kind === 'string') {
        // maybe switch to svg namespace
        if (n.kind === 'svg')
          doc = svg
        if (( // if we pass explicit element reference, and is the right tag, use that
          n.props.ref?.current
          && n.props.ref.current.tagName.toLowerCase() === n.kind
          && (el = n.props.ref.current as El)
        ) || (
            // if the previous element is of the same kind, use that
            pel
            && (p as VNode<string>)?.kind === n.kind
            && (el = pel)
          )) {
          // only update props if we have the element
          ; (el as any).onprops?.(n.props)
          updateProps(doc, el as Element, n.kind, n.props)
        } else {
          // otherwise create an element and props
          el = doc(n.kind, 'is' in n.props ? { is: n.props.is } : void 0); (el as any).onprops?.(n.props)
          createProps(doc, el as Element, n.kind, n.props)
        }
        // maybe switch to xhtml namespace
        if (n.kind === 'foreignObject')
          doc = html
        // render children
        if (!n.kind.includes('-'))
          render(n.props.children, el, doc)
        mountEl(el as any)
      } else {
        let initial = true
        if (!((el = pel!) && (n.hook = (p as VNode<VFn>)?.hook))) {
          el = new Chunk()
          n.hook = createHook()
        }
        const anchor = new Comment()
        let prevDom: DomEl[]
        let nextDom: DomEl[]
        n.hook(function hookRun() {
          let next!: ChildNode | null
          if (!initial && !(next = el!.nextSibling as ChildNode))
            el!.after(next = anchor)
          if (typeof n.kind !== 'function') {
            console.warn('Hook called but node is not a function component.')
            console.warn(n)
            return
          }
          render(n.kind(n.props), el!, doc, true); (el as Chunk).save()
          if (!initial && next) {
            nextDom = flatDom(el as Chunk)
            if (prevDom?.length > 0) {
              for (let i = 0, last, e: El; i < nextDom.length; i++) {
                e = nextDom[i]
                if (last) {
                  last.after(last = e)
                } else if (prevDom[i] !== e) {
                  next.before(last = e)
                } else {
                  last = last && e
                }
              }
            } else {
              for (const e of nextDom)
                next.before(e)
            }
            prevDom = nextDom
            next === anchor && next.remove()
          } else {
            prevDom = flatDom(el as Chunk)
            initial = false
          }
        })
      }
      return el
  }
  if ((pel as Node)?.nodeType === COMMENT_NODE)
    return pel as El
  el = new Comment()
  return el
}
