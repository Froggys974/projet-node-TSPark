import { GymService } from "../../../src/services/mongoose/services/gym.service";
import { Mongoose } from "mongoose";
import { GymStatus } from "../../../src/types";

describe("GymService", () => {
    let service: GymService;
    let mockMongoose: Partial<Mongoose>;
    let mockModel: any;

    beforeEach(() => {
        mockModel = {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
        };

        mockMongoose = {
            model: jest.fn().mockReturnValue(mockModel),
        };

        service = new GymService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createGym", () => {
        it("should create a gym", async () => {
            const data: any = {
                name: "FitnessPark",
                address: "123 Main St",
                ownerId: "owner1",
            };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createGym(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllGyms", () => {
        it("should return all gyms", async () => {
            const data = [
                { id: "1", name: "FitnessPark 1", address: "123 Main St" },
                { id: "2", name: "FitnessPark 2", address: "456 Oak Ave" },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllGyms();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getGymById", () => {
        it("should return a gym by id", async () => {
            const data = { id: "1", name: "FitnessPark", address: "123 Main St" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getGymById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("updateGym", () => {
        it("should update a gym", async () => {
            const id = "1";
            const updateData: any = { name: "Updated FitnessPark" };
            const updatedData = { id: "1", ...updateData };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateGym(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteGym", () => {
        it("should delete a gym", async () => {
            const id = "1";
            mockModel.findByIdAndDelete.mockResolvedValue(null);

            await service.deleteGym(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getGymsByOwner", () => {
        it("should return gyms by owner", async () => {
            const ownerId = "owner1";
            const data = [{ id: "1", name: "FitnessPark", ownerId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getGymsByOwner(ownerId);

            expect(mockModel.find).toHaveBeenCalledWith({ ownerId });
            expect(result).toEqual(data);
        });
    });

    describe("getGymsByStatus", () => {
        it("should return gyms by status", async () => {
            const status = GymStatus.APPROVED;
            const data = [{ id: "1", name: "FitnessPark", status }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getGymsByStatus(status);

            expect(mockModel.find).toHaveBeenCalledWith({ status });
            expect(result).toEqual(data);
        });
    });

    describe("approveGym", () => {
        it("should approve a gym", async () => {
            const id = "1";
            const approvedBy = "admin1";
            const updatedData = {
                id: "1",
                name: "FitnessPark",
                status: GymStatus.APPROVED,
                approvedBy,
            };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.approveGym(id, approvedBy);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(updatedData);
        });
    });

    describe("rejectGym", () => {
        it("should reject a gym", async () => {
            const id = "1";
            const approvedBy = "admin1";
            const updatedData = {
                id: "1",
                name: "FitnessPark",
                status: GymStatus.REJECTED,
                approvedBy,
            };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.rejectGym(id, approvedBy);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(updatedData);
        });
    });
});
