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
- For **NUXT 2.x** and higher

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
- [License](#license)

## Installation

```shell
npm install nuxt-pdf
```

or

```shell
yarn add nuxt-pdf
```

## Usage

- Add `nuxt-pdf` to the `modules` section of your `nuxt.config.js` file:

```js
modules: ["nuxt-pdf"];
```

- Add a custom configuration with the `pdf` property.

You can see the available options in the example [configuration](#configuration)

```js
// nuxt.config.js

{
  modules: [
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
    dir: "dist",

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
    * PDF Meta configuration. (inspired by vue-meta)
    */
    meta: {
      title: "Default PDF title",
      titleTemplate: "Example ─ %s",

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
        // PDF Filename
        filename: "super-awesome-pdf.pdf",

        // Output directory for pdf.
        // Combined with 'dir' value in options. (default 'dist')
        directory: "downloads/",

        // Route to content that should be converted into pdf.
        route: "/",

        // Override global meta with individual meta for each pdf.
        meta: {
          title: "Super Awesome PDF"
        }
      }
    ]
  }
}
```

## Development

```bash
$ git clone https://github.com/ch99q/nuxt-pdf.git

$ cd nuxt-pdf

$ yarn
```

## License

[MIT License](./LICENSE)
