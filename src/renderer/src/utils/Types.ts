import { View } from "../interfaces/View";
import { FrontApiService } from "../services/FrontApiService";
import { QrService } from "../services/QrService";
import { RouterService } from "../services/RouterService";
import { SpinnerService } from "../services/SpinnerService";
import { ToastService } from "../services/ToastService";
import { FrontUserService } from "../services/FrontUserService";
import { ValidacionCfdiResponseItem } from "./Interfaces";
import { ValidacionService } from "../services/ValidacionService";

export type Routes = Record<string, RouteFactory>;
export type RouteFactory = (deps: RouteDeps) => View;
export type RouteDeps = {
    api: FrontApiService;
    us: FrontUserService;
    ss?: SpinnerService;
    qr?: QrService;
    ts?: ToastService;
    rs?: RouterService;
    vs?: ValidacionService;
};
export type ToastType = 'info' | 'warning' | 'error' | 'success';

export type QrParams = {
    id: string;
    re: string;
    rr: string;
    tt: string;
    fe: string;
    xml?: string;
}

export type ValidacionCfdiResponse = ValidacionCfdiResponseItem[];