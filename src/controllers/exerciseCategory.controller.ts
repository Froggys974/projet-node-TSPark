import { Request, Response, Router } from "express";
import { ExerciseCategoryService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole } from "../types";

export class ExerciseCategoryController {

    constructor(
        private readonly exerciseCategoryService: ExerciseCategoryService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllExerciseCategories(req: Request, res: Response): Promise<void> {
        const categories = await this.exerciseCategoryService.getAllExerciseCategories();
        res.status(200).json(categories);
    }

    async getExerciseCategoryById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ExerciseCategory id is required" });
            return;
        }
        const category = await this.exerciseCategoryService.getExerciseCategoryById(req.params.id);
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: `ExerciseCategory with id ${req.params.id} not found` });
        }
    }

    async createExerciseCategory(req: Request, res: Response): Promise<void> {
        const category = await this.exerciseCategoryService.createExerciseCategory(req.body);
        res.status(201).json(category);
    }

    async updateExerciseCategory(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ExerciseCategory id is required" });
            return;
        }
        const category = await this.exerciseCategoryService.updateExerciseCategory(req.params.id, req.body);
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: `ExerciseCategory with id ${req.params.id} not found` });
        }
    }

    async deleteExerciseCategory(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ExerciseCategory id is required" });
            return;
        }
        const category = await this.exerciseCategoryService.getExerciseCategoryById(req.params.id);
        if (!category) {
            res.status(404).json({ message: `ExerciseCategory with id ${req.params.id} not found` });
            return;
        }
        await this.exerciseCategoryService.deleteExerciseCategory(req.params.id);
        res.status(204).end();
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", this.getAllExerciseCategories.bind(this));
        router.get("/:id", this.getExerciseCategoryById.bind(this));

        router.post("/",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.createExerciseCategory.bind(this)
        );
        router.put("/:id",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.updateExerciseCategory.bind(this)
        );
        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.deleteExerciseCategory.bind(this)
        );

        return router;
    }
}
