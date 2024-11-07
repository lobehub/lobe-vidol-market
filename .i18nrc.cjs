module.exports = {
  selectors: [
    "meta.name",
    "meta.description",
    "meta.category",
    "systemRole",
    "greeting",
    "touch",
  ],
  entryLocale: "zh-CN",
  outputLocales: [
    "ar",
    "bg-BG",
    "zh-TW",
    "en-US",
    "ru-RU",
    "ja-JP",
    "zh-CN",
    "ko-KR",
    "fr-FR",
    "tr-TR",
    "es-ES",
    "pt-BR",
    "de-DE",
    "it-IT",
    "nl-NL",
    "pl-PL",
    "vi-VN",
  ],
  modelName: "gpt-4o-mini",
  temperature: 0.5,
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
};
