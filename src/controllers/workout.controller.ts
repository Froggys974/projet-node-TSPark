import { Request, Response, Router } from "express";
import { WorkoutService, WorkoutStepService, GymService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole, CreatorType } from "../types";

export class WorkoutController {

    constructor(
        private readonly workoutService: WorkoutService,
        private readonly workoutStepService: WorkoutStepService,
        private readonly gymService: GymService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllWorkouts(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId, difficulty, visibility, gymId, creatorId } = req.query;

            if (categoryId || difficulty || visibility || gymId || creatorId) {
                const workouts = await this.workoutService.getWorkoutsWithFilters({
                    categoryId: categoryId as string,
                    difficulty: difficulty as string,
                    visibility: visibility as string,
                    gymId: gymId as string,
                    creatorId: creatorId as string
                });
                res.status(200).json(workouts);
            } else {
                const workouts = await this.workoutService.getAllWorkouts();
                res.status(200).json(workouts);
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getWorkoutById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Workout id is required" });
            return;
        }
        const workout = await this.workoutService.getWorkoutById(req.params.id);
        if (workout) {
            res.status(200).json(workout);
        } else {
            res.status(404).json({ message: `Workout with id ${req.params.id} not found` });
        }
    }

    async getWorkoutSteps(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Workout id is required" });
            return;
        }
        const workout = await this.workoutService.getWorkoutById(req.params.id);
        if (!workout) {
            res.status(404).json({ message: `Workout with id ${req.params.id} not found` });
            return;
        }
        const steps = await this.workoutStepService.getStepsByWorkout(req.params.id);
        res.status(200).json(steps);
    }

    async createWorkout(req: Request, res: Response): Promise<void> {
        try {
            req.body.creatorId = req.user!.userId;
            req.body.creatorType = req.user!.role === UserRole.ADMIN ? CreatorType.ADMIN : CreatorType.USER;

            // USER can only create private workouts without gym
            if (req.user?.role === UserRole.USER) {
                if (req.body.gymId) {
                    res.status(403).json({ message: "Users cannot create workouts for gyms" });
                    return;
                }
                req.body.visibility = "private";
            }

            // GYM_OWNER must specify a gym they own
            if (req.user?.role === UserRole.GYM_OWNER) {
                if (!req.body.gymId) {
                    res.status(400).json({ message: "Gym owners must specify a gymId for their workouts" });
                    return;
                }
                const gym = await this.gymService.getGymById(req.body.gymId);
                if (!gym) {
                    res.status(404).json({ message: `Gym with id ${req.body.gymId} not found` });
                    return;
                }
                if (gym.ownerId.toString() !== req.user.userId) {
                    res.status(403).json({ message: "You can only create workouts for your own gyms" });
                    return;
                }
            }

            // ADMIN can create for any gym or without gym
            if (req.user?.role === UserRole.ADMIN && req.body.gymId) {
                const gym = await this.gymService.getGymById(req.body.gymId);
                if (!gym) {
                    res.status(404).json({ message: `Gym with id ${req.body.gymId} not found` });
                    return;
                }
            }

            const workout = await this.workoutService.createWorkout(req.body);
            res.status(201).json(workout);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateWorkout(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Workout id is required" });
                return;
            }

            const workout = await this.workoutService.getWorkoutById(req.params.id);
            if (!workout) {
                res.status(404).json({ message: `Workout with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN) {
                if (workout.creatorId.toString() !== req.user?.userId) {
                    res.status(403).json({ message: "You can only update your own workouts" });
                    return;
                }
            }

            const updatedWorkout = await this.workoutService.updateWorkout(req.params.id, req.body);
            res.status(200).json(updatedWorkout);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteWorkout(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Workout id is required" });
                return;
            }

            const workout = await this.workoutService.getWorkoutById(req.params.id);
            if (!workout) {
                res.status(404).json({ message: `Workout with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN) {
                if (workout.creatorId.toString() !== req.user?.userId) {
                    res.status(403).json({ message: "You can only delete your own workouts" });
                    return;
                }
            }

            await this.workoutStepService.deleteStepsByWorkout(req.params.id);
            await this.workoutService.deleteWorkout(req.params.id);
            res.status(204).end();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", this.getAllWorkouts.bind(this));
        router.get("/:id", this.getWorkoutById.bind(this));
        router.get("/:id/steps", this.getWorkoutSteps.bind(this));

        router.post("/",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.createWorkout.bind(this)
        );
        router.put("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.updateWorkout.bind(this)
        );
        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.deleteWorkout.bind(this)
        );

        return router;
    }
}
