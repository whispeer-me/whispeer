// SPDX-License-Identifier: AGPL-3.0-only

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    "@nuxt/test-utils/module",
    "nuxt-scheduler",
    "@nuxt/image",
    "@nuxtjs/plausible",
  ],
  plausible: {
    trackLocalhost: false,
    autoPageviews: false,
    autoOutboundTracking: true,
  },
  ssr: true,
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "Whispeer - Secure, Expiring Messages",
      meta: [
        {
          name: "description",
          content:
            "Send confidential messages that vanish after 24 hours with Whispeer. Client-side encryption for ultimate privacy. Try it now",
        },
        {
          name: "keywords",
          content:
            "client-side encryption, privacy-focused messaging, ephemeral messaging, self-destructing messages, secure note sharing",
        },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon/32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon/16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/favicon/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  css: [
    "~/assets/scss/app.scss",
    "~/assets/scss/header.scss",
    "~/assets/scss/footer.scss",
    "~/assets/scss/home.scss",
    "~/assets/scss/message.scss",
    "~/assets/scss/new_message.scss",
    "~/assets/scss/modal.scss",
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import "@/assets/scss/variables.scss";
          @import "@/assets/scss/placeholders.scss";
          `,
        },
      },
    },
  },
  runtimeConfig: {
    private: {
      databaseURL: process.env.DATABASE_URL,
    },
    public: {
      domain: "",
    },
  },
});
