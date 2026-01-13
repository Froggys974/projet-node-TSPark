import { GymController } from "../../../src/controllers/gym.controller";
import { GymService } from "../../../src/services/mongoose/services/gym.service";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { UserRole, GymStatus } from "../../../src/types";

jest.mock("../../../src/services/mongoose/services/gym.service");
jest.mock("../../../src/middlewares/auth.middleware");

describe("GymController", () => {
    let gymController: GymController;
    let gymService: jest.Mocked<GymService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let endMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        gymService = new GymService({} as any) as jest.Mocked<GymService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        gymService.getAllGyms = jest.fn();
        gymService.getGymsByStatus = jest.fn();
        gymService.getGymsByOwner = jest.fn();
        gymService.getGymById = jest.fn();
        gymService.createGym = jest.fn();
        gymService.updateGym = jest.fn();
        gymService.deleteGym = jest.fn();
        gymService.approveGym = jest.fn();
        gymService.rejectGym = jest.fn();

        gymController = new GymController(gymService, authMiddleware);

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        endMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
            end: endMock
        };
    });

    describe("getAllGyms", () => {
        it("should return all gyms if no query params", async () => {
             req = { query: {} };
            const gyms = [{ name: "Gym 1" }];
            gymService.getAllGyms.mockResolvedValue(gyms as any);

            await gymController.getAllGyms(req as Request, res as Response);

            expect(gymService.getAllGyms).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(gyms);
        });

         it("should filter by status", async () => {
             req = { query: { status: GymStatus.APPROVED } };
             const gyms = [{ name: "Gym 1", status: GymStatus.APPROVED }];
             gymService.getGymsByStatus.mockResolvedValue(gyms as any);

             await gymController.getAllGyms(req as Request, res as Response);

             expect(gymService.getGymsByStatus).toHaveBeenCalledWith(GymStatus.APPROVED);
             expect(jsonMock).toHaveBeenCalledWith(gyms);
         });

         it("should filter by ownerId", async () => {
             req = { query: { ownerId: "123" } };
             const gyms = [{ name: "Gym 1", ownerId: "123" }];
             gymService.getGymsByOwner.mockResolvedValue(gyms as any);

             await gymController.getAllGyms(req as Request, res as Response);

             expect(gymService.getGymsByOwner).toHaveBeenCalledWith("123");
             expect(jsonMock).toHaveBeenCalledWith(gyms);
         });
    });

    describe("getGymById", () => {
        it("should return 400 if id missing", async () => {
            req = { params: {} };
            await gymController.getGymById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
             req = { params: { id: "123" } };
             gymService.getGymById.mockResolvedValue(null);
             await gymController.getGymById(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(404);
        });
        
        it("should return gym if found", async () => {
             req = { params: { id: "123" } };
             const gym = { _id: "123" };
             gymService.getGymById.mockResolvedValue(gym as any);
             await gymController.getGymById(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(200);
             expect(jsonMock).toHaveBeenCalledWith(gym);
        });
    });

    describe("createGym", () => {
        it("should set ownerId from user if GYM_OWNER", async () => {
            req = { 
                body: { name: "New Gym" },
                user: { role: UserRole.GYM_OWNER, userId: "owner1", email: "e@e.com" }
            };
            const createdGym = { ...req.body, ownerId: "owner1" };
            gymService.createGym.mockResolvedValue(createdGym);

            await gymController.createGym(req as Request, res as Response);

            expect(req.body.ownerId).toBe("owner1");
            expect(gymService.createGym).toHaveBeenCalledWith(req.body);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(createdGym);
        });
        
         it("should not override ownerId if ADMIN (implicit)", async () => {
            req = { 
                body: { name: "New Gym", ownerId: "someOtherOwner" },
                user: { role: UserRole.ADMIN, userId: "admin1", email: "a@a.com" }
            };
             // Implementation doesn't strictly forbid ADMIN from not having ownerId set automatically, 
             // but logic: `if (req.user?.role === UserRole.GYM_OWNER) { req.body.ownerId = req.user.userId; }`
             // implies for ADMIN it keeps original body.
            
            await gymController.createGym(req as Request, res as Response);
            
            expect(gymService.createGym).toHaveBeenCalledWith(req.body);
            expect(req.body.ownerId).toBe("someOtherOwner");
        });
    });

    describe("updateGym", () => {
        it("should return 400 if id missing", async () => {
            req = { params: {} };
            await gymController.updateGym(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if gym not found", async () => {
            req = { params: { id: "123" } };
            gymService.getGymById.mockResolvedValue(null);
            await gymController.updateGym(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404); 
        });

        it("should return 403 if GYM_OWNER tries to update another's gym", async () => {
             req = { 
                params: { id: "123" },
                user: { role: UserRole.GYM_OWNER, userId: "owner1", email: "e@e.com" }
            };
            const gym = { _id: "123", ownerId: "owner2" }; // Different owner
            gymService.getGymById.mockResolvedValue(gym as any);

            await gymController.updateGym(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({ message: "You can only update your own gyms" });
        });

         it("should update gym if owner matches", async () => {
             req = { 
                params: { id: "123" },
                user: { role: UserRole.GYM_OWNER, userId: "owner1", email: "e@e.com" },
                body: { name: "Updated" }
            };
            const gym = { _id: "123", ownerId: "owner1" };
            gymService.getGymById.mockResolvedValue(gym as any);
            gymService.updateGym.mockResolvedValue({ ...gym, name: "Updated" } as any);

            await gymController.updateGym(req as Request, res as Response);

            expect(gymService.updateGym).toHaveBeenCalledWith("123", req.body);
            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    describe("deleteGym", () => {
         it("should delete gym if found", async () => {
            req = { params: { id: "123" } };
            gymService.getGymById.mockResolvedValue({ _id: "123" } as any);
            
            await gymController.deleteGym(req as Request, res as Response);

            expect(gymService.deleteGym).toHaveBeenCalledWith("123");
            expect(statusMock).toHaveBeenCalledWith(204);
        });
    });

    describe("approveGym", () => {
        it("should approve gym", async () => {
             req = { 
                 params: { id: "123" },
                 user: { userId: "admin1" } as any
             };
             const approvedGym = { _id: "123", status: GymStatus.APPROVED };
             gymService.approveGym.mockResolvedValue(approvedGym as any);

             await gymController.approveGym(req as Request, res as Response);

             expect(gymService.approveGym).toHaveBeenCalledWith("123", "admin1");
             expect(statusMock).toHaveBeenCalledWith(200);
             expect(jsonMock).toHaveBeenCalledWith(approvedGym);
        });
    });

    describe("rejectGym", () => {
        it("should reject gym", async () => {
             req = { 
                 params: { id: "123" },
                 user: { userId: "admin1" } as any
             };
             const rejectedGym = { _id: "123", status: GymStatus.REJECTED };
             gymService.rejectGym.mockResolvedValue(rejectedGym as any);

             await gymController.rejectGym(req as Request, res as Response);

             expect(gymService.rejectGym).toHaveBeenCalledWith("123", "admin1");
             expect(statusMock).toHaveBeenCalledWith(200);
             expect(jsonMock).toHaveBeenCalledWith(rejectedGym);
        });
    });
});
