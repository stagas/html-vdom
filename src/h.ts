/**
 * JSX types
 * @private
 */

import type * as jsx from 'html-jsx'
declare module 'html-jsx' {
  // eslint-disable-next-line
  interface DOMAttributes<T> extends JSX.IntrinsicAttributes {}
}
declare global {
  namespace JSX {
    /**
     * The type returned by our `createElement` factory.
     * @private
     */
    type Element = VAtom

    interface IntrinsicElements extends jsx.IntrinsicElements {
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
    }

    interface HTMLAttributes<T> extends jsx.HTMLAttributes<T> {}
    interface SVGAttributes<T> extends jsx.SVGAttributes<T> {}
    interface DOMAttributes<T> extends jsx.DOMAttributes<T> {}
  }
}

import { VAtom as VAtomCtor, VList } from './v'

export interface VRef<T> {
  current?: T | null
}

export const Fragment = Symbol()
export type JSXFragment = typeof Fragment
export type JSXKind = string | JSXFragment | JSXFunction
export type JSXProps = (Record<string, unknown> & { key?: string | number }) | null
export type JSXChild = JSXReturn[] | JSXReturn | string | number | boolean | null | undefined
export type JSXReturn = [JSXKind, JSXProps, VList<JSXChild>]
export interface JSXFunction {
  (props?: JSXProps & { children?: JSXChild[] }): JSXReturn
}
export interface JSXPragma {
  (kind: JSXKind, props: JSXProps, ...children: JSXChild[]): JSXReturn //VAtom | VList<VAtom>
}

export const h: JSXPragma = (kind, props, ...children) =>
  new VAtomCtor(kind, props, new VList(...(children.map(toAtom) as VAtom[]))) as VAtom

export type VAtom = [JSXKind, JSXProps, VList<VAtom>]

const toAtom = (child: JSXChild) => {
  if (child == null)
    //return // new VAtomCtor()
    return new VAtomCtor(<never>Comment) as VAtom

  switch (typeof child) {
    case 'boolean':
      return new VAtomCtor(<never>Comment) as VAtom
    // return false //new VAtomCtor() //return new VAtomCtor(<never>Comment)
    case 'string':
    case 'number':
      return new VAtomCtor(<never>Text, null, <never>child) as VAtom
    case 'object':
      if (Array.isArray(child) && !(child instanceof VAtomCtor))
        return h(Fragment, null, ...(child as JSXReturn[]))
    //Array === child?.constructor) return h(Fragment, null, ...(child as JSXReturn[]))
  }

  return child
}
