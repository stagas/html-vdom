import type { Class } from 'everyday-types'

import { kebab } from 'everyday-utils'
import type * as jsxi from 'html-jsx'

import { jsx } from './jsx-runtime'

// until a getName() is implemented or similar
// we polyfill it to capture the tagNames
// of foreign custom elements
// https://github.com/WICG/webcomponents/issues/566
declare const customElements: CustomElementRegistry & {
  getName(ctor: CustomElementConstructor): string | undefined
}
if (!customElements.getName) {
  const tags: WeakMap<typeof HTMLElement, string> = new WeakMap()
  const { define } = customElements
  customElements.define = function (
    name: string,
    ctor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
  ): void {
    tags.set(ctor, name)
    return define.call(customElements, name, ctor, options)
  }
  customElements.getName = function (ctor: CustomElementConstructor) {
    return tags.get(ctor)
  }
}

export interface Options<T> extends ElementDefinitionOptions {
  interface?: Class<T>
}

export type ComponentProps<T, I> = Partial<Omit<T & I, keyof HTMLElement>> & jsxi.HTMLAttributes<T>

export type Component<T, I> =
  & {
    /** Returns the tag name of the component. */
    toString(): string
  }
  & ((props: ComponentProps<T, I>) => JSX.Element)

let suffixKey = 0

export const fromElement = <T extends HTMLElement, I = HTMLElement>(
  ctor: Class<T> & { elementOptions?: Options<I> },
  options: Options<I> = ctor.elementOptions ?? {},
  defaultProps: ComponentProps<T, I> = {},
): Component<T, I> => {
  let fn: Component<T, I>

  let tag = customElements.getName(ctor)

  if (!tag) {
    tag = kebab(ctor.name).replace('-element', '')
    if (!tag.includes('-')) tag = 'x-' + tag
    while (customElements.get(tag) != null) {
      tag += (++suffixKey).toString(36)
    }
    customElements.define(tag, ctor, options)
  }

  if (options.extends)
    fn = props => jsx(options.extends, Object.assign({}, defaultProps, props, { is: tag }), void 0)
  else
    fn = props => jsx(tag, Object.assign({}, defaultProps, props), void 0)

  fn.toString = () => tag!

  return fn
}
