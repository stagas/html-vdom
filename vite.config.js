// vite.config.js
export default {
  esbuild: {
    jsxFactory: '_jsx',
    jsxFragment: '_jsxFragment',
    jsxInject: `import { h as _jsx, h as _jsxs, Fragment as _jsxFragment } from 'html-vdom'`,
  }
}
