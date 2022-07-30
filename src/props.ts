import type { Any, SafeWeakMap } from 'everyday-types'
import type { Doc, Props } from './jsx-runtime'

import { styleToCss } from 'everyday-utils'
import { html, svg } from './jsx-runtime'

const isEvent = (name: string) => name.charAt(0) === 'o' && name.charAt(1) === 'n' && !name.endsWith('ref')
const toEvent = (name: string) => name.slice(2) as keyof ElementEventMap

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
      // case 'ref':
      return

    case 'style':
      // if we createAttribute and set .value then that
      // triggers the css parser and we can't compare if
      // the two values are similar during updates.
      // doing it this way retains the exact string and
      // is faster.
      value = (value as any)?.valueOf()
      if (typeof value === 'object') value = styleToCss(value as CSSStyleDeclaration)
      if (value) {
        el.setAttribute('style', value as string)
        // we know there is an attribute node because we
        // just set it
        attrs.style = el.getAttributeNode('style')!
      }
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
      if (isEvent(attr)) {
        //!? 'create event listener', attr, value
        el.addEventListener(toEvent(attr), value as EventListener, value as AddEventListenerOptions)
      } else {
        //!? 'create function', attr, value
        el.setAttribute(attr, '')
        attrs[attr] = el.getAttributeNode(attr)!
        ;(el as Any)[name] = value
      }
      return
  }

  if (value == null) {
    el.removeAttribute(attr)
    delete attrs[attr]
    if ((el as Any)[name] != null) {
      delete (el as Any)[name]
    }
    return
  }

  ;(el as Any)[name] = value
  if (el.hasAttribute(attr))
    attrs[attr] = el.getAttributeNode(attr)!
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
    //!? 'disconnected, removing all attrs and props', cacheRef
    for (const name in attrs) {
      //!? 'removed attr', name
      el.removeAttributeNode(attrs[name])
    }
    for (const name in props) {
      if (isEvent(name)) {
        //!? 'removed event listener', name
        el.removeEventListener(toEvent(name), props[name], props[name])
      } else {
        //!? 'removed prop', name
        delete (el as Any)[name]
      }
    }
    propCache.delete(cacheRef)
    return
  }

  let prev
  let value
  out:
  for (const name in props) {
    if (!(name in next)) {
      //!? 'removed prop', name
      delete (el as Any)[name]
      continue
    }

    value = next[name]

    switch (name) {
      case 'children':
        // case 'style':
        // case 'ref':
        continue out
    }

    value = (value as any)?.valueOf() // updated prop

    prev = props[name]
    if (prev !== value) {
      if (typeof value === 'function') {
        if (prev.fn && value.fn) {
          //!? 'updated fn'
          value = prev.update(value.fn, value.options)
          if (value === prev) {
            next[name] = value
          }
        }

        if (prev !== value || cacheRef !== el) {
          let attr = name // toAttr[name] || name
          if (isEvent(attr)) {
            attr = toEvent(attr)
            //!? 'updated event listener', attr, prev, value
            el.removeEventListener(attr, prev, prev)
            el.addEventListener(attr, value, value)
          } else {
            //!? 'updated function', attr, prev, value
            props[attr] = (el as Any)[attr] = value
          }
        }
      } else if (!(name in attrs)) {
        if (value == null) {
          //!? 'removed prop', name
          if ((el as Any)[name] != null) {
            ;(el as Any)[name] = value
          }
        } else {
          //!? 'updated prop', name, prev, value
          ;(el as Any)[name] = value
        }
      }
    }
  }

  for (const name in attrs) {
    if (!(name in next) || next[name] === false || next[name] == null) {
      //!? 'removed attr', name
      el.removeAttribute(name) // attrs[name])
      delete attrs[name]
      continue
    }

    value = (next[name] as any)?.valueOf()

    switch (name) {
      case 'style':
        if (typeof value === 'object') value = styleToCss(value as CSSStyleDeclaration) //|| null
        break
    }

    // updated value
    if (props![name] !== value && typeof value !== 'function') {
      if (value == null) {
        if (attrs[name].value != null) {
          //!? 'removed attr', name
          el.removeAttribute(name)
          delete attrs[name]
        }
      } else {
        //!? 'updated attr', name, value
        attrs[name].value = value as string
      }
    }
  }

  // created props
  for (const name in next) {
    if (!(name in attrs) && !(name in props!))
      createProp(doc, el, type, name, next[name], attrs)
  }

  c.props = next
}
