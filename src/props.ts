import type { Any, SafeWeakMap } from 'everyday-types'
import type { Doc, Props } from './jsx-runtime'

import { styleToCss } from 'everyday-utils'
import { html, svg } from './jsx-runtime'

function isEvent(name: string) {
  return name.charAt(0) === 'o' && name.charAt(1) === 'n' && !name.endsWith('ref')
}
function toEvent(name: string) {
  return name.slice(2) as keyof ElementEventMap
}
function isCustomEl(el: Element) {
  return el.tagName.includes('-')
}

function createProp(doc: Doc = html,
  el: Element,
  _type: string,
  name: string,
  value: unknown,
  attrs: Record<string, Attr>,
  isCustom: boolean
) {
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
      if (typeof value === 'object')
        value = styleToCss(value as CSSStyleDeclaration)
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

  const isAttr = !isCustom || ['class'].includes(name)

  switch (typeof value) {
    case 'string':
    case 'number':
      if (doc === svg || (isAttr && !(name in el))) {
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
        if (isAttr) {
          //!? 'create function', attr, value
          el.setAttribute(attr, '')
          attrs[attr] = el.getAttributeNode(attr)!
        }
        ; (el as Any)[name] = value
      }
      return
  }

  if (value == null) {
    if (isAttr) {
      el.removeAttribute(attr)
      delete attrs[attr]
    }
    if ((el as Any)[name] != null) {
      delete (el as Any)[name]
    }
    return
  }

  ; (el as Any)[name] = value === 'false' ? false : value

  if (isAttr && el.hasAttribute(attr))
    attrs[attr] = el.getAttributeNode(attr)!
}

type PropCacheItem = {
  attrs: Record<string, Attr>
  props: Props
  isCustom: boolean
}
const propCache = new WeakMap() as SafeWeakMap<object, PropCacheItem>

export function createProps(doc: Doc,
  el: Element,
  type: string,
  props: Props = {},
  attrs: Record<string, Attr> = {},
  cacheRef: object = el) {
  const isCustom = isCustomEl(el)

  for (const name in props)
    createProp(doc, el, type, name, props[name], attrs, isCustom)

  propCache.set(cacheRef, { props, attrs, isCustom })
}

export function updateProps(doc: Doc, el: Element, type: string, next: Props = {}, cacheRef: object = el) {
  if (!propCache.has(cacheRef))
    return next && createProps(doc, el, type, next, void 0, cacheRef)

  const c = propCache.get(cacheRef)
  const { attrs, props, isCustom } = c
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
  out: for (const name in props) {
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
        // if (prev?.fn && value?.fn) {
        //   //!? 'updated fn'
        //   value = prev.update(value.fn, value.options)
        //   if (value === prev) {
        //     next[name] = value
        //   }
        // }

        if (prev !== value || cacheRef !== el) {
          let attr = name // toAttr[name] || name
          if (isEvent(attr)) {
            attr = toEvent(attr)
            //!? 'updated event listener', attr, prev, value
            if (prev) el.removeEventListener(attr, prev, prev)
            if (value) el.addEventListener(attr, value, value)
          } else {
            //!? 'updated function', attr, prev, value
            props[attr] = (el as Any)[attr] = value
          }
        }
      } else if (!(name in attrs)) {
        if (value == null) {
          //!? 'removed prop', name
          if ((el as Any)[name] != null) {
            ; (el as Any)[name] = value
          }
        } else {
          //!? 'updated prop', name, prev, value
          ; (el as Any)[name] = value === 'false' ? false : value
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
        if (typeof value === 'object')
          value = styleToCss(value as CSSStyleDeclaration) //|| null
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
        // console.warn('updated attr', name, value)
        attrs[name].value = value as string
      }
    }
  }

  // created props
  for (const name in next) {
    if (!(name in attrs) && !(name in props!))
      createProp(doc, el, type, name, next[name], attrs, isCustom)
  }

  c.props = next
}
