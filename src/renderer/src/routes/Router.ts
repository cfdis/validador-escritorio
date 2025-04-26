import { RouteDeps, Routes } from '../utils/Types';
import { DashboardView } from '../ts/DashboardView';
import { LoginView } from '../ts/LoginView';
import { QrScanCameraView } from '../ts/QrScanCameraView';
import { QrScanFileView } from '../ts/QrScanFileView';
import { HistorialView } from '../ts/HistorialView';

export const routes: Routes = {
    dashboard: (deps: RouteDeps) => new DashboardView(deps.rs!),
    login: (deps: RouteDeps) => new LoginView(deps.us, deps.rs!, deps.ss!, deps.ts!),
    camera: (deps: RouteDeps) => new QrScanCameraView(deps.qr!, deps.ts!, deps.vs!),
    scanFile: (deps: RouteDeps) => new QrScanFileView(deps.qr!, deps.ts!, deps.ss!, deps.vs!),
    historial: (deps: RouteDeps) => new HistorialView(deps.ss!, deps.vs!),
};