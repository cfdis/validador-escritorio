import { RouteDeps, Routes } from '../utils/Types';
import { DashboardView } from '../ts/DashboardView';
import { LoginView } from '../ts/LoginView';
import { QrScanCameraView } from '../ts/QrScanCameraView';
import { QrScanImageView } from '../ts/QrScanImageView';

export const routes: Routes = {
    dashboard: (deps: RouteDeps) => new DashboardView(deps.api, deps.us, deps.rs!),
    login: (deps: RouteDeps) => new LoginView(deps.api, deps.us, deps.rs, deps.ss),
    camera: (deps: RouteDeps) => new QrScanCameraView(deps.qr!),
    image: (deps: RouteDeps) => new QrScanImageView(deps.qr!),
};