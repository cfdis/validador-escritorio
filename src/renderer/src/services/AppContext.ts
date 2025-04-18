import { routes } from "../routes/Router";
import { ApiService } from "./ApiService";
import { RouterService } from "./RouterService";
import { SpinnerService } from "./SpinnerService";
import { UserService } from "./UserService";
import { QrService } from "./QrService";

export class AppContext {
    private static instance: AppContext | null = null;
    private apiService: ApiService;
    private routerService: RouterService;
    private spinnerService: SpinnerService;
    private userService: UserService;
    private qrService: QrService;

    private constructor() {
        this.spinnerService = new SpinnerService();
        this.apiService = new ApiService();
        this.userService = new UserService(this.apiService, this.spinnerService);
        this.routerService = new RouterService(this.userService, this.apiService, routes);
        this.qrService = new QrService();
    }

    public static getInstance(): AppContext {
        if (this.instance === null) {
            this.instance = new AppContext();
        }
        return this.instance;
    }

    public api(): ApiService {
        return this.apiService;
    }

    public router(): RouterService {
        return this.routerService;
    }

    public ss(): SpinnerService {
        return this.spinnerService;
    }

    public us(): UserService {
        return this.userService;
    }

    public qr(): QrService {
        return this.qrService;
    }
}