import { JSXKind, JSXProps, JSXChild } from './h'

export class VAtom extends Array<JSXKind | JSXProps | VList<JSXChild>> {}

export class VList<T> extends Array<T> {
  // get childElementCount() {
  //   return this.length
  // }
  get childNodes() {
    return this
  }
  appendChild(child: T): T {
    this.maybeRemove(child)
    this.push(child)
    return child
  }
  // copy(): VList<T> {
  //   return new VList(...this)
  // }
  flatten(): T[] {
    const arr: T[] = []
    for (const item of this) {
      if (item instanceof VList) arr.push(...item.flatten())
      else arr.push(item)
    }
    return arr
  }
  insertAt(index: number, newChild: T): T {
    const existingIndex = this.maybeRemove(newChild)
    this.splice(index - (~existingIndex ? (existingIndex < index ? 1 : 0) : 0), 0, newChild)
    return newChild
  }
  insertBefore(newChild: T, refChild: T | null): T {
    return refChild === null
      ? this.appendChild(newChild)
      : this.insertAt(this.mustIndexOf(refChild), newChild)
  }
  maybeRemove(child: T): number {
    const index = this.indexOf(child)
    if (~index) this.splice(index, 1)
    return index
  }
  mustIndexOf(child: T): number {
    const index = this.indexOf(child)
    if (!~index) throw new Error('Child not in list')
    return index
  }
  removeChild(child: T): T {
    return this.splice(this.mustIndexOf(child), 1)[0]
  }
  replaceChild(newChild: T, oldChild: T): T {
    this.maybeRemove(newChild)
    return this.splice(this.mustIndexOf(oldChild), 1, newChild)[0]
  }
  // nextSiblingOf(child: T): T | null {
  //   return this[this.mustIndexOf(child) + 1] ?? null
  // }
}

export type ParentLike<T> = VList<T>
