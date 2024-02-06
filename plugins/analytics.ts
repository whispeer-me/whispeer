export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig();
  const analyticsDomain = config.public.analyticsDomain;
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
