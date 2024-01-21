// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  css: [
    "~/assets/scss/app.scss",
    "~/assets/scss/header.scss",
    "~/assets/scss/footer.scss",
    "~/assets/scss/consent.scss",
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
});
