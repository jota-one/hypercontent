// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  extends: ['../base'],

  hypercontent: {
    generateContent: {
      customContentApiEndpoints: {
        // cities: {
        //   path: '/cities',
        //   queryParams: { lang_id: '{lang.id}' },
        //   dynamicPageResolver: {
        //     entityName: 'city',
        //     resolve: response => response,
        //   },
        // },
      },
    },
  },
})
