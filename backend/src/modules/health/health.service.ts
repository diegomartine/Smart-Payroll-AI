import { APP } from "../../shared/constants/app.constants";

export class HealthService {

    getStatus() {
        return {
            status: "ok",
            service: APP.NAME,
            version: APP.VERSION,
            timestamp: new Date().toISOString()
        };
    }

}