import { Request, Response, Router } from "express";
import { GymService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole, GymStatus } from "../types";

export class GymController {

    constructor(
        private readonly gymService: GymService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllGyms(req: Request, res: Response): Promise<void> {
        try {
            const { status, ownerId } = req.query;
            let gyms;

            if (status) {
                gyms = await this.gymService.getGymsByStatus(status as GymStatus);
            } else if (ownerId) {
                gyms = await this.gymService.getGymsByOwner(ownerId as string);
            } else {
                gyms = await this.gymService.getAllGyms();
            }

            res.status(200).json(gyms);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getGymById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Gym id is required" });
                return;
            }
            const gym = await this.gymService.getGymById(req.params.id);
            if (gym) {
                res.status(200).json(gym);
            } else {
                res.status(404).json({ message: `Gym with id ${req.params.id} not found` });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async createGym(req: Request, res: Response): Promise<void> {
        try {
            if (req.user?.role === UserRole.GYM_OWNER) {
                req.body.ownerId = req.user.userId;
            }

            const gym = await this.gymService.createGym(req.body);
            res.status(201).json(gym);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateGym(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Gym id is required" });
                return;
            }

            const gym = await this.gymService.getGymById(req.params.id);
            if (!gym) {
                res.status(404).json({ message: `Gym with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role === UserRole.GYM_OWNER) {
                if (gym.ownerId.toString() !== req.user.userId) {
                    res.status(403).json({ message: "You can only update your own gyms" });
                    return;
                }
            }

            const updatedGym = await this.gymService.updateGym(req.params.id, req.body);
            res.status(200).json(updatedGym);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteGym(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Gym id is required" });
                return;
            }
            const gym = await this.gymService.getGymById(req.params.id);
            if (!gym) {
                res.status(404).json({ message: `Gym with id ${req.params.id} not found` });
                return;
            }
            await this.gymService.deleteGym(req.params.id);
            res.status(204).end();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async approveGym(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Gym id is required" });
                return;
            }
            const gym = await this.gymService.approveGym(req.params.id, req.user!.userId);
            if (gym) {
                res.status(200).json(gym);
            } else {
                res.status(404).json({ message: `Gym with id ${req.params.id} not found` });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async rejectGym(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Gym id is required" });
                return;
            }
            const gym = await this.gymService.rejectGym(req.params.id, req.user!.userId);
            if (gym) {
                res.status(200).json(gym);
            } else {
                res.status(404).json({ message: `Gym with id ${req.params.id} not found` });
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", this.getAllGyms.bind(this));
        router.get("/:id", this.getGymById.bind(this));

        router.post("/",
            this.authMiddleware.authorize(UserRole.GYM_OWNER, UserRole.ADMIN),
            this.createGym.bind(this)
        );

        router.put("/:id",
            this.authMiddleware.authorize(UserRole.GYM_OWNER, UserRole.ADMIN),
            this.updateGym.bind(this)
        );

        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.deleteGym.bind(this)
        );

        router.post("/:id/approve",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.approveGym.bind(this)
        );

        router.post("/:id/reject",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.rejectGym.bind(this)
        );

        return router;
    }
}
