import { ExerciseController } from "../../../src/controllers/exercise.controller";
import { ExerciseService } from "../../../src/services/mongoose/services/exercise.service";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { CreatorType } from "../../../src/types";

jest.mock("../../../src/services/mongoose/services/exercise.service");
jest.mock("../../../src/middlewares/auth.middleware");

describe("ExerciseController", () => {
    let exerciseController: ExerciseController;
    let exerciseService: jest.Mocked<ExerciseService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: any;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let endMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        exerciseService = new ExerciseService({} as any) as jest.Mocked<ExerciseService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        exerciseService.getAllExercises = jest.fn();
        exerciseService.getExercisesWithFilters = jest.fn();
        exerciseService.getExerciseById = jest.fn();
        exerciseService.createExercise = jest.fn();
        exerciseService.updateExercise = jest.fn();
        exerciseService.deleteExercise = jest.fn();

        exerciseController = new ExerciseController(exerciseService, authMiddleware);

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        endMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
            end: endMock
        };
    });

    describe("getAllExercises", () => {
        it("should return all exercises if no filters", async () => {
            req = { query: {} };
            const exercises = [{ name: "Ex 1" }];
            exerciseService.getAllExercises.mockResolvedValue(exercises as any);

            await exerciseController.getAllExercises(req as Request, res as Response);

            expect(exerciseService.getAllExercises).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(exercises);
        });

        it("should filter exercises if query params are present", async () => {
            req = { query: { difficulty: "beginner" } };
            const exercises = [{ name: "Easy Ex" }];
            exerciseService.getExercisesWithFilters.mockResolvedValue(exercises as any);

            await exerciseController.getAllExercises(req as Request, res as Response);

            expect(exerciseService.getExercisesWithFilters).toHaveBeenCalledWith(expect.objectContaining({ difficulty: "beginner" }));
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(exercises);
        });
    });

    describe("getExerciseById", () => {
        it("should return 400 if id missing", async () => {
            req = { params: {} };
            await exerciseController.getExerciseById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
            req = { params: { id: "123" } };
            exerciseService.getExerciseById.mockResolvedValue(null);
            await exerciseController.getExerciseById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });

        it("should return exercise if found", async () => {
            req = { params: { id: "123" } };
            const exercise = { _id: "123" };
            exerciseService.getExerciseById.mockResolvedValue(exercise as any);
            await exerciseController.getExerciseById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(exercise);
        });
    });

    describe("createExercise", () => {
        it("should create exercise with admin info", async () => {
            req = { 
                body: { name: "Push ups" },
                user: { userId: "admin1", role: "ADMIN" } as any
            };
            const createdExercise = { ...req.body, creatorId: "admin1", creatorType: CreatorType.ADMIN };
            exerciseService.createExercise.mockResolvedValue(createdExercise);

            await exerciseController.createExercise(req as Request, res as Response);

            expect(req.body.creatorId).toBe("admin1");
            expect(req.body.creatorType).toBe(CreatorType.ADMIN);
            expect(exerciseService.createExercise).toHaveBeenCalledWith(req.body);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(createdExercise);
        });
    });

    describe("updateExercise", () => {
         it("should return 400 if id missing", async () => {
            req = { params: {} };
            await exerciseController.updateExercise(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
             req = { params: { id: "123" } };
            exerciseService.getExerciseById.mockResolvedValue(null);
            await exerciseController.updateExercise(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });
        
        it("should update exercise", async () => {
             req = { params: { id: "123" }, body: { name: "New Name" } };
             exerciseService.getExerciseById.mockResolvedValue({ _id: "123" } as any);
             exerciseService.updateExercise.mockResolvedValue({ _id: "123", name: "New Name" } as any);

             await exerciseController.updateExercise(req as Request, res as Response);

             expect(exerciseService.updateExercise).toHaveBeenCalledWith("123", req.body);
             expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    describe("deleteExercise", () => {
        it("should return 400 if id missing", async () => {
            req = { params: {} };
            await exerciseController.deleteExercise(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
             req = { params: { id: "123" } };
            exerciseService.getExerciseById.mockResolvedValue(null);
            await exerciseController.deleteExercise(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });

        it("should delete exercise", async () => {
             req = { params: { id: "123" } };
             exerciseService.getExerciseById.mockResolvedValue({ _id: "123" } as any);
             
             await exerciseController.deleteExercise(req as Request, res as Response);

             expect(exerciseService.deleteExercise).toHaveBeenCalledWith("123");
             expect(statusMock).toHaveBeenCalledWith(204);
        });
    });
});
