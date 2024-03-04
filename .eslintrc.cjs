module.exports = {
  extends: ["@nuxtjs/eslint-config-typescript"],
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "double"], // Enforce single quotes
    "comma-dangle": ["error", "always-multiline"],
    "vue/multi-word-component-names": "off", // Disables the rule that requires component names to be multiple words. Nuxt automatically appends the component name with its folder name, making explicit multi-word names unnecessary.
  },
  overrides: [
    {
      files: ["*.vue"],
      rules: {
        camelcase: "off",
        "vue/no-multiple-template-root": "off",
      },
    },
  ],
};
