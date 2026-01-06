import { Request, Response, Router } from "express";
import { ExerciseTypeService } from "../services";

export class ExerciseTypeController {

    constructor(private readonly exerciseTypeService: ExerciseTypeService) {}

    async getAllExerciseTypes(req: Request, res: Response): Promise<void> {
        const exerciseTypes = await this.exerciseTypeService.getAllExerciseTypes();
        res.status(200).json(exerciseTypes);
    }

    async getExerciseTypeById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ExerciseType id is required" });
            return;
        }
        const exerciseType = await this.exerciseTypeService.getExerciseTypeById(req.params.id);
        if (exerciseType) {
            res.status(200).json(exerciseType);
        } else {
            res.status(404).json({ message: `ExerciseType with id ${req.params.id} not found` });
        }
    }

    async createExerciseType(req: Request, res: Response): Promise<void> {
        const exerciseType = await this.exerciseTypeService.createExerciseType(req.body);
        res.status(201).json(exerciseType);
    }

    async updateExerciseType(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ExerciseType id is required" });
            return;
        }
        const exerciseType = await this.exerciseTypeService.updateExerciseType(req.params.id, req.body);
        if (exerciseType) {
            res.status(200).json(exerciseType);
        } else {
            res.status(404).json({ message: `ExerciseType with id ${req.params.id} not found` });
        }
    }

    async deleteExerciseType(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ExerciseType id is required" });
            return;
        }
        const exerciseType = await this.exerciseTypeService.getExerciseTypeById(req.params.id);
        if (!exerciseType) {
            res.status(404).json({ message: `ExerciseType with id ${req.params.id} not found` });
            return;
        }
        await this.exerciseTypeService.deleteExerciseType(req.params.id);
        res.status(204).end();
    }

    buildRouter() : Router{
        const router = Router();
        router.get("/", this.getAllExerciseTypes.bind(this));
        router.get("/:id", this.getExerciseTypeById.bind(this));
        router.post("/", this.createExerciseType.bind(this));
        router.put("/:id", this.updateExerciseType.bind(this));
        router.delete("/:id", this.deleteExerciseType.bind(this));
        return router;
    }

}
