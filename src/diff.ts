import { VList } from './v'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParentLike = ParentNode | VList<any>

const $ = (P: ParentLike) => (Array.isArray(P) ? P.at(-1) : P.lastChild)

const _ = <T>(parent: ParentLike | T[], index: number): T | null =>
  Array.isArray(parent)
    ? (parent[index] as T) ?? null
    : ((parent as ParentNode).childNodes[index] as unknown as T) ?? null

const len = (P: ParentLike) => (Array.isArray(P) ? P.length : P.childNodes.length)

export const diff = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eq: (a: any, b: any) => boolean,
  P: ParentLike,
  b: T[],
  a: T[] = []
) => {
  // A holds the anchor element where insertBefore(x, A) latches on
  let A: T | null

  // B holds the current element in the new list b
  let B: T | null

  // C holds a temp value of the list a that will be compared and maybe inserted
  let C: T | null

  // holds the children that were added
  const added: T[] = []
  // holds the children that were updated
  const updated: T[] = []
  // holds the children that were removed
  const removed: T[] = []

  let i = 0

  const n = b.length
  let p = a.length

  while (i < n && i < p && eq((A = _(a, i)), (B = _(b, i)))) i++

  // insert/append/prepend
  if (i == p) {
    A = _(a, p)
    for (; i < n; i++) {
      B = _(b, i)!
      added.push(B)
      P.insertBefore(B, A)
    }
    // we are done -- rest of elements (if any) are the same
  } else {
    let x = 0
    out: while (((A = _(P, i)!), (B = _(b, i)!), i++ < n)) {
      if (!eq(A, B)) {
        for (x = i; x < p; x++) {
          C = _(P, x)!
          if (eq(B, C)) {
            updated.push(C!)
            P.insertBefore(C, A)
            continue out
          }
        }
        for (x = i; x < n; x++) {
          C = _(b, x)
          if (eq(A, C)) {
            added.push(B)
            P.insertBefore(B, A)
            continue out
          }
        }
        if (A) {
          removed.push(A)
          added.push(B)
          P.replaceChild(B, A)
        } else {
          added.push(B)
          P.appendChild(B)
        }
      }
    }
    p = len(P)
    i = n
    while (i++ < p) {
      A = $(P)
      removed.push(A!)
      P.removeChild(A)
    }
  }

  return { added, updated, removed }
}
