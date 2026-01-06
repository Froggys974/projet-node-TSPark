import { Request, Response, Router } from "express";
import { GymOwnerService, ChallengeParticipationService } from "../services";

export class ChallengeParticipationController {

    constructor(private challengeParticipationService: ChallengeParticipationService, private gymOwnerService: GymOwnerService) {}

    async getAllChallengeParticipations(req: Request, res: Response): Promise<void> {
        const challengeParticipations = await this.challengeParticipationService.getAllChallengeParticipations();
        res.status(200).json(challengeParticipations);
    }

    async getChallengeParticipationById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ChallengeParticipation id is required" });
            return;
        }
        const challengeParticipation = await this.challengeParticipationService.getChallengeParticipationById(req.params.id);
        if (challengeParticipation) {
            res.status(200).json(challengeParticipation);
        } else {
            res.status(404).json({ message: `ChallengeParticipation with id ${req.params.id} not found` });
        }
    }

    async createChallengeParticipation(req: Request, res: Response): Promise<void> {
        const gymOwner = await this.gymOwnerService.getGymOwnerById(req.body.gymOwner);
        if (!gymOwner) {
            res.status(400).json({ message: `GymOwner with id ${req.body.gymOwner} does not exist` });
            return;
        }
        if (!req.body.startDate) {
            res.status(400).json({ message: "StartDate is required" });
            return;
        }
        const requestedDate = new Date(req.body.startDate);
        const findParticipationSameDate = await this.challengeParticipationService.getParticipationsForChallengeForDate(req.body.challengeId, requestedDate);

        if (findParticipationSameDate) {
            res.status(400).json({ message: "Une participation existe déjà pour ce défi à cette date." });
            return;
        }

        const challengeParticipation = await this.challengeParticipationService.createChallengeParticipation(req.body);
        res.status(201).json(challengeParticipation);
    }

    async updateChallengeParticipation(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ChallengeParticipation id is required" });
            return;
        }
        const challengeParticipation = await this.challengeParticipationService.updateChallengeParticipation(req.params.id, req.body);
        if (challengeParticipation) {
            res.status(200).json(challengeParticipation);
        } else {
            res.status(404).json({ message: `ChallengeParticipation with id ${req.params.id} not found` });
        }
    }

    async deleteChallengeParticipation(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "ChallengeParticipation id is required" });
            return;
        }
        const challengeParticipation = await this.challengeParticipationService.getChallengeParticipationById(req.params.id);
        if (!challengeParticipation) {
            res.status(404).json({ message: `ChallengeParticipation with id ${req.params.id} not found` });
            return;
        }
        await this.challengeParticipationService.deleteChallengeParticipation(req.params.id);
        res.status(204).end();
    }

    buildRouter() : Router{
        const router = Router();
        router.get("/", this.getAllChallengeParticipations.bind(this));
        router.get("/:id", this.getChallengeParticipationById.bind(this));
        router.post("/", this.createChallengeParticipation.bind(this));
        router.put("/:id", this.updateChallengeParticipation.bind(this));
        router.delete("/:id", this.deleteChallengeParticipation.bind(this));
        return router;
    }

}
