import { Request, Response, Router } from "express";
import { ChallengeService } from "../services";

export class ChallengeController {

    constructor(private readonly challengeService: ChallengeService) {}

    async getAllChallenges(req: Request, res: Response): Promise<void> {
        const challenges = await this.challengeService.getAllChallenges();
        res.status(200).json(challenges);
    }

    async getChallengeById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Challenge id is required" });
            return;
        }
        const challenge = await this.challengeService.getChallengeById(req.params.id);
        if (challenge) {
            res.status(200).json(challenge);
        } else {
            res.status(404).json({ message: `Challenge with id ${req.params.id} not found` });
        }
    }

    async createChallenge(req: Request, res: Response): Promise<void> {
        const challenge = await this.challengeService.createChallenge(req.body);
        res.status(201).json(challenge);
    }

    async updateChallenge(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Challenge id is required" });
            return;
        }
        const challenge = await this.challengeService.updateChallenge(req.params.id, req.body);
        if (challenge) {
            res.status(200).json(challenge);
        } else {
            res.status(404).json({ message: `Challenge with id ${req.params.id} not found` });
        }
    }

    async deleteChallenge(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Challenge id is required" });
            return;
        }
        const challenge = await this.challengeService.getChallengeById(req.params.id);
        if (!challenge) {
            res.status(404).json({ message: `Challenge with id ${req.params.id} not found` });
            return;
        }
        await this.challengeService.deleteChallenge(req.params.id);
        res.status(204).end();
    }

    buildRouter() : Router{
        const router = Router();
        router.get("/", this.getAllChallenges.bind(this));
        router.get("/:id", this.getChallengeById.bind(this));
        router.post("/", this.createChallenge.bind(this));
        router.put("/:id", this.updateChallenge.bind(this));
        router.delete("/:id", this.deleteChallenge.bind(this));
        return router;
    }

}
