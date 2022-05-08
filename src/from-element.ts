import * as jsxi from 'html-jsx'
import { jsx } from './jsx-runtime'

export type Constructor<T> = new(...args: any[]) => T

const Registry: WeakMap<typeof HTMLElement, any> = new WeakMap()

export interface Options<T> extends ElementDefinitionOptions {
  interface?: Constructor<T>
}

export type Component<T, I> = (props: Partial<Omit<T & I, keyof HTMLElement>> & jsxi.HTMLAttributes<T>) => any

export const fromElement = <T extends HTMLElement, I = HTMLElement>(
  Element: Constructor<T>,
  options: Options<I> = {},
): Component<T, I> => {
  let fn: Component<T, I> = Registry.get(Element)
  if (fn) return fn

  const tag = 'x-' + Element.name.toLowerCase() + ((Math.random() * 1e7) | 0).toString(36)
  const ctor = class extends Element {}
  customElements.define(tag, ctor, options)
  if (options.extends)
    fn = props => jsx(options.extends, Object.assign(props, { is: tag }), void 0)
  else
    fn = props => jsx(tag, props, void 0)
  Registry.set(Element, fn)
  ;(fn as any).toString = () => tag

  return fn
}
