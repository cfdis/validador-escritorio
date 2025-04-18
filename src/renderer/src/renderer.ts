import '../assets/main.css'
import $ from 'jquery'
import { ThemeManager } from './utils/ThemeManager'
import { AppContext } from './services/AppContext'

function init(): void {
  $(() => {
    initFooter()

    const themeManager = new ThemeManager();
    themeManager.initThemeSelector();

    AppContext.getInstance().router().start()

    $(document).on('click', '#btnHome', function (e) {
      e.preventDefault();
      AppContext.getInstance().router().navigate('dashboard');
    });
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
