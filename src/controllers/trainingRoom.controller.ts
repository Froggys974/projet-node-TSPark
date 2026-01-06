import { Request, Response, Router } from "express";
import { TrainingRoomService } from "../services";

export class TrainingRoomController {

    constructor(private readonly trainingRoomService: TrainingRoomService) {}

    async getAllTrainingRooms(req: Request, res: Response): Promise<void> {
        const trainingRooms = await this.trainingRoomService.getAllTrainingRooms();
        res.status(200).json(trainingRooms);
    }

    async getTrainingRoomById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "TrainingRoom id is required" });
            return;
        }
        const trainingRoom = await this.trainingRoomService.getTrainingRoomById(req.params.id);
        if (trainingRoom) {
            res.status(200).json(trainingRoom);
        } else {
            res.status(404).json({ message: `TrainingRoom with id ${req.params.id} not found` });
        }
    }

    async createTrainingRoom(req: Request, res: Response): Promise<void> {
        const trainingRoom = await this.trainingRoomService.createTrainingRoom(req.body);
        res.status(201).json(trainingRoom);
    }

    async updateTrainingRoom(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "TrainingRoom id is required" });
            return;
        }
        const trainingRoom = await this.trainingRoomService.updateTrainingRoom(req.params.id, req.body);
        if (trainingRoom) {
            res.status(200).json(trainingRoom);
        } else {
            res.status(404).json({ message: `TrainingRoom with id ${req.params.id} not found` });
        }
    }

    async deleteTrainingRoom(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "TrainingRoom id is required" });
            return;
        }
        const trainingRoom = await this.trainingRoomService.getTrainingRoomById(req.params.id);
        if (!trainingRoom) {
            res.status(404).json({ message: `TrainingRoom with id ${req.params.id} not found` });
            return;
        }
        await this.trainingRoomService.deleteTrainingRoom(req.params.id);
        res.status(204).end();
    }

    async approveTrainingRoom(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "TrainingRoom id is required" });
            return;
        }
        const trainingRoom = await this.trainingRoomService.approveTrainingRoom(req.params.id);
        if (trainingRoom) {
            res.status(200).json(trainingRoom);
        } else {
            res.status(404).json({ message: `TrainingRoom with id ${req.params.id} not found` });
        }
    }

    buildRouter() : Router{
        const router = Router();
        router.get("/", this.getAllTrainingRooms.bind(this));
        router.get("/:id", this.getTrainingRoomById.bind(this));
        router.post("/", this.createTrainingRoom.bind(this));
        router.put("/:id", this.updateTrainingRoom.bind(this));
        router.delete("/:id", this.deleteTrainingRoom.bind(this));
        router.post("/:id/approve", this.approveTrainingRoom.bind(this));
        return router;
    }

}
