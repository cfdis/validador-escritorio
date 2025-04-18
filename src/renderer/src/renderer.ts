import '../assets/main.css'
import $ from 'jquery'
import { ThemeManager } from './utils/ThemeManager'

function init(): void {
  $(() => {
    initFooter()

    const themeManager = new ThemeManager();
    themeManager.initThemeSelector();
  })
}

function initFooter(): void {
  const versions = window.electron.process.versions
  const information = $('#info')
  information.html(
    `<small>© 2025 - Validador CFDI - This app is using Chrome (v${versions.chrome}), Node.js (v${versions.node}), and Electron (v${versions.electron})</small>`
  )
}

init()
