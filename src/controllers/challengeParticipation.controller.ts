import { Request, Response, Router } from "express";
import { ChallengeParticipationService, ChallengeService, WorkoutSessionService, UserService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { UserRole } from "../types";

export class ChallengeParticipationController {

    constructor(
        private readonly challengeParticipationService: ChallengeParticipationService,
        private readonly challengeService: ChallengeService,
        private readonly workoutSessionService: WorkoutSessionService,
        private readonly userService: UserService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async getAllChallengeParticipations(req: Request, res: Response): Promise<void> {
        try {
            const { challengeId, userId } = req.query;
            let participations;

            if (challengeId) {
                participations = await this.challengeParticipationService.getParticipationsByChallenge(challengeId as string);
            } else if (userId) {
                participations = await this.challengeParticipationService.getParticipationsByUser(userId as string);
            } else {
                participations = await this.challengeParticipationService.getAllChallengeParticipations();
            }

            res.status(200).json(participations);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getChallengeParticipationById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "ChallengeParticipation id is required" });
                return;
            }
            const participation = await this.challengeParticipationService.getChallengeParticipationById(req.params.id);
            if (!participation) {
                res.status(404).json({ message: `ChallengeParticipation with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role === UserRole.USER) {
                if (participation.userId.toString() !== req.user.userId) {
                    res.status(403).json({ message: "You can only view your own participations" });
                    return;
                }
            }

            res.status(200).json(participation);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const { challengeId } = req.params;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!challengeId) {
                res.status(400).json({ message: "challengeId is required" });
                return;
            }

            const challenge = await this.challengeService.getChallengeById(challengeId);
            if (!challenge) {
                res.status(404).json({ message: `Challenge with id ${challengeId} not found` });
                return;
            }

            const leaderboard = await this.challengeParticipationService.getTopParticipants(challengeId, limit);
            res.status(200).json(leaderboard);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async createChallengeParticipation(req: Request, res: Response): Promise<void> {
        try {
            req.body.userId = req.user!.userId;

            const { challengeId, sessionId, score } = req.body;

            if (!challengeId) {
                res.status(400).json({ message: "challengeId is required" });
                return;
            }

            if (!sessionId) {
                res.status(400).json({ message: "sessionId is required" });
                return;
            }

            if (score === undefined) {
                res.status(400).json({ message: "score is required" });
                return;
            }

            const challenge = await this.challengeService.getChallengeById(challengeId);
            if (!challenge) {
                res.status(404).json({ message: `Challenge with id ${challengeId} not found` });
                return;
            }

            const now = new Date();
            if (now < challenge.startDate || now > challenge.endDate) {
                res.status(400).json({ message: "Challenge is not currently active" });
                return;
            }

            const session = await this.workoutSessionService.getWorkoutSessionById(sessionId);
            if (!session) {
                res.status(404).json({ message: `WorkoutSession with id ${sessionId} not found` });
                return;
            }

            if (session.userId.toString() !== req.user!.userId) {
                res.status(403).json({ message: "Session does not belong to you" });
                return;
            }

            if (session.workoutId.toString() !== challenge.workoutId.toString()) {
                res.status(400).json({ message: "Session workout does not match challenge workout" });
                return;
            }

            const existingParticipation = await this.challengeParticipationService.getUserParticipationInChallenge(
                req.user!.userId,
                challengeId
            );
            if (existingParticipation) {
                res.status(409).json({ message: "You have already participated in this challenge" });
                return;
            }

            req.body.pointsEarned = challenge.pointsReward.participation;

            const participation = await this.challengeParticipationService.createChallengeParticipation(req.body);

            await this.challengeParticipationService.updateRankings(challengeId);

            const updatedParticipation = await this.challengeParticipationService.getChallengeParticipationById(participation._id.toString());

            if (updatedParticipation && updatedParticipation.rank) {
                let pointsToAdd = challenge.pointsReward.participation;
                if (updatedParticipation.rank === 1) pointsToAdd = challenge.pointsReward.first;
                else if (updatedParticipation.rank === 2) pointsToAdd = challenge.pointsReward.second;
                else if (updatedParticipation.rank === 3) pointsToAdd = challenge.pointsReward.third;

                await this.challengeParticipationService.updateChallengeParticipation(
                    participation._id.toString(),
                    { pointsEarned: pointsToAdd }
                );
                await this.userService.addPointsToUser(req.user!.userId, pointsToAdd);
            }

            const finalParticipation = await this.challengeParticipationService.getChallengeParticipationById(participation._id.toString());
            res.status(201).json(finalParticipation);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateChallengeParticipation(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "ChallengeParticipation id is required" });
                return;
            }

            const participation = await this.challengeParticipationService.getChallengeParticipationById(req.params.id);
            if (!participation) {
                res.status(404).json({ message: `ChallengeParticipation with id ${req.params.id} not found` });
                return;
            }

            if (req.user?.role !== UserRole.ADMIN) {
                res.status(403).json({ message: "Only admins can update participations" });
                return;
            }

            const updatedParticipation = await this.challengeParticipationService.updateChallengeParticipation(req.params.id, req.body);
            res.status(200).json(updatedParticipation);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteChallengeParticipation(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.id) {
                res.status(400).json({ message: "ChallengeParticipation id is required" });
                return;
            }

            const participation = await this.challengeParticipationService.getChallengeParticipationById(req.params.id);
            if (!participation) {
                res.status(404).json({ message: `ChallengeParticipation with id ${req.params.id} not found` });
                return;
            }

            await this.challengeParticipationService.deleteChallengeParticipation(req.params.id);
            res.status(204).end();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.getAllChallengeParticipations.bind(this)
        );
        router.get("/leaderboard/:challengeId",
            this.getLeaderboard.bind(this)
        );
        router.get("/:id",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.getChallengeParticipationById.bind(this)
        );

        router.post("/",
            this.authMiddleware.authorize(UserRole.USER, UserRole.GYM_OWNER, UserRole.ADMIN),
            this.createChallengeParticipation.bind(this)
        );

        router.put("/:id",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.updateChallengeParticipation.bind(this)
        );

        router.delete("/:id",
            this.authMiddleware.authorize(UserRole.ADMIN),
            this.deleteChallengeParticipation.bind(this)
        );

        return router;
    }
}
