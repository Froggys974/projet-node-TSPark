import { Request, Response, Router } from "express";
import { EquipmentService, GymService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole } from "../types";

export class EquipmentController {

    constructor(
        private readonly equipmentService: EquipmentService,
        private readonly gymService: GymService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllEquipment(req: Request, res: Response): Promise<void> {
        try {
            const { gymId, categoryId } = req.query;
            let equipment;

            if (gymId && categoryId) {
                equipment = await this.equipmentService.getEquipmentByGymAndCategory(gymId as string, categoryId as string);
            } else if (gymId) {
                equipment = await this.equipmentService.getEquipmentByGym(gymId as string);
            } else if (categoryId) {
                equipment = await this.equipmentService.getEquipmentByCategory(categoryId as string);
            } else {
                equipment = await this.equipmentService.getAllEquipment();
            }

            res.status(200).json(equipment);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getEquipmentById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Equipment id is required" });
            return;
        }
        const equipment = await this.equipmentService.getEquipmentById(req.params.id);
        if (equipment) {
            res.status(200).json(equipment);
        } else {
            res.status(404).json({ message: `Equipment with id ${req.params.id} not found` });
        }
    }

    async createEquipment(req: Request, res: Response): Promise<void> {
        try {
            const { gymId } = req.body;

            if (!gymId) {
                res.status(400).json({ message: "gymId is required" });
                return;
            }

            const gym = await this.gymService.getGymById(gymId);
            if (!gym) {
                res.status(404).json({ message: `Gym with id ${gymId} not found` });
                return;
            }

            if (req.user?.role === UserRole.GYM_OWNER) {
                if (gym.ownerId.toString() !== req.user.userId) {
                    res.status(403).json({ message: "You can only add equipment to your own gyms" });
                    return;
                }
            }

            const equipment = await this.equipmentService.createEquipment(req.body);
            res.status(201).json(equipment);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateEquipment(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Equipment id is required" });
                return;
            }

            const equipment = await this.equipmentService.getEquipmentById(req.params.id);
            if (!equipment) {
                res.status(404).json({ message: `Equipment with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role === UserRole.GYM_OWNER) {
                const gym = await this.gymService.getGymById(equipment.gymId.toString());
                if (!gym || gym.ownerId.toString() !== req.user.userId) {
                    res.status(403).json({ message: "You can only update equipment in your own gyms" });
                    return;
                }
            }

            const updatedEquipment = await this.equipmentService.updateEquipment(req.params.id, req.body);
            res.status(200).json(updatedEquipment);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteEquipment(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Equipment id is required" });
                return;
            }

            const equipment = await this.equipmentService.getEquipmentById(req.params.id);
            if (!equipment) {
                res.status(404).json({ message: `Equipment with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role === UserRole.GYM_OWNER) {
                const gym = await this.gymService.getGymById(equipment.gymId.toString());
                if (!gym || gym.ownerId.toString() !== req.user.userId) {
                    res.status(403).json({ message: "You can only delete equipment in your own gyms" });
                    return;
                }
            }

            await this.equipmentService.deleteEquipment(req.params.id);
            res.status(204).end();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", this.getAllEquipment.bind(this));
        router.get("/:id", this.getEquipmentById.bind(this));

        router.post("/",
            this.authMiddleware.authorize(UserRole.GYM_OWNER, UserRole.ADMIN),
            this.createEquipment.bind(this)
        );
        router.put("/:id",
            this.authMiddleware.authorize(UserRole.GYM_OWNER, UserRole.ADMIN),
            this.updateEquipment.bind(this)
        );
        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.GYM_OWNER, UserRole.ADMIN),
            this.deleteEquipment.bind(this)
        );

        return router;
    }
}
