import { ExerciseTypeService } from "../../../src/services/mongoose/services/exerciseType.service";
import { Mongoose } from "mongoose";

describe("ExerciseTypeService", () => {
    let service: ExerciseTypeService;
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

        service = new ExerciseTypeService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createExerciseType", () => {
        it("should create an exercise type", async () => {
            const data: any = { name: "Push ups" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createExerciseType(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllExerciseTypes", () => {
        it("should return all exercise types", async () => {
            const data = [{ id: "1" }];
            (mockModel.find().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getAllExerciseTypes();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getExerciseTypeById", () => {
        it("should return an exercise type by id", async () => {
            const data = { id: "1" };
            (mockModel.findOne().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getExerciseTypeById("1");

            expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "1" });
            expect(result).toEqual(data);
        });
    });

    describe("updateExerciseType", () => {
        it("should update an exercise type", async () => {
            const id = "1";
            const updateData: any = { name: "Pull ups" };
            const updatedData = { id: "1", ...updateData };
            (mockModel.findByIdAndUpdate().exec as jest.Mock).mockResolvedValue(updatedData);

            const result = await service.updateExerciseType(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteExerciseType", () => {
        it("should delete an exercise type", async () => {
            const id = "1";
            (mockModel.findByIdAndDelete().exec as jest.Mock).mockResolvedValue(null);

            await service.deleteExerciseType(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getExerciseTypesByCategory", () => {
        it("should return exercise types by category", async () => {
            const category = "Strength";
            const data = [{ id: "1", category }];
            (mockModel.find().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getExerciseTypesByCategory(category);

            expect(mockModel.find).toHaveBeenCalledWith({ category: category });
            expect(result).toEqual(data);
        });
    });
});
