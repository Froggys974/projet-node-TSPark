import { WorkoutSessionController } from "../../../src/controllers/workoutSession.controller";
import { WorkoutSessionService } from "../../../src/services/mongoose/services/workoutSession.service";
import { WorkoutService } from "../../../src/services/mongoose/services/workout.service";
import { WorkoutStepService } from "../../../src/services/mongoose/services/workoutStep.service";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { UserRole } from "../../../src/types";

jest.mock("../../../src/services/mongoose/services/workoutSession.service");
jest.mock("../../../src/services/mongoose/services/workout.service");
jest.mock("../../../src/services/mongoose/services/workoutStep.service");
jest.mock("../../../src/middlewares/auth.middleware");

describe("WorkoutSessionController", () => {
    let sessionController: WorkoutSessionController;
    let sessionService: jest.Mocked<WorkoutSessionService>;
    let workoutService: jest.Mocked<WorkoutService>;
    let stepService: jest.Mocked<WorkoutStepService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: any;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        sessionService = new WorkoutSessionService({} as any) as jest.Mocked<WorkoutSessionService>;
        workoutService = new WorkoutService({} as any) as jest.Mocked<WorkoutService>;
        stepService = new WorkoutStepService({} as any) as jest.Mocked<WorkoutStepService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        sessionService.getAllWorkoutSessions = jest.fn();
        sessionService.getSessionsByUser = jest.fn();
        sessionService.getSessionsByWorkout = jest.fn();
        sessionService.getWorkoutSessionById = jest.fn();
        sessionService.createWorkoutSession = jest.fn();
        sessionService.startSession = jest.fn();
        sessionService.completeSession = jest.fn();
        sessionService.abandonSession = jest.fn();
        sessionService.updateCalories = jest.fn();

        workoutService.getWorkoutById = jest.fn();
        stepService.getStepsByWorkout = jest.fn();

        sessionController = new WorkoutSessionController(sessionService, workoutService, stepService, authMiddleware);

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    describe("getAllWorkoutSessions", () => {
        it("should return all sessions if no params", async () => {
            req = { query: {} };
            const sessions = [{ id: "s1" }];
            sessionService.getAllWorkoutSessions.mockResolvedValue(sessions as any);

            await sessionController.getAllWorkoutSessions(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(sessions);
        });

         it("should filter by user", async () => {
            req = { query: { userId: "u1" } };
            sessionService.getSessionsByUser.mockResolvedValue([]);
            await sessionController.getAllWorkoutSessions(req as Request, res as Response);
            expect(sessionService.getSessionsByUser).toHaveBeenCalledWith("u1");
        });
    });

    describe("createWorkoutSession", () => {
        it("should create session", async () => {
            req = { 
                body: { workoutId: "w1" },
                user: { userId: "u1" } as any
            };
            workoutService.getWorkoutById.mockResolvedValue({ _id: "w1" } as any);
            sessionService.createWorkoutSession.mockResolvedValue({ _id: "s1" } as any);

            await sessionController.createWorkoutSession(req as Request, res as Response);

            expect(req.body.userId).toBe("u1");
            expect(statusMock).toHaveBeenCalledWith(201);
        });

        it("should return 404 if workout missing", async () => {
             req = { body: { workoutId: "w1" }, user: { userId: "u1" } as any };
             workoutService.getWorkoutById.mockResolvedValue(null);
             await sessionController.createWorkoutSession(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(404);
        });
    });

    describe("startWorkoutSession", () => {
        it("should start own session", async () => {
             req = { params: { id: "s1" }, user: { userId: "u1" } as any };
             sessionService.getWorkoutSessionById.mockResolvedValue({ _id: "s1", userId: "u1" } as any);
             sessionService.startSession.mockResolvedValue({ status: "IN_PROGRESS" } as any);

             await sessionController.startWorkoutSession(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(200);
        });

        it("should forbid starting others session", async () => {
             req = { params: { id: "s1" }, user: { userId: "u2" } as any };
             sessionService.getWorkoutSessionById.mockResolvedValue({ _id: "s1", userId: "u1" } as any); // Owner u1
             
             await sessionController.startWorkoutSession(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(403);
        });
    });

    describe("completeWorkoutSession", () => {
         it("should complete session and calc calories", async () => {
             req = { 
                 params: { id: "s1" }, 
                 body: { overallFeeling: "good" },
                 user: { userId: "u1" } as any
             };
             const session = { _id: "s1", userId: "u1", workoutId: "w1" };
             sessionService.getWorkoutSessionById.mockResolvedValue(session as any);
             sessionService.completeSession.mockResolvedValue(session as any);
             
             await sessionController.completeWorkoutSession(req as Request, res as Response);
             
            expect(sessionService.completeSession).toHaveBeenCalled();
            expect(sessionService.updateCalories).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
         });
    });
});
