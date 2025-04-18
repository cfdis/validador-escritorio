import { init as error404Init } from '../ts/404';
import { init as loginInit } from '../ts/login';
import { init as offlineInit } from '../ts/offline';
import { init as dashboardInit } from '../ts/dashboard';
import { init as cameraInit } from '../ts/camera';
import { init as imageInit } from '../ts/image';

export const routes = {
    404: error404Init,
    login: loginInit,
    dashboard: dashboardInit,
    offline: offlineInit,
    camera: cameraInit,
    image: imageInit,
}