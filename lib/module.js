const fs = require('fs')
const path = require('path')

const { PDFDocument: Document } = require('pdf-lib')

const chalk = require('chalk')
const puppeteer = require('puppeteer')

const defaults = require('./module.defaults')

const supportedFormats = ['a1', 'a2', 'a3', 'a4', 'a5']

module.exports = async function PDF(moduleOptions) {
  const isSSG =
    this.options.dev === false &&
    (this.options.target === 'static' ||
      this.options._generate ||
      this.options.mode === 'spa')
  const isGenerate = !!this.options._generate
  const isDev = this.options.dev

  const options = Object.assign({}, defaults, moduleOptions, this.options.pdf)

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

  this.nuxt.hook('listen', (_, router) => (url = router.url))

  /*
   * Extending the generated routes with pdf requested routes.
   */
  this.nuxt.hook('generate:extendRoutes', async (routes) => {
    for (let i = 0; i < options.routes.length; i++) {
      const route = options.routes[i]

      if (routes.filter((r) => r.route === route.route).length > 0) {
        continue
      }

      routes.push({
        route: route.route,
        payload: null,
      })
    }
  })

  async function build() {
    var nuxt
    var listener;
    if (!isDev && !isGenerate) {
      console.log('Starting nuxt instance')
      const { loadNuxt } = require('nuxt')

      nuxt = await loadNuxt('start')

      listener = await nuxt.server.listen()
    }

    const browser = await puppeteer.launch(
      Object.assign({ headless: true }, options.puppeteer)
    )

    const page = (await browser.pages())[0]

    for (let i = 0; i < options.routes.length; i++) {
      const route = options.routes[i]

      console.log(chalk.cyan('↻') + ' Generating PDF at ' + route.route)

      // Merge route meta with defaults from config.
      const meta = Object.assign(options.meta, route.meta)

      // Navigate to the generate route.
      if (isGenerate) {
        await page.goto(
          `file:${
            route.route === '/'
              ? path.join(nuxt.options.generate.dir, 'index.html')
              : path.join(nuxt.options.generate.dir, route.route, 'index.html')
          }`,
          {
            waitUntil: 'networkidle0',
          }
        )
      } else {
        if (nuxt) {
          url = listener.url
        }

        page.goto(
          `${url}${route.route === '/' ? '' : route.route.replace(/^\/+/, '')}`
        )
        await page.waitForSelector(
          '#__nuxt',
          nuxt
            ? { visible: true, timeout: 500 }
            : {
                visible: true,
              }
        )
      }

      // Generate pdf based on dom content. (result by bytes)
      const bytes = await page.pdf(Object.assign(options.pdf))

      // Load bytes into pdf document, used for manipulating meta of file.
      const document = await Document.load(bytes)

      // Set the correct meta for pdf document.
      document.setTitle((meta.titleTemplate || '%s').replace('%s', meta.title))
      document.setAuthor(meta.author || '')
      document.setSubject(meta.subject || '')
      document.setProducer(meta.producer || '')
      document.setCreationDate(meta.creationDate || new Date())
      document.setKeywords(meta.keywords || [])

      const file = path.resolve(options.dir, route.file)

      // Create folder where file will be stored.
      fs.mkdirSync(file.substring(0, file.lastIndexOf('/')), {
        recursive: true,
      })

      // Write document to file.
      const ws = fs.createWriteStream(file)
      ws.write(await document.save())
      ws.end()

      console.log(chalk.green('✔') + ' Generated PDF at ' + route.route)
    }

    browser.close()

    delete browser
    delete page

    if(nuxt) {
      await listener.close()

      delete nuxt;
      delete listener;
    }
  }

  if (isDev) {
    this.nuxt.hook('build:compiled', async ({ name }) => {
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
