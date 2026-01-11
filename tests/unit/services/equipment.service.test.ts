import { EquipmentService } from "../../../src/services/mongoose/services/equipment.service";
import { Mongoose } from "mongoose";

describe("EquipmentService", () => {
    let service: EquipmentService;
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

        service = new EquipmentService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createEquipment", () => {
        it("should create equipment", async () => {
            const data: any = { name: "Dumbbell", weight: 10, gymId: "gym1" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createEquipment(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllEquipment", () => {
        it("should return all equipment", async () => {
            const data = [
                { id: "1", name: "Dumbbell", weight: 10 },
                { id: "2", name: "Barbell", weight: 20 },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllEquipment();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getEquipmentById", () => {
        it("should return equipment by id", async () => {
            const data = { id: "1", name: "Dumbbell", weight: 10 };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getEquipmentById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("updateEquipment", () => {
        it("should update equipment", async () => {
            const id = "1";
            const updateData: any = { weight: 15 };
            const updatedData = { id: "1", name: "Dumbbell", ...updateData };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateEquipment(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteEquipment", () => {
        it("should delete equipment", async () => {
            const id = "1";
            mockModel.findByIdAndDelete.mockResolvedValue(null);

            await service.deleteEquipment(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getEquipmentByGym", () => {
        it("should return equipment by gym", async () => {
            const gymId = "gym1";
            const data = [{ id: "1", name: "Dumbbell", gymId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getEquipmentByGym(gymId);

            expect(mockModel.find).toHaveBeenCalledWith({ gymId });
            expect(result).toEqual(data);
        });
    });

    describe("getEquipmentByCategory", () => {
        it("should return equipment by category", async () => {
            const categoryId = "cat1";
            const data = [{ id: "1", name: "Dumbbell", categoryId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getEquipmentByCategory(categoryId);

            expect(mockModel.find).toHaveBeenCalledWith({ categoryId });
            expect(result).toEqual(data);
        });
    });

    describe("getEquipmentByGymAndCategory", () => {
        it("should return equipment by gym and category", async () => {
            const gymId = "gym1";
            const categoryId = "cat1";
            const data = [{ id: "1", name: "Dumbbell", gymId, categoryId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getEquipmentByGymAndCategory(gymId, categoryId);

            expect(mockModel.find).toHaveBeenCalledWith({ gymId, categoryId });
            expect(result).toEqual(data);
        });
    });

    describe("getAvailableEquipmentByGym", () => {
        it("should return available equipment by gym", async () => {
            const gymId = "gym1";
            const data = [{ id: "1", name: "Dumbbell", gymId, isAvailable: true }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAvailableEquipmentByGym(gymId);

            expect(mockModel.find).toHaveBeenCalledWith({ gymId, isAvailable: true });
            expect(result).toEqual(data);
        });
    });
});
