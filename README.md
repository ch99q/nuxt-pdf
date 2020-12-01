# Nuxt PDF [WIP]

[![npm](https://img.shields.io/npm/dt/nuxt-pdfsvg?style=flat-square)](https://npmjs.com/package/nuxt-pdf)
[![npm (scoped with tag)](https://img.shields.io/npm/v/nuxt-pdf/latest.svg?style=flat-square)](https://npmjs.com/package/nuxt-pdf)
[![License](https://img.shields.io/npm/l/nuxt-pdf?style=flat-square)](http://standardjs.com)

> Generate PDF files directly from your content on your website, can be used for offline downloadable documentation pages.

## Features

- Create PDF from Vue template
- Automatic PDF Generation
- Customizable Metadata
- Supports (A1, A2, A3, A4, A5)
- Support dynamic routes (Nuxt Generate)
- Support dynamic titles (from <title> tag)
- I18n support for specific languages
- Generates as you edit (Automatic PDF regeneration)
- For **NUXT 2.x** and higher

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
- [License](#license)

## Installation

```shell
npm install nuxt-pdf --save-dev
```

or

```shell
yarn add -D nuxt-pdf
```

## Usage

- Add the class `.page` to your page to display when printing, for formatting, add classes: `.a1`, `.a2`, `.a3`, `.a4` or `.a5`

- Add `nuxt-pdf` to the `buildModules` section of your `nuxt.config.js` file:

```js
buildModules: ['nuxt-pdf']
```

- Add a custom configuration with the `pdf` property.

You can see the available options in the example [configuration](#configuration)

```js
// nuxt.config.js

{
  buildModules: [
    'nuxt-pdf'
  ],
  pdf: {
    // custom configuration
  }
}
```

## Configuration

```javascript
// nuxt.config.js

{
  pdf: {
    /*
    * Output folder for generated pdf.
    */
    dir: "static",

    /*
    * Function options for page.pdf([options])
    * Read more: https://pptr.dev/#?product=Puppeteer&version=v2.0.0&show=api-pagepdfoptions
    */
    pdf: {
      // Change the format of the pdfs.
      format: "A4",

      printBackground: true // Include background in pdf.
    },

    /*
    * Enable i18n support.
    */
    i18n: false,

    /*
     * Add options to the puppeteer launch.
     * Read more: https://pptr.dev/#?product=Puppeteer&version=v2.0.0&show=api-puppeteerlaunchoptions
     */
    puppeteer: {
      // Puppeteer options here... E.g. env: {}
    }

    /*
    * PDF Meta configuration. (inspired by vue-meta)
    */
    meta: {
      title: "My Module",
      titleTemplate: "Documentation ─ %s",

      author: "Christian Hansen",
      subject: "Example",

      producer: "Example Inc.",

      // Control the date the file is created.
      creationDate: new Date(),

      keywords: ["pdf", "nuxt"]
    },

    /*
    * PDF generation routes. (expanding nuxt.generate)
    */
    routes: [
      {
        // Output file inside output folder.
        file: "downloads/documentation.pdf",

        // Route to content that should be converted into pdf.
        route: "docs",

        // Specifify language for pdf. (Only when i18n is enabled!)
        locale: 'da'

        // Override global meta with individual meta for each pdf.
        meta: {
          title: "Home"
        }
      },
      {
        // Output: static/downloads/documentation-vue.pdf
        file: "downloads/documentation-vue.pdf",

        // Will generate route https://localhost:3000/docs/vue
        route: "docs/vue",

        // Title will be Documentation - Vue
        meta: {
          title: "Vue"
        }
      }
    ]
  }
}
```

- PDF generation

PDFs will be generated when running `nuxt build`, `nuxt generate` or in development `nuxt dev`

## Development

```bash
$ git clone https://github.com/ch99q/nuxt-pdf.git

$ cd nuxt-pdf

$ yarn
```

## License

[MIT License](./LICENSE)
