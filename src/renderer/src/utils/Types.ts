import { View } from "../interfaces/View";
import { ApiService } from "../services/ApiService";
import { QrService } from "../services/QrService";
import { RouterService } from "../services/RouterService";
import { SpinnerService } from "../services/SpinnerService";
import { ToastService } from "../services/ToastService";
import { UserService } from "../services/UserService";

export type Routes = Record<string, RouteFactory>;
export type RouteFactory = (deps: RouteDeps) => View;
export type RouteDeps = {
    api: ApiService;
    us: UserService;
    ss?: SpinnerService;
    qr?: QrService;
    ts?: ToastService;
    rs?: RouterService;
};
export type ToastType = 'info' | 'warning' | 'error' | 'success';