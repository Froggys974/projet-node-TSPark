import { Request, Response, Router } from "express";
import { ChallengeService, WorkoutService, GymService } from "../services";
import { AuthMiddleware, ValidationMiddleware } from "../middlewares";
import { UserRole } from "../types";

export class ChallengeController {

    constructor(
        private readonly challengeService: ChallengeService,
        private readonly workoutService: WorkoutService,
        private readonly gymService: GymService,
        private readonly validationMiddleware: ValidationMiddleware,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllChallenges(req: Request, res: Response): Promise<void> {
        try {
            const { visibility, gymId, creatorId, workoutId, rankingType, isActive } = req.query;

            if (visibility || gymId || creatorId || workoutId || rankingType || isActive !== undefined) {
                const challenges = await this.challengeService.getChallengesWithFilters({
                    visibility: visibility as string,
                    gymId: gymId as string,
                    creatorId: creatorId as string,
                    workoutId: workoutId as string,
                    rankingType: rankingType as string,
                    isActive: isActive === "true"
                });
                res.status(200).json(challenges);
            } else {
                const challenges = await this.challengeService.getAllChallenges();
                res.status(200).json(challenges);
            }
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getChallengeById(req: Request, res: Response): Promise<void> {
        try {
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
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getActiveChallenges(req: Request, res: Response): Promise<void> {
        try {
            const challenges = await this.challengeService.getPublicActiveChallenges();
            res.status(200).json(challenges);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async createChallenge(req: Request, res: Response): Promise<void> {
        try {
            req.body.creatorId = req.user!.userId;

            const { workoutId, gymId } = req.body;

            if (!workoutId) {
                res.status(400).json({ message: "workoutId is required" });
                return;
            }

            const workout = await this.workoutService.getWorkoutById(workoutId);
            if (!workout) {
                res.status(404).json({ message: `Workout with id ${workoutId} not found` });
                return;
            }

            if (gymId) {
                const gym = await this.gymService.getGymById(gymId);
                if (!gym) {
                    res.status(404).json({ message: `Gym with id ${gymId} not found` });
                    return;
                }

                if (req.user?.role === UserRole.GYM_OWNER && gym.ownerId.toString() !== req.user.userId) {
                    res.status(403).json({ message: "You can only create challenges for your own gyms" });
                    return;
                }
            }

            const challenge = await this.challengeService.createChallenge(req.body);
            res.status(201).json(challenge);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateChallenge(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Challenge id is required" });
                return;
            }

            const challenge = await this.challengeService.getChallengeById(req.params.id);
            if (!challenge) {
                res.status(404).json({ message: `Challenge with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN) {
                if (challenge.creatorId.toString() !== req.user?.userId) {
                    res.status(403).json({ message: "You can only update your own challenges" });
                    return;
                }
            }

            const updatedChallenge = await this.challengeService.updateChallenge(req.params.id, req.body);
            res.status(200).json(updatedChallenge);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteChallenge(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "Challenge id is required" });
                return;
            }

            const challenge = await this.challengeService.getChallengeById(req.params.id);
            if (!challenge) {
                res.status(404).json({ message: `Challenge with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN) {
                if (challenge.creatorId.toString() !== req.user?.userId) {
                    res.status(403).json({ message: "You can only delete your own challenges" });
                    return;
                }
            }

            await this.challengeService.deleteChallenge(req.params.id);
            res.status(204).end();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", this.getAllChallenges.bind(this));
        router.get("/active", this.getActiveChallenges.bind(this));
        router.get("/:id", this.getChallengeById.bind(this));

        router.post("/",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.validationMiddleware.validateChallengeDates(),
            this.createChallenge.bind(this)
        );

        router.put("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.updateChallenge.bind(this)
        );

        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.deleteChallenge.bind(this)
        );

        return router;
    }
}
