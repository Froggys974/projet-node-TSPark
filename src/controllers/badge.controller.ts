import { Request, Response, Router } from "express";
import { BadgeService } from "../services";

export class BadgeController {

    constructor(private readonly badgeService: BadgeService) {}

    async getAllBadges(req: Request, res: Response): Promise<void> {
        const badges = await this.badgeService.getAllBadges();
        res.status(200).json(badges);
    }

    async getBadgeById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Badge id is required" });
            return;
        }
        const badge = await this.badgeService.getBadgeById(req.params.id);
        if (badge) {
            res.status(200).json(badge);
        } else {
            res.status(404).json({ message: `Badge with id ${req.params.id} not found` });
        }
    }

    async createBadge(req: Request, res: Response): Promise<void> {
        const badge = await this.badgeService.createBadge(req.body);
        res.status(201).json(badge);
    }

    async updateBadge(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Badge id is required" });
            return;
        }
        const badge = await this.badgeService.updateBadge(req.params.id, req.body);
        if (badge) {
            res.status(200).json(badge);
        } else {
            res.status(404).json({ message: `Badge with id ${req.params.id} not found` });
        }
    }

    async deleteBadge(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "Badge id is required" });
            return;
        }
        const badge = await this.badgeService.getBadgeById(req.params.id);
        if (!badge) {
            res.status(404).json({ message: `Badge with id ${req.params.id} not found` });
            return;
        }
        await this.badgeService.deleteBadge(req.params.id);
        res.status(204).end();
    }

    buildRouter() : Router{
        const router = Router();
        router.get("/", this.getAllBadges.bind(this));
        router.get("/:id", this.getBadgeById.bind(this));
        router.post("/", this.createBadge.bind(this));
        router.put("/:id", this.updateBadge.bind(this));
        router.delete("/:id", this.deleteBadge.bind(this));
        return router;
    }

}
