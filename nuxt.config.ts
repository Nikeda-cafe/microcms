export default defineNuxtConfig({
  srcDir: 'src',
  typescript: {
    strict: true,
    shim: false
  },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    microcmsServiceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    microcmsApiKey: process.env.MICROCMS_API_KEY || '',
    public: {
      siteName: 'Nuxt3 microCMS Blog'
    }
  },
  app: {
    head: {
      title: 'Nuxt3 microCMS Blog',
      meta: [
        { name: 'description', content: 'Blog powered by Nuxt3 and microCMS' }
      ]
    }
  }
})
