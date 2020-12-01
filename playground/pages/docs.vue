<template>
  <div>
    <section class="flex flex-col w-screen h-screen a4 page">
      <h1 v-t="'welcome'" class="m-auto text-4xl" />
      <p>Text above is generated dynamicly by i18n</p>
    </section>
    <section class="flex w-screen h-screen a4 page">
      <h1 class="m-auto text-4xl">Section 2 | Query: {{ test }}</h1>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      test: '',
    }
  },
  mounted() {
    this.test = this.$route.query.test
  },
  head: {
    title: 'Super Docs',
  },
  nuxtI18n: {
    paths: {
      en: '/docs',
      da: '/doku',
    },
  },
}
</script>
