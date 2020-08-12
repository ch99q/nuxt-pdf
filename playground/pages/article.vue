<template>
  <article class="page a4">
    <title>{{ page.title }}</title>
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
  </article>
</template>

<script>
export default {
  async asyncData({ $content }) {
    const page = await $content('article').fetch()

    return {
      page,
    }
  },
}
</script>
