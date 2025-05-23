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
    $(document).on('click', '#suscripcionButton', () => deps.rs.navigate('suscripcion'));
    // $('#reportesBtn').on('click', () => deps.rs.navigate('reportes'));
    $(document).on('click', '#historialBtn', () => deps.rs.navigate('historial'));

    $(document).on('click', '.btn-home, #retryConection', function (e) {
      e.preventDefault();
      const vistaActual = deps.rs.getCurrentView();
      if (vistaActual !== 'dashboard' && vistaActual !== 'login') {
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

    $('#userDropdown').on('click', 'button, a', () => {
      $('#userDropdown').hide();
    });

    $('#hamburgerButton').on('click', () => {
      $('#mainNav').toggleClass('hidden');
    });

    $(document).on('click', (e) => {
      if (window.innerWidth < 768 &&
        !$(e.target).closest('#hamburgerButton').length &&
        !$(e.target).closest('#mainNav').length
      ) {
        $('#mainNav').addClass('hidden');
      }
    });

    $(window).on('resize', handleResize);

    handleResize();
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
  window.app.getVersion().then((appVersion: string) => {
    const information = $('#info')
    information.html(
      `<small>© 2025 - Validador CFDI (v${appVersion}) - This app is using Chrome (v${versions.chrome}), Node.js (v${versions.node}), and Electron (v${versions.electron})</small>`
    )
  });
}

function toggleMenu() {
  const menu = $('#userDropdown');
  menu.toggle();
}

function handleResize() {
  if (window.innerWidth >= 768) { // md breakpoint en Tailwind
    $('#mainNav').removeClass('hidden');
  } else {
    $('#mainNav').addClass('hidden');
  }
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
