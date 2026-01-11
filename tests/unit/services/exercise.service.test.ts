import { ExerciseService } from "../../../src/services/mongoose/services/exercise.service";
import { Mongoose } from "mongoose";
import { ExerciseStatus, Visibility } from "../../../src/types";

describe("ExerciseService", () => {
    let service: ExerciseService;
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

        service = new ExerciseService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createExercise", () => {
        it("should create an exercise", async () => {
            const data: any = {
                name: "Push-up",
                description: "A basic push-up exercise",
                categoryId: "cat1",
                difficulty: "easy",
            };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createExercise(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllExercises", () => {
        it("should return all exercises", async () => {
            const data = [
                { id: "1", name: "Push-up", difficulty: "easy" },
                { id: "2", name: "Pull-up", difficulty: "medium" },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllExercises();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getExerciseById", () => {
        it("should return an exercise by id", async () => {
            const data = { id: "1", name: "Push-up", difficulty: "easy" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getExerciseById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("updateExercise", () => {
        it("should update an exercise", async () => {
            const id = "1";
            const updateData: any = { difficulty: "medium" };
            const updatedData = { id: "1", name: "Push-up", ...updateData };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateExercise(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteExercise", () => {
        it("should delete an exercise", async () => {
            const id = "1";
            mockModel.findByIdAndDelete.mockResolvedValue(null);

            await service.deleteExercise(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getExercisesByCreator", () => {
        it("should return exercises by creator", async () => {
            const creatorId = "creator1";
            const data = [{ id: "1", name: "Push-up", creatorId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getExercisesByCreator(creatorId);

            expect(mockModel.find).toHaveBeenCalledWith({ creatorId });
            expect(result).toEqual(data);
        });
    });

    describe("getExercisesByCategory", () => {
        it("should return exercises by category", async () => {
            const categoryId = "cat1";
            const data = [{ id: "1", name: "Push-up", categoryId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getExercisesByCategory(categoryId);

            expect(mockModel.find).toHaveBeenCalledWith({ categoryId });
            expect(result).toEqual(data);
        });
    });

    describe("getPublicExercises", () => {
        it("should return public exercises", async () => {
            const data = [
                {
                    id: "1",
                    name: "Push-up",
                    visibility: Visibility.PUBLIC,
                    status: ExerciseStatus.OFFICIAL,
                },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getPublicExercises();

            expect(mockModel.find).toHaveBeenCalledWith({
                visibility: Visibility.PUBLIC,
                status: ExerciseStatus.OFFICIAL,
            });
            expect(result).toEqual(data);
        });
    });

    describe("getExercisesWithFilters", () => {
        it("should return exercises matching filters", async () => {
            const filters = { categoryId: "cat1", difficulty: "easy" };
            const data = [{ id: "1", name: "Push-up", categoryId: "cat1", difficulty: "easy" }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getExercisesWithFilters(filters);

            expect(mockModel.find).toHaveBeenCalledWith({ categoryId: "cat1", difficulty: "easy" });
            expect(result).toEqual(data);
        });
    });
});
