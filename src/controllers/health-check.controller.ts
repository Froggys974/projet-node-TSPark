import { Request, Response, Router } from "express";

export class HealthCheckController {

    async checkHealth(req: Request, res: Response): Promise<void> {
        res.status(204).end();
    }

    buildRouter() : Router{
        const router = Router();
        router.get("/", this.checkHealth.bind(this));
        return router;
    }
    
}
