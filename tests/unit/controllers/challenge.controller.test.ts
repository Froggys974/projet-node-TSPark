import { ChallengeController } from "../../../src/controllers/challenge.controller";
import { ChallengeService } from "../../../src/services/mongoose/services/challenge.service";
import { WorkoutService } from "../../../src/services/mongoose/services/workout.service";
import { GymService } from "../../../src/services/mongoose/services/gym.service";
import { ValidationMiddleware } from "../../../src/middlewares/validations.middleware";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { UserRole } from "../../../src/types";

jest.mock("../../../src/services/mongoose/services/challenge.service");
jest.mock("../../../src/services/mongoose/services/workout.service");
jest.mock("../../../src/services/mongoose/services/gym.service");
jest.mock("../../../src/middlewares/validations.middleware");
jest.mock("../../../src/middlewares/auth.middleware");

describe("ChallengeController", () => {
    let challengeController: ChallengeController;
    let challengeService: jest.Mocked<ChallengeService>;
    let workoutService: jest.Mocked<WorkoutService>;
    let gymService: jest.Mocked<GymService>;
    let validationMiddleware: jest.Mocked<ValidationMiddleware>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        challengeService = new ChallengeService({} as any) as jest.Mocked<ChallengeService>;
        workoutService = new WorkoutService({} as any) as jest.Mocked<WorkoutService>;
        gymService = new GymService({} as any) as jest.Mocked<GymService>;
        validationMiddleware = new ValidationMiddleware() as jest.Mocked<ValidationMiddleware>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        challengeService.getAllChallenges = jest.fn();
        challengeService.getChallengesWithFilters = jest.fn();
        challengeService.getChallengeById = jest.fn();
        challengeService.createChallenge = jest.fn();
        challengeService.getPublicActiveChallenges = jest.fn();

        workoutService.getWorkoutById = jest.fn();
        gymService.getGymById = jest.fn();

        challengeController = new ChallengeController(
            challengeService,
            workoutService,
            gymService,
            validationMiddleware,
            authMiddleware
        );

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    describe("getAllChallenges", () => {
        it("should return all challenges if no query params", async () => {
            req = { query: {} };
            const challenges = [{ name: "C1" }];
            challengeService.getAllChallenges.mockResolvedValue(challenges as any);

            await challengeController.getAllChallenges(req as Request, res as Response);

            expect(challengeService.getAllChallenges).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(challenges);
        });

        it("should filter challenges", async () => {
            req = { query: { isActive: "true" } };
            const challenges = [{ name: "Active C" }];
            challengeService.getChallengesWithFilters.mockResolvedValue(challenges as any);

            await challengeController.getAllChallenges(req as Request, res as Response);

            expect(challengeService.getChallengesWithFilters).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }));
            expect(jsonMock).toHaveBeenCalledWith(challenges);
        });
    });

    describe("getChallengeById", () => {
         it("should return 400 if id missing", async () => {
            req = { params: {} };
            await challengeController.getChallengeById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
             req = { params: { id: "123" } };
             challengeService.getChallengeById.mockResolvedValue(null);
             await challengeController.getChallengeById(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(404);
        });
        
        it("should return challenge if found", async () => {
             req = { params: { id: "123" } };
             const challenge = { _id: "123" };
             challengeService.getChallengeById.mockResolvedValue(challenge as any);
             await challengeController.getChallengeById(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(200);
             expect(jsonMock).toHaveBeenCalledWith(challenge);
        });
    });

    describe("getActiveChallenges", () => {
        it("should return active public challenges", async () => {
            const challenges = [{ name: "Active" }];
            challengeService.getPublicActiveChallenges.mockResolvedValue(challenges as any);

            await challengeController.getActiveChallenges(req as Request, res as Response);

            expect(challengeService.getPublicActiveChallenges).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(challenges);
        });
    });

    describe("createChallenge", () => {
        it("should create challenge", async () => {
            req = {
                body: { workoutId: "w1", name: "Challenge" },
                user: { userId: "creator1", role: UserRole.USER } as any
            };
            
            workoutService.getWorkoutById.mockResolvedValue({ _id: "w1" } as any);
            challengeService.createChallenge.mockResolvedValue({ _id: "c1", ...req.body } as any);

            await challengeController.createChallenge(req as Request, res as Response);

            expect(req.body.creatorId).toBe("creator1");
            expect(challengeService.createChallenge).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(201);
        });

        it("should return 400 if workoutId is missing", async () => {
            req = { body: {}, user: { userId: "u1" } as any };
            await challengeController.createChallenge(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if workout not found", async () => {
            req = { body: { workoutId: "w1" }, user: { userId: "u1" } as any };
            workoutService.getWorkoutById.mockResolvedValue(null);
            await challengeController.createChallenge(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });

        it("should return 404 if gym not found", async () => {
            req = { body: { workoutId: "w1", gymId: "g1" }, user: { userId: "u1" } as any };
            workoutService.getWorkoutById.mockResolvedValue({ _id: "w1" } as any);
            gymService.getGymById.mockResolvedValue(null);

            await challengeController.createChallenge(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });

        it("should return 403 if GYM_OWNER creates challenge for another gym", async () => {
            req = { 
                body: { workoutId: "w1", gymId: "g1" }, 
                user: { userId: "owner1", role: UserRole.GYM_OWNER } as any 
            };
            workoutService.getWorkoutById.mockResolvedValue({ _id: "w1" } as any);
            gymService.getGymById.mockResolvedValue({ _id: "g1", ownerId: "owner2" } as any);

            await challengeController.createChallenge(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "You can only create challenges for your own gyms" }));
        });
    });
});
