import { Request, Response, Router } from "express";
import { GymOwnerService, ChallengeParticipationService } from "../services";

export class GymOwnerController {

    constructor(private readonly gymOwnerService: GymOwnerService, private readonly challengeParticipationService: ChallengeParticipationService) {}

    async getAllGymOwners(req: Request, res: Response): Promise<void> {
        const gymOwners = await this.gymOwnerService.getAllGymOwners();
        res.status(200).json(gymOwners);
    }

    async getGymOwnerById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "GymOwner id is required" });
            return;
        }
        const gymOwner = await this.gymOwnerService.getGymOwnerById(req.params.id);
        if (gymOwner) {
            res.status(200).json(gymOwner);
        } else {
            res.status(404).json({ message: `GymOwner with id ${req.params.id} not found` });
        }
    }

    async createGymOwner(req: Request, res: Response): Promise<void> {
        const gymOwner = await this.gymOwnerService.createGymOwner(req.body);
        res.status(201).json(gymOwner);
    }

    async updateGymOwner(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "GymOwner id is required" });
            return;
        }
        const gymOwner = await this.gymOwnerService.updateGymOwner(req.params.id, req.body);
        if (gymOwner) {
            res.status(200).json(gymOwner);
        } else {
            res.status(404).json({ message: `GymOwner with id ${req.params.id} not found` });
        }
    }

    async deleteGymOwner(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "GymOwner id is required" });
            return;
        }
        const gymOwner = await this.gymOwnerService.getGymOwnerById(req.params.id);
        if (!gymOwner) {
            res.status(404).json({ message: `GymOwner with id ${req.params.id} not found` });
            return;
        }
        await this.gymOwnerService.deleteGymOwner(req.params.id);
        res.status(204).end();
    }

    async getGymOwnerParticipations(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "GymOwner id is required" });
            return;
        }
        const gymOwner = await this.gymOwnerService.getGymOwnerById(req.params.id);
        if (!gymOwner) {
            res.status(404).json({ message: `GymOwner with id ${req.params.id} not found` });
            return;
        }
        const participations = await this.challengeParticipationService.getParticipationsForGymOwner(gymOwner._id.toString());
        res.status(200).json(participations);
    }


    buildRouter() : Router{
        const router = Router();
        router.get("/", this.getAllGymOwners.bind(this));
        router.get("/:id", this.getGymOwnerById.bind(this));
        router.post("/", this.createGymOwner.bind(this));
        router.put("/:id", this.updateGymOwner.bind(this));
        router.delete("/:id", this.deleteGymOwner.bind(this));
        router.get("/:id/participations", this.getGymOwnerParticipations.bind(this));
        return router;
    }

}
