import { WorkoutController } from "../../../src/controllers/workout.controller";
import { WorkoutService } from "../../../src/services/mongoose/services/workout.service";
import { WorkoutStepService } from "../../../src/services/mongoose/services/workoutStep.service";
import { GymService } from "../../../src/services/mongoose/services/gym.service";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { UserRole, CreatorType } from "../../../src/types";

jest.mock("../../../src/services/mongoose/services/workout.service");
jest.mock("../../../src/services/mongoose/services/workoutStep.service");
jest.mock("../../../src/services/mongoose/services/gym.service");
jest.mock("../../../src/middlewares/auth.middleware");

describe("WorkoutController", () => {
    let workoutController: WorkoutController;
    let workoutService: jest.Mocked<WorkoutService>;
    let workoutStepService: jest.Mocked<WorkoutStepService>;
    let gymService: jest.Mocked<GymService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: any;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        workoutService = new WorkoutService({} as any) as jest.Mocked<WorkoutService>;
        workoutStepService = new WorkoutStepService({} as any) as jest.Mocked<WorkoutStepService>;
        gymService = new GymService({} as any) as jest.Mocked<GymService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        workoutService.getAllWorkouts = jest.fn();
        workoutService.getWorkoutsWithFilters = jest.fn();
        workoutService.getWorkoutById = jest.fn();
        workoutService.createWorkout = jest.fn();
        workoutService.updateWorkout = jest.fn();
        workoutService.deleteWorkout = jest.fn();

        workoutStepService.getStepsByWorkout = jest.fn();
        gymService.getGymById = jest.fn();

        workoutController = new WorkoutController(workoutService, workoutStepService, gymService, authMiddleware);

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    describe("getAllWorkouts", () => {
        it("should return all workouts if no params", async () => {
             req = { query: {} };
            const workouts = [{ name: "W1" }];
            workoutService.getAllWorkouts.mockResolvedValue(workouts as any);

            await workoutController.getAllWorkouts(req as Request, res as Response);

            expect(workoutService.getAllWorkouts).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(workouts);
        });

         it("should filter workouts", async () => {
             req = { query: { difficulty: "beginner" } };
            const workouts = [{ name: "Easy W" }];
            workoutService.getWorkoutsWithFilters.mockResolvedValue(workouts as any);

            await workoutController.getAllWorkouts(req as Request, res as Response);

            expect(workoutService.getWorkoutsWithFilters).toHaveBeenCalledWith(expect.objectContaining({ difficulty: "beginner" }));
            expect(jsonMock).toHaveBeenCalledWith(workouts);
         });
    });

    describe("getWorkoutById", () => {
         it("should return 400 if id missing", async () => {
            req = { params: {} };
            await workoutController.getWorkoutById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
            req = { params: { id: "123" } };
            workoutService.getWorkoutById.mockResolvedValue(null);
            await workoutController.getWorkoutById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });
        
        it("should return workout if found", async () => {
            req = { params: { id: "123" } };
            const w = { _id: "123" };
            workoutService.getWorkoutById.mockResolvedValue(w as any);
            await workoutController.getWorkoutById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(w);
        });
    });

    describe("getWorkoutSteps", () => {
        it("should return steps for workout", async () => {
            req = { params: { id: "w1" } };
            workoutService.getWorkoutById.mockResolvedValue({ _id: "w1" } as any);
            const steps = [{ text: "s1" }];
            workoutStepService.getStepsByWorkout.mockResolvedValue(steps as any);

            await workoutController.getWorkoutSteps(req as Request, res as Response);

            expect(workoutStepService.getStepsByWorkout).toHaveBeenCalledWith("w1");
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(steps);
        });

        it("should return 404 if workout not found", async () => {
            req = { params: { id: "w1" } };
            workoutService.getWorkoutById.mockResolvedValue(null);
            await workoutController.getWorkoutSteps(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });
    });

    describe("createWorkout", () => {
        it("should create workout for ADMIN", async () => {
            req = { 
                body: { name: "W" },
                user: { userId: "admin1", role: UserRole.ADMIN } as any
            };
            const created = { ...req.body };
            workoutService.createWorkout.mockResolvedValue(created);

            await workoutController.createWorkout(req as Request, res as Response);

            expect(req.body.creatorId).toBe("admin1");
            expect(req.body.creatorType).toBe(CreatorType.ADMIN);
            expect(workoutService.createWorkout).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(201);
        });

        it("should create private workout for USER", async () => {
             req = { 
                body: { name: "W" },
                user: { userId: "u1", role: UserRole.USER } as any
            };
            workoutService.createWorkout.mockResolvedValue({ ...req.body } as any);
            
            await workoutController.createWorkout(req as Request, res as Response);

            expect(req.body.visibility).toBe("private");
            expect(statusMock).toHaveBeenCalledWith(201);
        });

        it("should return 403 if USER provides gymId", async () => {
             req = { 
                body: { name: "W", gymId: "g1" },
                user: { userId: "u1", role: UserRole.USER } as any
            };
             await workoutController.createWorkout(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(403);
        });
        
        it("should fail for GYM_OWNER without gymId", async () => {
             req = { 
                body: { name: "W" },
                user: { userId: "o1", role: UserRole.GYM_OWNER } as any
            };
             await workoutController.createWorkout(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(400);
        });
        
         it("should success for GYM_OWNER with own gym", async () => {
             req = { 
                body: { name: "W", gymId: "g1" },
                user: { userId: "o1", role: UserRole.GYM_OWNER } as any
            };
            gymService.getGymById.mockResolvedValue({ _id: "g1", ownerId: "o1" } as any);
            workoutService.createWorkout.mockResolvedValue(req.body);

             await workoutController.createWorkout(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(201);
        });
        
         it("should fail for GYM_OWNER with other gym", async () => {
             req = { 
                body: { name: "W", gymId: "g1" },
                user: { userId: "o1", role: UserRole.GYM_OWNER } as any
            };
            gymService.getGymById.mockResolvedValue({ _id: "g1", ownerId: "o2" } as any);

             await workoutController.createWorkout(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(403);
        });
    });

    describe("updateWorkout", () => {
        it("should allow owner update", async () => {
             req = { params: { id: "w1" }, user: { userId: "u1" } as any };
             workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "u1" } as any);
             workoutService.updateWorkout.mockResolvedValue({ name: "Up" } as any);

             await workoutController.updateWorkout(req as Request, res as Response);

             expect(statusMock).toHaveBeenCalledWith(200);
        });

        it("should forbid non-owner update (non-admin)", async () => {
             req = { params: { id: "w1" }, user: { userId: "u2", role: UserRole.USER } as any };
             workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "u1" } as any);

             await workoutController.updateWorkout(req as Request, res as Response);

             expect(statusMock).toHaveBeenCalledWith(403);
        });
    });

    describe("deleteWorkout", () => {
         it("should allow owner delete", async () => {
             req = { params: { id: "w1" }, user: { userId: "u1" } as any };
             workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "u1" } as any);

             await workoutController.deleteWorkout(req as Request, res as Response);

             expect(workoutService.deleteWorkout).toHaveBeenCalledWith("w1");
             expect(statusMock).toHaveBeenCalledWith(204);
        });
    });
});
