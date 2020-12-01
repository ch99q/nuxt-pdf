export default {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  mode: 'universal',
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'static',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
    'nuxt-pdf',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt/content
    '@nuxt/content',
    // https://i18n.nuxtjs.org
    'nuxt-i18n',
  ],
  /*
   ** PDF module configuration
   */
  pdf: {
    i18n: true,

    routes: [
      {
        file: 'documentation.pdf',

        route: '/docs',

        meta: {
          title: 'Documentation',
        },
      },
      {
        file: 'dokumentation.pdf',

        route: '/docs',

        locale: 'da',
      },
      {
        file: 'article.pdf',

        route: '/article',
      },
    ],
  },
  /*
   ** I18n module configuration
   */
  i18n: {
    locales: [
      {
        name: 'English',
        code: 'en',
        iso: 'en-US',
        file: 'en-US',
        domain: process.env.DOMAIN_EN || 'localhost:3000',
      },
      {
        name: 'Dansk',
        code: 'da',
        iso: 'da-DK',
        file: 'da-DK',
        domain: process.env.DOMAIN_DA || 'localhost.dk:3000',
      },
    ],

    // differentDomains: true,

    defaultLocale: 'en',

    strategy: 'prefix_and_default',

    seo: true,

    vueI18n: {
      fallbackLocale: 'en',
      messages: {
        en: {
          welcome: 'Welcome',
        },
        da: {
          welcome: 'Velkommen',
        },
      },
    },
  },
  /*
   ** Content module configuration
   ** See https://content.nuxtjs.org/configuration
   */
  content: {},
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {},
}
