import { EquipmentController } from "../../../src/controllers/equipment.controller";
import { EquipmentService } from "../../../src/services/mongoose/services/equipment.service";
import { GymService } from "../../../src/services/mongoose/services/gym.service";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { UserRole } from "../../../src/types";

jest.mock("../../../src/services/mongoose/services/equipment.service");
jest.mock("../../../src/services/mongoose/services/gym.service");
jest.mock("../../../src/middlewares/auth.middleware");

describe("EquipmentController", () => {
    let equipmentController: EquipmentController;
    let equipmentService: jest.Mocked<EquipmentService>;
    let gymService: jest.Mocked<GymService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        equipmentService = new EquipmentService({} as any) as jest.Mocked<EquipmentService>;
        gymService = new GymService({} as any) as jest.Mocked<GymService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        equipmentService.getAllEquipment = jest.fn();
        equipmentService.getEquipmentByGym = jest.fn();
        equipmentService.getEquipmentByCategory = jest.fn();
        equipmentService.getEquipmentByGymAndCategory = jest.fn();
        equipmentService.getEquipmentById = jest.fn();
        equipmentService.createEquipment = jest.fn();
        equipmentService.updateEquipment = jest.fn();

        gymService.getGymById = jest.fn();

        equipmentController = new EquipmentController(equipmentService, gymService, authMiddleware);

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    describe("getAllEquipment", () => {
        it("should return all equipment if no params", async () => {
            req = { query: {} };
            const equipment = [{ name: "E1" }];
            equipmentService.getAllEquipment.mockResolvedValue(equipment as any);

            await equipmentController.getAllEquipment(req as Request, res as Response);

            expect(equipmentService.getAllEquipment).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(equipment);
        });

        it("should return equipment by gymId", async () => {
            req = { query: { gymId: "g1" } };
            const equipment = [{ name: "Gym E" }];
            equipmentService.getEquipmentByGym.mockResolvedValue(equipment as any);

            await equipmentController.getAllEquipment(req as Request, res as Response);

            expect(equipmentService.getEquipmentByGym).toHaveBeenCalledWith("g1");
            expect(jsonMock).toHaveBeenCalledWith(equipment);
        });

        it("should return equipment by categoryId", async () => {
             req = { query: { categoryId: "c1" } };
             const equipment = [{ name: "Cat E" }];
             equipmentService.getEquipmentByCategory.mockResolvedValue(equipment as any);
 
             await equipmentController.getAllEquipment(req as Request, res as Response);
 
             expect(equipmentService.getEquipmentByCategory).toHaveBeenCalledWith("c1");
             expect(jsonMock).toHaveBeenCalledWith(equipment);
        });
        
        it("should return equipment by gym and category", async () => {
            req = { query: { gymId: "g1", categoryId: "c1" } };
            const equipment = [{ name: "Specific E" }];
            equipmentService.getEquipmentByGymAndCategory.mockResolvedValue(equipment as any);

            await equipmentController.getAllEquipment(req as Request, res as Response);

            expect(equipmentService.getEquipmentByGymAndCategory).toHaveBeenCalledWith("g1", "c1");
            expect(jsonMock).toHaveBeenCalledWith(equipment);
        });
    });

    describe("getEquipmentById", () => {
        it("should return 400 if id missing", async () => {
            req = { params: {} };
            await equipmentController.getEquipmentById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
            req = { params: { id: "123" } };
            equipmentService.getEquipmentById.mockResolvedValue(null);
            await equipmentController.getEquipmentById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });
    });

    describe("createEquipment", () => {
        it("should create equipment valid gym owner", async () => {
            req = { 
                body: { gymId: "g1", name: "Eq" },
                user: { userId: "owner1", role: UserRole.GYM_OWNER } as any
            };
            gymService.getGymById.mockResolvedValue({ _id: "g1", ownerId: "owner1" } as any);
            equipmentService.createEquipment.mockResolvedValue(req.body);

            await equipmentController.createEquipment(req as Request, res as Response);

            expect(equipmentService.createEquipment).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(201);
        });

        it("should return 403 if valid gym owner but different gym", async () => {
            req = { 
                body: { gymId: "g1", name: "Eq" },
                user: { userId: "owner1", role: UserRole.GYM_OWNER } as any
            };
            gymService.getGymById.mockResolvedValue({ _id: "g1", ownerId: "owner2" } as any);
            
            await equipmentController.createEquipment(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "You can only add equipment to your own gyms" }));
        });
    });

    describe("updateEquipment", () => {
         it("should update equipment if owner matches", async () => {
             req = { 
                 params: { id: "e1" },
                 body: { name: "Up" },
                 user: { userId: "owner1", role: UserRole.GYM_OWNER } as any
             };
             const eq = { _id: "e1", gymId: "g1" };
             equipmentService.getEquipmentById.mockResolvedValue(eq as any);
             gymService.getGymById.mockResolvedValue({ _id: "g1", ownerId: "owner1" } as any);
             equipmentService.updateEquipment.mockResolvedValue({ ...eq, ...req.body } as any);

             await equipmentController.updateEquipment(req as Request, res as Response);

             expect(equipmentService.updateEquipment).toHaveBeenCalledWith("e1", req.body);
             expect(statusMock).toHaveBeenCalledWith(200);
         });

         it("should return 403 if owner doesnt match", async () => {
            req = { 
                params: { id: "e1" },
                body: { name: "Up" },
                user: { userId: "owner1", role: UserRole.GYM_OWNER } as any
            };
            const eq = { _id: "e1", gymId: "g1" };
            equipmentService.getEquipmentById.mockResolvedValue(eq as any);
            gymService.getGymById.mockResolvedValue({ _id: "g1", ownerId: "owner2" } as any);

            await equipmentController.updateEquipment(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(403);
        });
    });
});
