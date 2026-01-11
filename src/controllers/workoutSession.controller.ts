import { Request, Response, Router } from "express";
import { WorkoutSessionService, WorkoutService, WorkoutStepService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole } from "../types";

export class WorkoutSessionController {

    constructor(
        private readonly workoutSessionService: WorkoutSessionService,
        private readonly workoutService: WorkoutService,
        private readonly workoutStepService: WorkoutStepService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllWorkoutSessions(req: Request, res: Response): Promise<void> {
        try {
            const { userId, workoutId, status } = req.query;
            let sessions;

            if (userId) {
                sessions = await this.workoutSessionService.getSessionsByUser(userId as string);
            } else if (workoutId) {
                sessions = await this.workoutSessionService.getSessionsByWorkout(workoutId as string);
            } else {
                sessions = await this.workoutSessionService.getAllWorkoutSessions();
            }

            res.status(200).json(sessions);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getWorkoutSessionById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "WorkoutSession id is required" });
            return;
        }
        const session = await this.workoutSessionService.getWorkoutSessionById(req.params.id);
        if (session) {
            res.status(200).json(session);
        } else {
            res.status(404).json({ message: `WorkoutSession with id ${req.params.id} not found` });
        }
    }

    async getMyWorkoutSessions(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const sessions = await this.workoutSessionService.getSessionsByUser(userId);
            res.status(200).json(sessions);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async createWorkoutSession(req: Request, res: Response): Promise<void> {
        try {
            req.body.userId = req.user!.userId;

            const { workoutId } = req.body;
            if (!workoutId) {
                res.status(400).json({ message: "workoutId is required" });
                return;
            }

            const workout = await this.workoutService.getWorkoutById(workoutId);
            if (!workout) {
                res.status(404).json({ message: `Workout with id ${workoutId} not found` });
                return;
            }

            const session = await this.workoutSessionService.createWorkoutSession(req.body);
            res.status(201).json(session);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async startWorkoutSession(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "WorkoutSession id is required" });
                return;
            }

            const session = await this.workoutSessionService.getWorkoutSessionById(req.params.id);
            if (!session) {
                res.status(404).json({ message: `WorkoutSession with id ${req.params.id} not found` });
                return;
            }

            if (session.userId.toString() !== req.user?.userId) {
                res.status(403).json({ message: "You can only start your own sessions" });
                return;
            }

            const startedSession = await this.workoutSessionService.startSession(req.params.id);
            res.status(200).json(startedSession);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async completeWorkoutSession(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "WorkoutSession id is required" });
                return;
            }

            const session = await this.workoutSessionService.getWorkoutSessionById(req.params.id);
            if (!session) {
                res.status(404).json({ message: `WorkoutSession with id ${req.params.id} not found` });
                return;
            }

            if (session.userId.toString() !== req.user?.userId) {
                res.status(403).json({ message: "You can only complete your own sessions" });
                return;
            }

            const completedSession = await this.workoutSessionService.completeSession(req.params.id, req.body.overallFeeling);

            if (completedSession) {
                const workout = await this.workoutService.getWorkoutById(completedSession.workoutId.toString());
                const steps = await this.workoutStepService.getStepsByWorkout(completedSession.workoutId.toString());
                await this.workoutSessionService.updateCalories(req.params.id, workout, steps);
            }

            const finalSession = await this.workoutSessionService.getWorkoutSessionById(req.params.id);
            res.status(200).json(finalSession);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async abandonWorkoutSession(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "WorkoutSession id is required" });
                return;
            }

            const session = await this.workoutSessionService.getWorkoutSessionById(req.params.id);
            if (!session) {
                res.status(404).json({ message: `WorkoutSession with id ${req.params.id} not found` });
                return;
            }

            if (session.userId.toString() !== req.user?.userId) {
                res.status(403).json({ message: "You can only abandon your own sessions" });
                return;
            }

            const abandonedSession = await this.workoutSessionService.abandonSession(req.params.id);
            res.status(200).json(abandonedSession);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateWorkoutSession(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "WorkoutSession id is required" });
                return;
            }

            const session = await this.workoutSessionService.getWorkoutSessionById(req.params.id);
            if (!session) {
                res.status(404).json({ message: `WorkoutSession with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN && session.userId.toString() !== req.user?.userId) {
                res.status(403).json({ message: "You can only update your own sessions" });
                return;
            }

            const updatedSession = await this.workoutSessionService.updateWorkoutSession(req.params.id, req.body);
            res.status(200).json(updatedSession);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteWorkoutSession(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "WorkoutSession id is required" });
                return;
            }

            const session = await this.workoutSessionService.getWorkoutSessionById(req.params.id);
            if (!session) {
                res.status(404).json({ message: `WorkoutSession with id ${req.params.id} not found` });
                return;
            }

            await this.workoutSessionService.deleteWorkoutSession(req.params.id);
            res.status(204).end();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.getAllWorkoutSessions.bind(this)
        );
        router.get("/me",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.getMyWorkoutSessions.bind(this)
        );
        router.get("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.getWorkoutSessionById.bind(this)
        );

        router.post("/",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.createWorkoutSession.bind(this)
        );
        router.post("/:id/start",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.startWorkoutSession.bind(this)
        );
        router.post("/:id/complete",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.completeWorkoutSession.bind(this)
        );
        router.post("/:id/abandon",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.abandonWorkoutSession.bind(this)
        );

        router.put("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.updateWorkoutSession.bind(this)
        );
        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.deleteWorkoutSession.bind(this)
        );

        return router;
    }
}
