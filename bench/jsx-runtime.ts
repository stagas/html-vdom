export let jsx = () => void 0
export let jsxs = jsx
export let Fragment = null
export const setEngine = engine => {
  jsx = engine.jsx
  jsxs = engine.jsxs
  Fragment = engine.Fragment
}
