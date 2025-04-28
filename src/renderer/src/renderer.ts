import '../assets/main.css'
import $ from 'jquery'
import { ThemeManager } from './utils/ThemeManager'
import { SpinnerService } from './services/SpinnerService'
import { FrontApiService } from './services/FrontApiService'
import { FrontUserService } from './services/FrontUserService'
import { RouterService } from './services/RouterService'
import { QrService } from './services/QrService'
import { RouteDeps } from './utils/Types'
import { ToastService } from './services/ToastService'
import { PdfService } from './services/PdfService'
import { ApiErrorDetails } from './utils/Interfaces'
import { ValidacionService } from './services/ValidacionService'

let deps: any = null;

function init(): void {
  $(() => {
    initRouter()
    initFooter()

    const themeManager = new ThemeManager();
    themeManager.initThemeSelector();

    $(document).on('click', '#scanFromCamera', () => deps.rs.navigate('camera'));
    $(document).on('click', '#scanFromImage', () => deps.rs.navigate('scanFile', { type: 'image' }));
    $(document).on('click', '#scanFromPdf', () => deps.rs.navigate('scanFile', { type: 'pdf' }));
    $(document).on('click', '#scanFromXml', () => deps.rs.navigate('scanFile', { type: 'xml' }));
    // $('#reportesBtn').on('click', () => deps.rs.navigate('reportes'));
    $(document).on('click', '#historialBtn', () => deps.rs.navigate('historial'));

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

    $('#navDropdownButton').on('click', () => toggleNavigator());
    $(document).on('click', (e) => {
      if (!$(e.target).closest('#navDropdownButton').length) {
        $('#navDropdownMenu').hide();
      }
    });
  })
}

function initRouter(): void {
  let spinnerService = new SpinnerService();
  let toastService = new ToastService();
  let apiService = new FrontApiService(toastService);
  let userService = new FrontUserService(toastService);
  let pdfService = new PdfService();
  let qrService = new QrService(pdfService);
  let validacionService = new ValidacionService(toastService, spinnerService)

  let routerService = new RouterService();
  deps = {
    api: apiService,
    us: userService,
    ss: spinnerService,
    qr: qrService,
    ts: toastService,
    rs: routerService,
    vs: validacionService,
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

function toggleNavigator() {
  const navigator = $('#navDropdownMenu');
  navigator.toggle();
}

function logout(e) {
  e.preventDefault();
  deps.us.logout().then(() => {
    toggleMenu();
    $('#userName').text('Usuario');
    $('#userEmail').text('');
    $('#userAvatar').attr('src', 'assets/img/default-user.jpg');
    $('#userMenu').hide();

    deps.rs.navigate('login');
  }).catch((error: ApiErrorDetails) => {
    deps.us.handleError(error);
  });
}

init()
