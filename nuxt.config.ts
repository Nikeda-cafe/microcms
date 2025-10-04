export default defineNuxtConfig({
  srcDir: 'src',
  typescript: {
    strict: true,
    shim: false
  },
  runtimeConfig: {
    microcmsServiceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    microcmsApiKey: process.env.MICROCMS_API_KEY || '',
    public: {
      siteName: process.env.MICROCMS_SITE_NAME || 'Nuxt3 microCMS Blog'
    }
  },
  app: {
    head: {
      title: process.env.MICROCMS_SITE_NAME || 'Nuxt3 microCMS Blog',
      meta: [
        { name: 'description', content: process.env.MICROCMS_SITE_DESCRIPTION || 'Blog powered by Nuxt3 and microCMS' }
      ]
    }
  }
})
