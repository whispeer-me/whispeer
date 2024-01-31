// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ["@nuxt/test-utils/module"],
  ssr: true,
  app: {
    head: {
      title: "Whispeer - Secure, Private Messaging",
      meta: [
        {
          name: "description",
          content:
            "Whispeer offers a secure way to create and share encrypted messages that auto-expire in 24 hours",
        },
        {
          name: "keywords",
          content:
            "secure messaging, private communication, encrypted messaging, message encryption, auto-expiring messages, data security, privacy, anonymous messaging",
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
    public: {
      analyticsDomain: process.env.ANALYTICS_DOMAIN,
    },
  },
});
