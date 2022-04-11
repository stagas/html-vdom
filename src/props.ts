import { html, svg } from './jsx-runtime'
import type { Doc, Props } from './jsx-runtime'
import type { Any, SafeWeakMap } from './types'

// TODO: module
const kebab = (s: string) => s.replace(/[a-z](?=[A-Z])|[A-Z]+(?=[A-Z][a-z])/g, '$&-').toLowerCase()

const toCssText = (style: CSSStyleDeclaration) => {
  let css = ''
  for (const key in style) css += kebab(key) + ':' + style[key] + ';'
  return css
}

const createProp = (
  doc: Doc = html,
  el: Element,
  _type: string,
  name: string,
  value: unknown,
  attrs: Record<string, Attr>,
) => {
  // all the Any's below are on purpose
  // all the cases should be taken care of,
  // but since this is user input they are allowed
  // to do something wrong and we want to raise an
  // exception and get a stack trace back here.

  // special cases
  switch (name) {
    case 'children':
    case 'ref':
      return
    // case 'innerHTML':
    //   ;(el as any).innerHTML = value
    //   return

    // "value" and "checked" properties have to be set
    // directly on the element when it's an input to
    // properly diff later (see updateProps)

    // case 'value':
    // case 'checked':
    //   ;(el as Any)[name] = (value as any)?.valueOf()
    //   return
    case 'style':
      // if we createAttribute and set .value then that
      // triggers the css parser and we can't compare if
      // the two values are similar during updates.
      // doing it this way retains the exact string and
      // is faster.
      value = (value as any)?.valueOf()
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
  const attr = name // toAttr[name] || name

  value = (value as any)?.valueOf()

  switch (typeof value) {
    case 'string':
    case 'number':
      if (doc === svg || !(name in el)) {
        el.setAttribute(attr, value as string)
        attrs[attr] = el.getAttributeNode(attr)!
        return
      }
      break
    case 'function':
      el.setAttribute(attr, '')
      attrs[attr] = el.getAttributeNode(attr)! // TODO: support value.passive, value.capture, value.once etc
       // needs a different algorithm/way of setting/removing handlers with
      // addEventListener/removeEventListener instead
      ;(el as Any)[name] = value
      return
      // case 'boolean':
      // if (name in el) {
      // (el as Any)[name] = value
      // } else {
      // if (value) {
      //   //     el.setAttribute(attr, '')
      //   //     attrs[attr] = el.getAttributeNode(attr)!
      //   //   }
      //   // }
      //   return
  }

  ;(el as Any)[name] = value
  if (el.hasAttribute(attr))
    attrs[attr] = el.getAttributeNode(attr)!
  //   case 'boolean':
  //     // if (name in el) {
  //     (el as Any)[name] = value
  //     // } else {
  //     //   if (value) {
  //     //     el.setAttribute(attr, '')
  //     //     attrs[attr] = el.getAttributeNode(attr)!
  //     //   }
  //     // }
  //     return
  //   default:
  //     // if (value != null) {
  //       // try {
  //         ;(el as Any)[name] = value
  //       // } catch {
  //         //
  //       // }
  //     // }
  // }
}

type PropCacheItem = {
  attrs: Record<string, Attr>
  props: Props
}
const propCache = new WeakMap() as SafeWeakMap<object, PropCacheItem>

export const createProps = (
  doc: Doc,
  el: Element,
  type: string,
  props: Props = {},
  attrs: Record<string, Attr> = {},
  cacheRef: object = el,
) => {
  for (const name in props) createProp(doc, el, type, name, props[name], attrs)
  propCache.set(cacheRef, { props, attrs })
}

export const updateProps = (doc: Doc, el: Element, type: string, next: Props = {}, cacheRef: object = el) => {
  if (!propCache.has(cacheRef)) return next && createProps(doc, el, type, next, void 0, cacheRef)

  const c = propCache.get(cacheRef)
  const { attrs, props } = c
  if (!next) {
    for (const name in attrs) el.removeAttributeNode(attrs[name])
    for (const name in props) delete (el as Any)[name]
    propCache.delete(cacheRef)
    return
  }

  let value
  out:
  for (const name in props) {
    // removed prop
    if (!(name in next)) {
      delete (el as Any)[name]
      continue
    }

    value = next[name]

    switch (name) {
      case 'children':
      case 'ref':
        continue out
      // case 'innerHTML':
      //   ;(el as any).innerHTML = value
      //   continue out

      // "value" and "checked" properties change directly on the element when
      // editing an input so we can't diff and have to check it directly
      case 'value':
        // case 'checked':
        // don't try to update value when element has focus
        // because user is editing and it messes up everything
        // TODO: any way around this?
        value = (value as any)?.valueOf()
        ;(el as Any)[name] !== value
          && document.activeElement !== el
          && ((el as Any)[name] = value)
        continue out
    }

    value = (value as any)?.valueOf() // updated prop

    if (props[name] !== value) {
      if (typeof value === 'function') {
        const attr = name // toAttr[name] || name
        props[attr] = (el as Any)[attr] = value
      } else if (!(name in attrs)) {
        // if (!(name in attrs))
        ;(el as Any)[name] = value
      }
    }
    // }
  }

  for (const name in attrs) {
    // removed attribute
    if (!(name in next) || next[name] === false || next[name] == null) {
      el.removeAttributeNode(attrs[name])
      delete attrs[name]
      continue
    }

    value = (next[name] as any)?.valueOf()

    switch (name) {
      case 'style':
        if (typeof value === 'object') value = toCssText(value as CSSStyleDeclaration)
        break
    }

    // updated value
    if (props![name] !== value && typeof value !== 'function')
      attrs[name].value = value as string
  }

  // created props
  for (const name in next) {
    if (!(name in attrs) && !(name in props!))
      createProp(doc, el, type, name, next[name], attrs)
  }

  c.props = next
}
