const resolve = require('path').resolve

const pdf = {
  dir: resolve(__dirname, '../..', 'dist'),

  pdf: {
    printBackground: true,
    format: 'A4'
  },

  meta: {
    title: 'Default PDF title',
    titleTemplate: 'Example ─ %s',
    author: 'Example Author'
  },

  routes: [
    {
      filename: 'super-awesome-pdf.pdf',
      directory: 'downloads/',

      route: '/',

      meta: {
        title: 'Super Awesome PDF'
      }
    }
  ]
}

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  srcDir: __dirname,
  generate: {
    dir: resolve(__dirname, '../..', "dist")
  },
  modules: ['~/../../lib/module', '@nuxtjs/tailwindcss'],
  pdf,
  dev: process.env.NODE_ENV !== 'test' && process.env.NODE_ENV === 'production'
}
