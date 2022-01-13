import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      // '/api': {
      //   target: 'http://localhost:1337/',
      //   rewrite: path => path.replace(/^\/api/, ''),
      // },
    },
  },
  resolve: {
    alias: {
      // '/some-uri': path.resolve(path.join(__dirname, 'node_modules/path/to/file.js')),
    },
  },
  plugins: [],
  // assetsInclude: ['src/test/**/*'],
})
