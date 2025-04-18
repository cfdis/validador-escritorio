import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'

export default tseslint.config(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'indent': ['error', 'tab', { 'TabWidth': 4 }]  // Indicar que el tab tiene un ancho de 4
    }
  }
)
