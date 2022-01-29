import { Fragment, JSXChild, JSXKind, JSXProps, h } from './h'
export { Fragment }
export const jsx = (kind: JSXKind, props: JSXProps) => h(kind, props, props?.children as JSXChild)
export { jsx as jsxs }
