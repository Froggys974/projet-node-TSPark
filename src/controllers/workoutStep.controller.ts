import { Request, Response, Router } from "express";
import { WorkoutStepService, WorkoutService, EquipmentService, GymService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole } from "../types";

export class WorkoutStepController {

    constructor(
        private readonly workoutStepService: WorkoutStepService,
        private readonly workoutService: WorkoutService,
        private readonly equipmentService: EquipmentService,
        private readonly gymService: GymService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getWorkoutStepById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "WorkoutStep id is required" });
            return;
        }
        const step = await this.workoutStepService.getWorkoutStepById(req.params.id);
        if (step) {
            res.status(200).json(step);
        } else {
            res.status(404).json({ message: `WorkoutStep with id ${req.params.id} not found` });
        }
    }

    async createWorkoutStep(req: Request, res: Response): Promise<void> {
        try {
            const { workoutId, equipmentId } = req.body;

            if (!workoutId) {
                res.status(400).json({ message: "workoutId is required" });
                return;
            }

            const workout = await this.workoutService.getWorkoutById(workoutId);
            if (!workout) {
                res.status(404).json({ message: `Workout with id ${workoutId} not found` });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN) {
                if (workout.creatorId.toString() !== req.user?.userId) {
                    res.status(403).json({ message: "You can only add steps to your own workouts" });
                    return;
                }
            }

            // USER cannot use equipment in their workouts
            if (req.user?.role === UserRole.USER && equipmentId) {
                res.status(403).json({ message: "Users cannot add equipment to their workouts" });
                return;
            }

            // GYM_OWNER and ADMIN can use equipment only if workout has a gym
            if (equipmentId) {
                if (!workout.gymId) {
                    res.status(400).json({ message: "Cannot add equipment to a workout without a gym" });
                    return;
                }
                const equipment = await this.equipmentService.getEquipmentById(equipmentId);
                if (!equipment) {
                    res.status(404).json({ message: `Equipment with id ${equipmentId} not found` });
                    return;
                }
                if (equipment.gymId.toString() !== workout.gymId.toString()) {
                    res.status(400).json({ message: "Equipment must belong to the same gym as the workout" });
                    return;
                }
            }

            const step = await this.workoutStepService.createWorkoutStep(req.body);
            res.status(201).json(step);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateWorkoutStep(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "WorkoutStep id is required" });
                return;
            }

            const step = await this.workoutStepService.getWorkoutStepById(req.params.id);
            if (!step) {
                res.status(404).json({ message: `WorkoutStep with id ${req.params.id} not found` });
                return;
            }

            const workout = await this.workoutService.getWorkoutById(step.workoutId.toString());
            if (!workout) {
                res.status(404).json({ message: "Associated workout not found" });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN) {
                if (workout.creatorId.toString() !== req.user?.userId) {
                    res.status(403).json({ message: "You can only update steps of your own workouts" });
                    return;
                }
            }

            const updatedStep = await this.workoutStepService.updateWorkoutStep(req.params.id, req.body);
            res.status(200).json(updatedStep);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteWorkoutStep(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "WorkoutStep id is required" });
                return;
            }

            const step = await this.workoutStepService.getWorkoutStepById(req.params.id);
            if (!step) {
                res.status(404).json({ message: `WorkoutStep with id ${req.params.id} not found` });
                return;
            }

            const workout = await this.workoutService.getWorkoutById(step.workoutId.toString());
            if (!workout) {
                res.status(404).json({ message: "Associated workout not found" });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN) {
                if (workout.creatorId.toString() !== req.user?.userId) {
                    res.status(403).json({ message: "You can only delete steps of your own workouts" });
                    return;
                }
            }

            await this.workoutStepService.deleteWorkoutStep(req.params.id);
            res.status(204).end();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/:id", this.getWorkoutStepById.bind(this));

        router.post("/",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.createWorkoutStep.bind(this)
        );
        router.put("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.updateWorkoutStep.bind(this)
        );
        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.deleteWorkoutStep.bind(this)
        );

        return router;
    }
}
