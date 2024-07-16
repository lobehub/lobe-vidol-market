module.exports = {
  markdown: {
    entry: ["./README.zh-CN.md"],
    entryLocale: "zh-CN",
    entryExtension: ".zh-CN.md",
    outputLocales: ["en-US"],
    outputExtensions: (locale, { getDefaultExtension }) => {
      if (locale === "en-US") return ".md";
      return getDefaultExtension(locale);
    },
  },
  selectors: ['meta.title', 'meta.description', 'meta.tags', 'config.systemRole'],
  entryLocale: 'en-US',
  outputLocales: ['zh-CN', 'en-US'],
  modelName: 'gpt-3.5-turbo-0125',
};