import path from 'path'
import fs from 'fs'

import mkdir from 'mkdirp'
import merge from 'merge'
import puppeteer from 'puppeteer'

import chalk from 'chalk'

import { PDFDocument as Document } from 'pdf-lib'

import defaults from './module.defaults'

module.exports = function(moduleOptions) {
  /*
   * Merge defaults and configuration from nuxt.config.js
   */
  const options = merge.recursive(
    true,
    defaults,
    moduleOptions,
    this.options.pdf
  )

  /*
   * Add pdf styling to render.
   */
  this.options.css.push(path.resolve(__dirname, 'css/pdf.css'))

  switch (options.pdf.format.toLowerCase()) {
    case 'a1':
      this.options.css.push(path.resolve(__dirname, 'css/a1.css'))
      break
    case 'a2':
      this.options.css.push(path.resolve(__dirname, 'css/a2.css'))
      break
    case 'a3':
      this.options.css.push(path.resolve(__dirname, 'css/a3.css'))
      break
    case 'a4':
      this.options.css.push(path.resolve(__dirname, 'css/a4.css'))
      break
    case 'a5':
      this.options.css.push(path.resolve(__dirname, 'css/a5.css'))
      break

    default:
      console.log(
        chalk.bgRed.black(' ERROR ') +
          " Unable to find format ('" +
          options.pdf.format +
          "')"
      )
      break
  }

  /*
   * Extending the generated routes with pdf requested routes.
   */
  this.nuxt.hook('generate:extendRoutes', async routes => {
    for (let i = 0; i < options.routes.length; i++) {
      const route = options.routes[i]

      if (routes.filter(r => r.route === route.route).length > 0) {
        continue
      }

      routes.push({
        route: route.route,
        payload: null
      })
    }
  })

  /*
   * Generating PDF based on routes from config.
   */
  this.nuxt.hook('generate:done', async (nuxt, errors) => {
    console.log(chalk.blueBright('ℹ') + ' Generating pdfs')

    for (let i = 0; i < options.routes.length; i++) {
      const route = options.routes[i]

      // Merge route meta with defaults from config.
      const meta = Object.assign(options.meta, route.meta)

      // Launch puppeteer headless browser.
      const browser = await puppeteer.launch(
        Object.assign(
          {
            headless: true
          },
          options.puppeteer
        )
      )

      // Create new page (new browser tab) to navigate to url.
      const page = await browser.newPage()

      // Navigate to the generate route.
      await page.goto(
        `file:${
          route.route === '/'
            ? path.join(nuxt.options.generate.dir, 'index.html')
            : path.join(nuxt.options.generate.dir, route.route, 'index.html')
        }`,
        {
          waitUntil: 'networkidle0'
        }
      )

      // Generate pdf based on dom content. (result by bytes)
      const bytes = await page.pdf(Object.assign(options.pdf))

      // Close the browser, now that we have the pdf document.
      await browser.close()

      // Load bytes into pdf document, used for manipulating meta of file.
      const document = await Document.load(bytes)

      // Set the correct meta for pdf document.
      document.setTitle((meta.titleTemplate || '%s').replace('%s', meta.title))
      document.setAuthor(meta.author || '')
      document.setSubject(meta.subject || '')
      document.setProducer(meta.producer || '')
      document.setCreationDate(meta.creationDate || new Date())
      document.setKeywords(meta.keywords || [])

      // Create folder where file will be stored.
      mkdir(path.resolve(options.dir, route.directory))

      // Write document to file.
      const ws = fs.createWriteStream(
        path.resolve(options.dir, route.directory, route.filename)
      )
      ws.write(await document.save())
      ws.end()

      console.log(chalk.green('✔') + ' Generated ' + route.route)
    }
  })
}

module.exports.meta = require('../package.json')
