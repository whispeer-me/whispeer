export default defineNuxtPlugin((_nuxtApp) => {
  const {
    public: { analyticsDomain },
  } = useRuntimeConfig();
  if (process.env.NODE_ENV === "production" && analyticsDomain) {
    useHead({
      script: [
        {
          src: `https://plausible.io/js/script.js`,
          defer: true,
          "data-domain": analyticsDomain,
        },
      ],
    });
  }
});
