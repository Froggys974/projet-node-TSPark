import { WorkoutStepController } from "../../../src/controllers/workoutStep.controller";
import { WorkoutStepService } from "../../../src/services/mongoose/services/workoutStep.service";
import { WorkoutService } from "../../../src/services/mongoose/services/workout.service";
import { EquipmentService } from "../../../src/services/mongoose/services/equipment.service";
import { GymService } from "../../../src/services/mongoose/services/gym.service";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { UserRole } from "../../../src/types";

jest.mock("../../../src/services/mongoose/services/workoutStep.service");
jest.mock("../../../src/services/mongoose/services/workout.service");
jest.mock("../../../src/services/mongoose/services/equipment.service");
jest.mock("../../../src/services/mongoose/services/gym.service");
jest.mock("../../../src/middlewares/auth.middleware");

describe("WorkoutStepController", () => {
    let workoutStepController: WorkoutStepController;
    let workoutStepService: jest.Mocked<WorkoutStepService>;
    let workoutService: jest.Mocked<WorkoutService>;
    let equipmentService: jest.Mocked<EquipmentService>;
    let gymService: jest.Mocked<GymService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: any;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        workoutStepService = new WorkoutStepService({} as any) as jest.Mocked<WorkoutStepService>;
        workoutService = new WorkoutService({} as any) as jest.Mocked<WorkoutService>;
        equipmentService = new EquipmentService({} as any) as jest.Mocked<EquipmentService>;
        gymService = new GymService({} as any) as jest.Mocked<GymService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        workoutStepService.getWorkoutStepById = jest.fn();
        workoutStepService.createWorkoutStep = jest.fn();
        workoutStepService.updateWorkoutStep = jest.fn();
        workoutStepService.deleteWorkoutStep = jest.fn();
        
        workoutService.getWorkoutById = jest.fn();
        equipmentService.getEquipmentById = jest.fn();

        workoutStepController = new WorkoutStepController(
            workoutStepService,
            workoutService,
            equipmentService,
            gymService,
            authMiddleware
        );

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    describe("getWorkoutStepById", () => {
        it("should return step if found", async () => {
            req = { params: { id: "s1" } };
            workoutStepService.getWorkoutStepById.mockResolvedValue({ _id: "s1" } as any);
            await workoutStepController.getWorkoutStepById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200); 
        });
        
         it("should return 404 if not found", async () => {
            req = { params: { id: "s1" } };
            workoutStepService.getWorkoutStepById.mockResolvedValue(null);
            await workoutStepController.getWorkoutStepById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });
    });

    describe("createWorkoutStep", () => {
        it("should create step for owner", async () => {
             req = { 
                 body: { workoutId: "w1" },
                 user: { userId: "u1", role: UserRole.USER } as any
             };
             workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "u1" } as any);
             workoutStepService.createWorkoutStep.mockResolvedValue(req.body);

             await workoutStepController.createWorkoutStep(req as Request, res as Response);

             expect(statusMock).toHaveBeenCalledWith(201);
        });

         it("should forbid non owner", async () => {
             req = { 
                 body: { workoutId: "w1" },
                 user: { userId: "u2", role: UserRole.USER } as any
             };
             workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "u1" } as any);

             await workoutStepController.createWorkoutStep(req as Request, res as Response);

             expect(statusMock).toHaveBeenCalledWith(403);
        });

         it("should forbid user using equipment", async () => {
             req = { 
                 body: { workoutId: "w1", equipmentId: "e1" },
                 user: { userId: "u1", role: UserRole.USER } as any
             };
             workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "u1" } as any);

             await workoutStepController.createWorkoutStep(req as Request, res as Response);

             expect(statusMock).toHaveBeenCalledWith(403);
             expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Users cannot add equipment to their workouts" }));
        });

         it("should validate equipment gym match", async () => {
             req = { 
                 body: { workoutId: "w1", equipmentId: "e1" },
                 user: { userId: "o1", role: UserRole.GYM_OWNER } as any
             };
             workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "o1", gymId: "g1" } as any);
             equipmentService.getEquipmentById.mockResolvedValue({ _id: "e1", gymId: "g2" } as any); // Diff gym

             await workoutStepController.createWorkoutStep(req as Request, res as Response);

             expect(statusMock).toHaveBeenCalledWith(400); // Or 400 as per implementation
             expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Equipment must belong to the same gym as the workout" }));
        });
    });

    describe("updateWorkoutStep", () => {
        it("should allow owner update", async () => {
            req = { params: { id: "s1" }, user: { userId: "u1" } as any };
            workoutStepService.getWorkoutStepById.mockResolvedValue({ workoutId: "w1" } as any);
            workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "u1" } as any);
             workoutStepService.updateWorkoutStep.mockResolvedValue({ text: "up" } as any);

            await workoutStepController.updateWorkoutStep(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });
    
     describe("deleteWorkoutStep", () => {
        it("should allow owner delete", async () => {
            req = { params: { id: "s1" }, user: { userId: "u1" } as any };
            workoutStepService.getWorkoutStepById.mockResolvedValue({ workoutId: "w1" } as any);
            workoutService.getWorkoutById.mockResolvedValue({ _id: "w1", creatorId: "u1" } as any);

            await workoutStepController.deleteWorkoutStep(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(204);
        });
    });

});
