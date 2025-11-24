/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ['en', 'es', 'fr', 'pl'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/packages/i18n/locales/{locale}/messages',
      include: [
        '<rootDir>/apps/web/src',
        '<rootDir>/apps/native/src',
        '<rootDir>/packages/i18n/src',
        '<rootDir>/apps/landing-page/src',
      ],
      exclude: ['**/node_modules/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    },
  ],
  format: 'po',
  compileNamespace: 'ts',
  rootDir: __dirname,
}
