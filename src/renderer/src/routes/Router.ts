import { RouteDeps, Routes } from '../utils/Types';
import { DashboardView } from '../ts/DashboardView';
import { LoginView } from '../ts/LoginView';
import { QrScanCameraView } from '../ts/QrScanCameraView';
import { QrScanImageView } from '../ts/QrScanImageView';
import { QrScanPdfView } from '../ts/QrScanPdfView';

export const routes: Routes = {
    dashboard: (deps: RouteDeps) => new DashboardView(deps.rs!),
    login: (deps: RouteDeps) => new LoginView(deps.us, deps.rs, deps.ss, deps.ts),
    camera: (deps: RouteDeps) => new QrScanCameraView(deps.qr!, deps.ts!),
    image: (deps: RouteDeps) => new QrScanImageView(deps.qr!, deps.ts!),
    pdf: (deps: RouteDeps) => new QrScanPdfView(deps.qr!, deps.ts!),
};