import '../assets/main.css'
import $ from 'jquery'
import { ThemeManager } from './utils/ThemeManager'
import { SpinnerService } from './services/SpinnerService'
import { ApiService } from './services/ApiService'
import { UserService } from './services/UserService'
import { RouterService } from './services/RouterService'
import { QrService } from './services/QrService'
import { RouteDeps } from './utils/Types'

let deps: any = null;

function init(): void {
  $(() => {
    initRouter()
    initFooter()

    const themeManager = new ThemeManager();
    themeManager.initThemeSelector();

    // AppContext.getInstance().router().start()

    $(document).on('click', '.btn-home, #retryConection', function (e) {
      e.preventDefault();
      // const vistaActual = AppContext.getInstance().router().getCurrentView();
      const vistaActual = deps.rs.getCurrentView();
      if (vistaActual !== 'dashboard' && vistaActual !== 'login') {
        // AppContext.getInstance().router().navigate('dashboard');
        deps.rs.navigate('dashboard');
      }
    });

    $('#userButton').on('click', () => toggleMenu());
    $('#logoutButton').on('click', (e) => logout(e));

    $(document).on('click', (e) => {
      if (!$(e.target).closest('#userMenu').length) {
        $('#userDropdown').hide();
      }
    });
  })
}

function initRouter(): void {
  let spinnerService = new SpinnerService();
  let apiService = new ApiService();
  let userService = new UserService(apiService, spinnerService);
  let qrService = new QrService();

  let routerService = new RouterService();
  deps = {
    api: apiService,
    us: userService,
    ss: spinnerService,
    qr: qrService,
    rs: routerService,
  }
  routerService.init(deps as RouteDeps);
}

function initFooter(): void {
  const versions = window.electron.process.versions
  const information = $('#info')
  information.html(
    `<small>© 2025 - Validador CFDI - This app is using Chrome (v${versions.chrome}), Node.js (v${versions.node}), and Electron (v${versions.electron})</small>`
  )
}

function toggleMenu() {
  const menu = $('#userDropdown');
  menu.toggle();
}

async function logout(e) {
  e.preventDefault();
  await deps.us.logout();
  deps.rs.navigate('login');
}

init()
