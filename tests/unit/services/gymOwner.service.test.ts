import { GymOwnerService } from "../../../src/services/mongoose/services/gymOwner.service";
import { Mongoose } from "mongoose";

describe("GymOwnerService", () => {
    let service: GymOwnerService;
    let mockMongoose: Partial<Mongoose>;
    let mockModel: any;

    beforeEach(() => {
        const mockExec = jest.fn();
        const mockQuery = {
            exec: mockExec,
        };

        mockModel = {
            create: jest.fn(),
            find: jest.fn().mockReturnValue(mockQuery),
            findOne: jest.fn().mockReturnValue(mockQuery),
            findByIdAndUpdate: jest.fn().mockReturnValue(mockQuery),
            findByIdAndDelete: jest.fn().mockReturnValue(mockQuery),
        };

        mockMongoose = {
            model: jest.fn().mockReturnValue(mockModel),
        };

        service = new GymOwnerService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createGymOwner", () => {
        it("should create a gym owner", async () => {
            const data: any = { name: "Owner 1" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createGymOwner(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllGymOwners", () => {
        it("should return all gym owners", async () => {
            const data = [{ id: "1" }];
            (mockModel.find().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getAllGymOwners();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getGymOwnerById", () => {
        it("should return a gym owner by id", async () => {
            const data = { id: "1" };
            (mockModel.findOne().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getGymOwnerById("1");

            expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "1" });
            expect(result).toEqual(data);
        });
    });

    describe("updateGymOwner", () => {
        it("should update a gym owner", async () => {
            const id = "1";
            const updateData: any = { name: "Updated Owner" };
            const updatedData = { id: "1", ...updateData };
            (mockModel.findByIdAndUpdate().exec as jest.Mock).mockResolvedValue(updatedData);

            const result = await service.updateGymOwner(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteGymOwner", () => {
        it("should delete a gym owner", async () => {
            const id = "1";
            (mockModel.findByIdAndDelete().exec as jest.Mock).mockResolvedValue(null);

            await service.deleteGymOwner(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });
});
