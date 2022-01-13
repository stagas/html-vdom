import { VList } from './v'

// import { inspect } from 'util'
// const log = (...args: any[]) => console.log(...args.map(x => inspect(x, false, Infinity, true)))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParentLike = ParentNode | VList<any>

const $ = (P: ParentLike) => (Array.isArray(P) ? P.at(-1) : P.lastChild)

// const nextSibling = <T>(parent: ParentLike<T>, child: T | ChildNode): T | ChildNode | null =>
//   parent instanceof VList ? parent.nextSiblingOf(child as T) : (child as ChildNode).nextSibling

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
  // log(a, b)

  // A holds the anchor element where insertBefore(x, A) latches on
  let A: T | null

  // B holds the current element in the new list b
  let B: T | null

  // C holds a temp value of the list a that will be compared and maybe inserted
  let C: T | null

  // log(b, a)
  let i = 0

  const n = b.length
  let p = a.length

  //              p
  // a  1 2 3 4 5
  //        i
  // b  1 2 0 4 5
  //              n
  // R  1 2
  //
  // advance start pointer while equal head
  // TODO:                     set A B here
  while (i < n && i < p && eq((A = _(a, i)), (B = _(b, i)))) i++

  //          p
  // a  1 2 3 4 5
  //        i
  // b  1 2 0 4 5
  //          n
  // R  1 2
  //
  // shorten end pointer while equal tail
  // while (i < n && i < p && eq(_(a, p - 1), _(b, n - 1))) --p, --n

  // insert:
  //        A
  //        p
  // a  1 2 4 5
  //              i
  // b  1 2 0 0 0 4 5
  //              n
  // R  1 2 0 0 0
  //

  // append:
  //          A
  //          p
  // a  1 2 3
  //          i
  // b  1 2 3 4
  //            n
  //

  // prepend:
  //
  //    A
  //    p
  // a  1 2 3
  //    i
  // b  4 1 2 3
  //      n
  //

  // insert/append/prepend shortcut
  if (i == p) {
    A = _(a, p)
    for (; i < n; i++) P.insertBefore(_(b, i)!, A)
    // we are done -- rest of elements (if any) are the same
  } else {
    // replace:
    //
    //      A
    //        p
    // a  1 2 3
    //      i
    // b  1 4 3
    //        n
    //      B

    // replace + remaining tail:
    //
    //        A
    //        p
    // a  1 2 3
    //        i
    // b  1 4 5 6 3
    //            n
    // R  1 4 3
    //      B

    //      x
    //      A
    //          p
    // a  1 2 3 4
    //        i
    //        C
    //            y
    // b  1 3 2 4
    //          n
    //            B
    // R  1 3 2 4

    //      x
    //      A
    //            p
    // a  1 2 3 4
    //        C
    //        i
    //      y
    // b  1 3 4 2
    //      B
    //            n
    // R  1 3 4 2

    // moves:
    //
    //        x
    //                    p
    //        A
    // a  1 2 3 4 5 6 7 8
    //    i         y
    //    C
    // b  3 6 5 1 2 7 8 4
    //              B
    //                    n
    //
    // R  1 2 3 4 5 6 7 8
    // R  3 6 5 1 2 4 7 8
    //

    // let x = i
    // let y = i
    // for (; y < n; y++) {
    //   for (i = y; i < p; i++) {
    //     C = _(P, i)
    //     if (eq(C, B)) {
    //       P.insertBefore(C, A)
    //       break
    //     }
    //     //
    //   }

    //   while (y < n && x < p && eq((A = _(P, y)), (B = _(b, y)))) x++, y++

    //   //      A = _(P, x)
    // }

    let x = 0
    out: while (((A = _(P, i)!), (B = _(b, i)!), i++ < n)) {
      if (!eq(A, B)) {
        for (x = i; x < p; x++) {
          C = _(P, x)!
          if (eq(B, C)) {
            P.insertBefore(C, A)
            continue out
          }
        }
        for (x = i; x < n; x++) {
          C = _(b, x)
          if (eq(A, C)) {
            P.insertBefore(B, A)
            continue out
          }
        }
        if (A) P.replaceChild(B, A)
        else P.appendChild(B) //, null)
      }
    }
    p = len(P)
    i = n
    while (i++ < p) P.removeChild($(P))

    // remove tail:
    //
    //          p
    // a  1 2 3
    //      i
    // b  1 2
    //        n

    // remove head:
    //
    //      p
    // a  1 2 3
    //    i
    // b  2 3
    //    n
    // for (; i < p--; ) P.removeChild(_(P, i))
  }

  // if (P instanceof Node) {
  //   log('RESULT', P.innerHTML)
  // } else log('RESULT', [...P])
}
