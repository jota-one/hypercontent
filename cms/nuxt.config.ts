// https://v3.nuxtjs.org/api/configuration/nuxt.config

import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  content: {
    api: {
      baseURL: '/_content',
    },
    documentDriven: true,
  },

  imports: {
    dirs: ['types/**'],
  },

  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/plausible',
    '@nuxtjs/tailwindcss',
    join(currentDir, 'modules/hypercontent'),
  ],

  runtimeConfig: {
    public: {
      hypercontent: {
        content: {
          api: {
            base: '_hc:api:',
            labels: '__langCode__:labels.json',
            langs: 'langs.json',
            navigation: '__langCode__:navigation.json',
          },
        },
      },
    },
  },

  tailwindcss: {
    config: {
      corePlugins: {
        preflight: false,
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: ['@editorjs/editorjs'],
    },
  },
})
