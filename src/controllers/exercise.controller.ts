import { Request, Response, Router } from "express";
import { ExerciseService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole, CreatorType } from "../types";

export class ExerciseController {

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllExercises(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId, exerciseType, difficulty, visibility, status } = req.query;

            if (categoryId || exerciseType || difficulty || visibility || status) {
                const exercises = await this.exerciseService.getExercisesWithFilters({
                    categoryId: categoryId as string,
                    exerciseType: exerciseType as string,
                    difficulty: difficulty as string,
                    visibility: visibility as string,
                    status: status as string
                });
                res.status(200).json(exercises);
            } else {
                const exercises = await this.exerciseService.getAllExercises();
                res.status(200).json(exercises);
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getExerciseById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Exercise id is required" });
            return;
        }
        const exercise = await this.exerciseService.getExerciseById(req.params.id);
        if (exercise) {
            res.status(200).json(exercise);
        } else {
            res.status(404).json({ message: `Exercise with id ${req.params.id} not found` });
        }
    }

    async createExercise(req: Request, res: Response): Promise<void> {
        try {
            req.body.creatorId = req.user!.userId;
            req.body.creatorType = CreatorType.ADMIN;

            const exercise = await this.exerciseService.createExercise(req.body);
            res.status(201).json(exercise);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateExercise(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Exercise id is required" });
                return;
            }

            const exercise = await this.exerciseService.getExerciseById(req.params.id);
            if (!exercise) {
                res.status(404).json({ message: `Exercise with id ${req.params.id} not found` });
                return;
            }

            const updatedExercise = await this.exerciseService.updateExercise(req.params.id, req.body);
            res.status(200).json(updatedExercise);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteExercise(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Exercise id is required" });
                return;
            }

            const exercise = await this.exerciseService.getExerciseById(req.params.id);
            if (!exercise) {
                res.status(404).json({ message: `Exercise with id ${req.params.id} not found` });
                return;
            }

            await this.exerciseService.deleteExercise(req.params.id);
            res.status(204).end();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", this.getAllExercises.bind(this));
        router.get("/:id", this.getExerciseById.bind(this));

        router.post("/",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.createExercise.bind(this)
        );
        router.put("/:id",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.updateExercise.bind(this)
        );
        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.deleteExercise.bind(this)
        );

        return router;
    }
}
