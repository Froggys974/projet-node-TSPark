import { ExerciseCategoryService } from "../../../src/services/mongoose/services/exerciseCategory.service";
import { Mongoose } from "mongoose";

describe("ExerciseCategoryService", () => {
    let service: ExerciseCategoryService;
    let mockMongoose: Partial<Mongoose>;
    let mockModel: any;

    beforeEach(() => {
        mockModel = {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
        };

        mockMongoose = {
            model: jest.fn().mockReturnValue(mockModel),
        };

        service = new ExerciseCategoryService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createExerciseCategory", () => {
        it("should create an exercise category", async () => {
            const data: any = { name: "Strength", slug: "strength" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createExerciseCategory(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllExerciseCategories", () => {
        it("should return all exercise categories", async () => {
            const data = [
                { id: "1", name: "Strength", slug: "strength" },
                { id: "2", name: "Cardio", slug: "cardio" },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllExerciseCategories();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getExerciseCategoryById", () => {
        it("should return an exercise category by id", async () => {
            const data = { id: "1", name: "Strength", slug: "strength" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getExerciseCategoryById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("getExerciseCategoryBySlug", () => {
        it("should return an exercise category by slug", async () => {
            const data = { id: "1", name: "Strength", slug: "strength" };
            mockModel.findOne.mockResolvedValue(data);

            const result = await service.getExerciseCategoryBySlug("strength");

            expect(mockModel.findOne).toHaveBeenCalledWith({ slug: "strength" });
            expect(result).toEqual(data);
        });
    });

    describe("updateExerciseCategory", () => {
        it("should update an exercise category", async () => {
            const id = "1";
            const updateData: any = { name: "Updated Strength" };
            const updatedData = { id: "1", ...updateData, slug: "strength" };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateExerciseCategory(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteExerciseCategory", () => {
        it("should delete an exercise category", async () => {
            const id = "1";
            mockModel.findByIdAndDelete.mockResolvedValue(null);

            await service.deleteExerciseCategory(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });
});
