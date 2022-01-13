import { VAtom } from '.'

export const atomEq = (a: VAtom, b: VAtom) => {
  // prettier-ignore
  const eq = (
    (a != null && b != null) &&
    (
      (a === b) ||
      (
        (a[1] && b[1] && 'key' in a[1] && 'key' in b[1])
          ? a[1]!.key === b[1]!.key
          : a[0] === b[0]
      )
    )
  )
  // console.log('EQUAL', eq, a, b)
  return eq
}

export const domEq = (a: Node, b: Node) => {
  return a === b
}
