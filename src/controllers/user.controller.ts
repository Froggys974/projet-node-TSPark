import { Request, Response, Router } from "express";
import { UserService, ChallengeParticipationService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole } from "../types";

export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly challengeParticipationService: ChallengeParticipationService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllUsers(req: Request, res: Response): Promise<void> {
        const users = await this.userService.getAllUsers();
        res.status(200).json(users);
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "User id is required" });
            return;
        }
        const user = await this.userService.getUserById(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: `User with id ${req.params.id} not found` });
        }
    }

    async createUser(req: Request, res: Response): Promise<void> {
        const user = await this.userService.createUser(req.body);
        res.status(201).json(user);
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "User id is required" });
            return;
        }
        const user = await this.userService.updateUser(req.params.id, req.body);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: `User with id ${req.params.id} not found` });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "User id is required" });
            return;
        }
        const user = await this.userService.getUserById(req.params.id);
        if (!user) {
            res.status(404).json({ message: `User with id ${req.params.id} not found` });
            return;
        }
        await this.userService.deleteUser(req.params.id);
        res.status(204).end();
    }

    async getUserParticipations(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "User id is required" });
            return;
        }
        const user = await this.userService.getUserById(req.params.id);
        if (!user) {
            res.status(404).json({ message: `User with id ${req.params.id} not found` });
            return;
        }
        const participations = await this.challengeParticipationService.getParticipationsByUser(user._id.toString());
        res.status(200).json(participations);
    }

    async deactivateUser(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "User id is required" });
            return;
        }
        const user = await this.userService.getUserById(req.params.id);
        if (!user) {
            res.status(404).json({ message: `User with id ${req.params.id} not found` });
            return;
        }
        await this.userService.updateUser(req.params.id, { isActive: false });
        res.status(200).json({ message: `User with id ${req.params.id} has been deactivated` });
    }

    async activateUser(req: Request, res: Response): Promise<void> {
        if (!req.params.id) {
            res.status(400).json({ message: "User id is required" });
            return;
        }
        const user = await this.userService.getUserById(req.params.id);
        if (!user) {
            res.status(404).json({ message: `User with id ${req.params.id} not found` });
            return;
        }
        await this.userService.updateUser(req.params.id, { isActive: true });
        res.status(200).json({ message: `User with id ${req.params.id} has been activated` });
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", this.authMiddleware.authorize(UserRole.ADMIN), this.getAllUsers.bind(this));
        router.get("/:id", this.authMiddleware.authorize(UserRole.ADMIN), this.getUserById.bind(this));
        router.put("/:id", this.authMiddleware.authorize(UserRole.ADMIN), this.updateUser.bind(this));
        router.delete("/:id", this.authMiddleware.authorize(UserRole.ADMIN), this.deleteUser.bind(this));
        router.post("/:id/deactivate", this.authMiddleware.authorize(UserRole.ADMIN), this.deactivateUser.bind(this));
        router.post("/:id/activate", this.authMiddleware.authorize(UserRole.ADMIN), this.activateUser.bind(this));
        router.get("/:id/participations", this.authMiddleware.authorize(UserRole.USER, UserRole.ADMIN), this.getUserParticipations.bind(this));
        router.post("/", this.authMiddleware.authorize(UserRole.ADMIN), this.createUser.bind(this));

        return router;
    }
}
