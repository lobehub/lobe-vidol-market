module.exports = {
  markdown: {
    entry: ["./README.zh-CN.md"],
    entryLocale: "zh-CN",
    entryExtension: ".zh-CN.md",
    outputLocales: ["en-US"],
    outputExtensions: (locale, {
      getDefaultExtension
    }) => {
      if (locale === "en-US") return ".md";
      return getDefaultExtension(locale);
    },
  },
  // agent translate key
  // selectors: ['systemRole','greeting','meta.name','meta.readme','meta.description', 'touch.head','touch.arm','touch.leg','touch.chest','touch.belly'],
  // dance translate key
  selectors: ['name', 'readme'],
  entryLocale: 'zh-CN',
  outputLocales: ['zh-CN', 'en-US'],
  modelName: 'gpt-3.5-turbo-0125',
};