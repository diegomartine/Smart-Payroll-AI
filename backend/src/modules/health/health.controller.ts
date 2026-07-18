import { Request, Response } from "express";
import { HealthService } from "./health.service";

const healthService = new HealthService();

export class HealthController {

    getHealth(req: Request, res: Response) {

        return res.status(200).json(
            healthService.getStatus()
        );

    }

}