const fs = require('fs')
const path = require('path')

const {
  PDFDocument: Document
} = require('pdf-lib')

const chalk = require('chalk')
const puppeteer = require('puppeteer')

const defaults = require('./module.defaults')

const supportedFormats = ['a1', 'a2', 'a3', 'a4', 'a5', 'letter', 'legal', 'tabloid']

export const promisifyRoute = function promisifyRoute(fn, ...args) {
  // If routes is an array
  if (Array.isArray(fn)) {
    return Promise.resolve(fn)
  }
  // If routes is a function expecting a callback
  if (fn.length === arguments.length) {
    return new Promise((resolve, reject) => {
      fn((err, routeParams) => {
        if (err) {
          reject(err)
        }
        resolve(routeParams)
      }, ...args)
    })
  }
  let promise = fn(...args)
  if (
    !promise ||
    (!(promise instanceof Promise) && typeof promise.then !== 'function')
  ) {
    promise = Promise.resolve(promise)
  }
  return promise
}

module.exports = async function PDF(moduleOptions) {
  // const isSSG =
  //   this.options.dev === false &&
  //   (this.options.target === 'static' ||
  //     this.options._generate ||
  //     this.options.mode === 'spa')
  const isGenerate = !!this.options._generate
  const isDev = this.options.dev

  const options = Object.assign({}, defaults, moduleOptions, this.options.pdf)

  const i18n = {
    enabled: options.i18n,
    domains: {},
    options: {}
  }

  if (i18n.enabled) {
    i18n.options = Object.assign({},
      this.options.i18n,
      (this.options.modules.find(
        x => Array.isArray(x) && x[0] === 'nuxt-i18n'
      ) || [('', {})])[1],
      (this.options.buildModules.find(
        x => Array.isArray(x) && x[0] === 'nuxt-i18n'
      ) || [('', {})])[1]
    )

    for (const locale of i18n.options.locales) {
      if ('domain' in locale && 'code' in locale) {
        i18n.domains[locale.code] = locale.domain
      }
    }
  }

  var routeMap
  var url

  /*
   * Add pdf styling to render.
   */
  this.options.css.push(path.resolve(__dirname, 'css/pdf.css'))

  const format = options.pdf.format.toLowerCase()

  if (supportedFormats.includes(format)) {
    this.options.css.push(path.resolve(__dirname, 'css/' + format + '.css'))
  } else {
    console.error(
      chalk.bgRed.black(' ERROR ') +
      " Unable to find format ('" +
      options.pdf.format +
      "')"
    )

    return
  }

  this.nuxt.hook('listen', (_, router) => (url = router.url.toString()))
  this.nuxt.hook('build:compile', () => {
    routeMap = require(path.resolve(this.options.buildDir, 'routes.json'))
  })

  /*
   * Extending the generated routes with pdf requested routes.
   */
  this.nuxt.hook('generate:extendRoutes', async routes => {

    const generatedRoutes = await promisifyRoute(options.routes || [])

    for (let i = 0; i < generatedRoutes.length; i++) {
      const route = generatedRoutes[i]

      if (routes.filter(r => r.route === route.route).length > 0) {
        continue
      }

      routes.push({
        route: route.route,
        payload: null
      })
    }
  })

  const getUrl = (path, locale) => {

    const chunk = routeMap.find(
      route => route.path == path.split('?')[0].split('#')[0]
    )

    //if (chunk === undefined && path != '/*/') {
    //  return getUrl('/*/', locale)
    //}

    if (chunk === undefined)
      throw new Error(
        'Unable to find route at ' + path.split('?')[0].split('#')[0]
      )

    const routes = routeMap.filter(route => route.chunkName == chunk.chunkName)

    var uri = ''
    var protocol = new URL(url).protocol

    if (i18n.enabled && typeof locale !== 'undefined') {
      const routesNameSeparator = i18n.options.routesNameSeparator || '___'
      const route = routes.find(
        route =>
        route.name.endsWith(
          routesNameSeparator + locale + routesNameSeparator + 'default'
        ) || route.name.endsWith(routesNameSeparator + locale)
      )

      if (i18n.options.differentDomains) {
        if (locale in i18n.domains) {
          uri =
            protocol +
            '//' +
            i18n.domains[locale].replace(/\/$/, '') +
            path
        } else {
          uri = url.replace(/\/$/, '') + path
        }
      } else {
        uri = url.replace(/\/$/, '') + path
      }
    } else {
      uri = url.replace(/\/$/, '') + path
    }
    return uri
  }

  async function build() {
    var nuxt
    var listener
    if (!isDev && !isGenerate) {
      console.log('Starting nuxt instance')
      const {
        loadNuxt
      } = require('nuxt')

      nuxt = await loadNuxt('start')

      listener = await nuxt.server.listen()
    }

    if (nuxt && 'url' in listener) {
      url = listener.url
    }

    let browser = await puppeteer.launch(
      Object.assign({
        headless: true
      }, options.puppeteer)
    )

    let page = (await browser.pages())[0]

    const routes = await promisifyRoute(options.routes || [])

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]
      console.log(chalk.cyan('↻') + ' Generating PDF at ' + route.route)

      try {
        // Merge route meta with defaults from config.
        const meta = Object.assign({}, options.meta, route.meta)

        page.goto(getUrl(route.route, route.locale))

        await page.waitForSelector(
          '#__nuxt',
          nuxt ? {
            visible: true,
            timeout: 500
          } : {
            visible: true
          }
        )

        await page.reload()

        await page.waitForSelector(
          '#__nuxt',
          nuxt ? {
            visible: true,
            timeout: 500
          } : {
            visible: true
          }
        )

        // Generate pdf based on dom content. (result by bytes)
        const bytes = await page.pdf(Object.assign({}, options.pdf))

        // Load bytes into pdf document, used for manipulating meta of file.
        const document = await Document.load(bytes)

        // Set the correct meta for pdf document.
        if ('title' in meta && meta.title !== '') {
          document.setTitle(
            (meta.titleTemplate || '%s').replace('%s', meta.title)
          )
        } else {
          document.setTitle(await page.title())
        }

        document.setAuthor(meta.author || '')
        document.setSubject(meta.subject || '')
        document.setProducer(meta.producer || '')
        document.setCreationDate(meta.creationDate || new Date())
        document.setKeywords(meta.keywords || [])

        const file = path.resolve(options.dir, route.file)

        // Create folder where file will be stored.
        fs.mkdirSync(file.substring(0, file.lastIndexOf('/')), {
          recursive: true
        })

        // Write document to file.
        const ws = fs.createWriteStream(file)
        ws.write(await document.save())
        ws.end()

        console.log(
          chalk.green('✔') +
          ' Generated PDF at ' +
          route.path +
          ` (${document.getTitle()})`
        )
      } catch (e) {
        console.log(
          chalk.red('𐄂') +
          ' Failed to generated PDF at ' +
          route.route +
          ` error: ${e.message}`
        )
      }
    }

    browser.close()

    browser = null;
    page = null;

    if (nuxt) {
      await listener.close()

      nuxt = null;
      listener = null;
      //delete nuxt
      //delete listener
    }
  }

  if (isDev) {
    this.nuxt.hook('build:compiled', async ({
      name
    }) => {
      if (name !== 'server') return

      await build()
    })
  } else if (this.options._generate) {
    this.nuxt.hook('generate:done', async () => {
      await build()
    })
  } else {
    this.nuxt.hook('build:done', async () => {
      await build()
    })
  }
}

module.exports.meta = require('../package.json')
