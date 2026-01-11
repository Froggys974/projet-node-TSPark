import { WorkoutStepService } from "../../../src/services/mongoose/services/workoutStep.service";
import { Mongoose } from "mongoose";

describe("WorkoutStepService", () => {
    let service: WorkoutStepService;
    let mockMongoose: Partial<Mongoose>;
    let mockModel: any;

    beforeEach(() => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
        };

        mockModel = {
            create: jest.fn(),
            find: jest.fn().mockReturnValue(mockQuery),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            deleteMany: jest.fn(),
        };

        mockMongoose = {
            model: jest.fn().mockReturnValue(mockModel),
        };

        service = new WorkoutStepService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createWorkoutStep", () => {
        it("should create a workout step", async () => {
            const data: any = {
                workoutId: "workout1",
                exerciseId: "exercise1",
                order: 1,
                reps: 10,
            };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createWorkoutStep(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllWorkoutSteps", () => {
        it("should return all workout steps", async () => {
            const data = [
                { id: "1", workoutId: "workout1", exerciseId: "exercise1", order: 1 },
                { id: "2", workoutId: "workout1", exerciseId: "exercise2", order: 2 },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllWorkoutSteps();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getWorkoutStepById", () => {
        it("should return a workout step by id", async () => {
            const data = { id: "1", workoutId: "workout1", exerciseId: "exercise1" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getWorkoutStepById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("updateWorkoutStep", () => {
        it("should update a workout step", async () => {
            const id = "1";
            const updateData: any = { reps: 12 };
            const updatedData = { id: "1", workoutId: "workout1", ...updateData };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateWorkoutStep(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteWorkoutStep", () => {
        it("should delete a workout step", async () => {
            const id = "1";
            mockModel.findByIdAndDelete.mockResolvedValue(null);

            await service.deleteWorkoutStep(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getStepsByWorkout", () => {
        it("should return steps by workout", async () => {
            const workoutId = "workout1";
            const data = [
                { id: "1", workoutId, exerciseId: "exercise1", order: 1 },
                { id: "2", workoutId, exerciseId: "exercise2", order: 2 },
            ];
            const mockQuery = {
                sort: jest.fn().mockResolvedValue(data),
            };
            mockModel.find.mockReturnValue(mockQuery);

            const result = await service.getStepsByWorkout(workoutId);

            expect(mockModel.find).toHaveBeenCalledWith({ workoutId });
            expect(result).toEqual(data);
        });
    });

    describe("deleteStepsByWorkout", () => {
        it("should delete all steps for a workout", async () => {
            const workoutId = "workout1";
            mockModel.deleteMany.mockResolvedValue({ deletedCount: 2 });

            await service.deleteStepsByWorkout(workoutId);

            expect(mockModel.deleteMany).toHaveBeenCalledWith({ workoutId });
        });
    });

    describe("reorderSteps", () => {
        it("should reorder steps in a workout", async () => {
            const workoutId = "workout1";
            const stepIds = ["step1", "step2", "step3"];
            mockModel.findByIdAndUpdate.mockResolvedValue({});

            await service.reorderSteps(workoutId, stepIds);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledTimes(3);
            expect(mockModel.findByIdAndUpdate).toHaveBeenNthCalledWith(1, "step1", { order: 1 });
            expect(mockModel.findByIdAndUpdate).toHaveBeenNthCalledWith(2, "step2", { order: 2 });
            expect(mockModel.findByIdAndUpdate).toHaveBeenNthCalledWith(3, "step3", { order: 3 });
        });
    });
});
