import { camelCaseToKebab } from 'camelcase-to-kebab'
import type { Any, SafeWeakMap } from './types'
import type { JSXProps, VRef } from '.'

const toCssText = (style: CSSStyleDeclaration) => {
  let css = ''
  // css += (toCssAttr[key] || camelCaseToKebab(key)) + ':' + style[key] + ';'
  for (const key in style) css += camelCaseToKebab(key) + ':' + style[key] + ';'
  return css
}

const createProp = (
  el: Element,
  _type: string,
  name: string,
  value: unknown,
  attrs: Record<string, Attr>
) => {
  // all the Any's below are on purpose
  // all the cases should be taken care of,
  // but since this is user input they are allowed
  // to do something wrong and we want to raise an
  // exception and get a stack trace back here.

  // special cases
  switch (name) {
    case 'key':
      return
    case 'ref':
      if (value) (value as VRef<Element>).current = el
      return

    // "value" and "checked" properties have to be set
    // directly on the element when it's an input to
    // properly diff later (see updateProps)
    case 'value':
    case 'checked':
      ;(el as Any)[name] = value
      return

    case 'style':
      // if we createAttribute and set .value then that
      // triggers the css parser and we can't compare if
      // the two values are similar during updates.
      // doing it this way retains the exact string and
      // is faster.
      if (typeof value === 'object') value = toCssText(value as CSSStyleDeclaration)
      el.setAttribute('style', value as string)
      // we know there is an attribute node because we
      // just set it
      attrs.style = el.getAttributeNode('style')!
      return
  }

  //
  // create prop
  //

  // we used to normalize the attribute name
  // but now we don't. because there is a high
  // probability we will need a version that
  // normalizes attribute names we leave it here
  // commented (attr)
  const attr = name //toAttr[name] || name

  switch (typeof value) {
    case 'string':
    case 'number':
      el.setAttribute(attr, value as string)
      attrs[attr] = el.getAttributeNode(attr)!
      return
    case 'function':
      el.setAttribute(attr, '')
      attrs[attr] = el.getAttributeNode(attr)!
      ;(el as Any)[name] = value
      return
    case 'boolean':
      if (value) {
        el.setAttribute(attr, '')
        attrs[attr] = el.getAttributeNode(attr)!
      }
      return
    default:
      if (value != null) {
        try {
          ;(el as Any)[name] = value
        } catch {
          //
        }
      }
  }
}

type PropCacheItem = {
  attrs: Record<string, Attr>
  props: JSXProps
}
const propCache = new WeakMap() as SafeWeakMap<object, PropCacheItem>

export const createProps = (
  el: Element,
  type: string,
  props: JSXProps = {},
  attrs: Record<string, Attr> = {}
) => {
  for (const name in props) createProp(el, type, name, props[name], attrs)
  propCache.set(el, { props, attrs })
}

export const updateProps = (el: Element, type: string, next: JSXProps = {}) => {
  if (!propCache.has(el)) return next && createProps(el, type, next)

  const c = propCache.get(el)
  const { attrs, props } = c
  if (!next) {
    for (const name in attrs) el.removeAttributeNode(attrs[name])
    for (const name in props) delete (el as Any)[name]
    propCache.delete(el)
    return
  }

  let value
  out: for (const name in props) {
    // removed prop
    if (!(name in next)) {
      delete (el as Any)[name]
      continue
    }

    value = next[name]

    switch (name) {
      case 'children':
        continue out
      case 'ref':
        if (el !== (value as VRef<Element>).current) (value as VRef<Element>).current = el
        continue out

      // "value" and "checked" properties change directly on the element when
      // editing an input so we can't diff and have to check it directly
      case 'value':
      case 'checked':
        // don't try to update value when element has focus
        // because user is editing and it messes up everything
        // TODO: any way around this?
        ;(el as Any)[name] !== value && document.activeElement !== el && ((el as Any)[name] = value)
        continue out
    }

    // updated prop
    if (props[name] !== value) {
      if (typeof value === 'function') {
        const attr = name //toAttr[name] || name
        props[attr] = (el as Any)[attr] = value
      } else if (!(name in attrs))
        // try {
        (el as Any)[name] = value
      // } catch {
      //
      // }
    }
  }

  for (const name in attrs) {
    // removed attribute
    if (!(name in next) || next[name] === false || next[name] == null) {
      el.removeAttributeNode(attrs[name])
      delete attrs[name]
      continue
    }

    value = next[name]

    switch (name) {
      case 'style':
        if (typeof value === 'object') value = toCssText(value as CSSStyleDeclaration)
        break
    }

    // updated value
    if (props![name] !== value && typeof value !== 'function') attrs[name].value = value as string
  }

  // created props
  for (const name in next)
    if (!(name in attrs) && !(name in props!)) createProp(el, type, name, next[name], attrs)

  c.props = next
}
