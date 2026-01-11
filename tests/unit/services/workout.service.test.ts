import { WorkoutService } from "../../../src/services/mongoose/services/workout.service";
import { Mongoose } from "mongoose";
import { Visibility } from "../../../src/types";

describe("WorkoutService", () => {
    let service: WorkoutService;
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

        service = new WorkoutService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createWorkout", () => {
        it("should create a workout", async () => {
            const data: any = {
                name: "Monday Cardio",
                description: "A cardio workout",
                creatorId: "creator1",
                difficulty: "medium",
            };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createWorkout(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllWorkouts", () => {
        it("should return all workouts", async () => {
            const data = [
                { id: "1", name: "Monday Cardio", difficulty: "medium" },
                { id: "2", name: "Tuesday Strength", difficulty: "hard" },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllWorkouts();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getWorkoutById", () => {
        it("should return a workout by id", async () => {
            const data = { id: "1", name: "Monday Cardio", difficulty: "medium" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getWorkoutById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("updateWorkout", () => {
        it("should update a workout", async () => {
            const id = "1";
            const updateData: any = { difficulty: "hard" };
            const updatedData = { id: "1", name: "Monday Cardio", ...updateData };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateWorkout(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteWorkout", () => {
        it("should delete a workout", async () => {
            const id = "1";
            mockModel.findByIdAndDelete.mockResolvedValue(null);

            await service.deleteWorkout(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getWorkoutsByCreator", () => {
        it("should return workouts by creator", async () => {
            const creatorId = "creator1";
            const data = [{ id: "1", name: "Monday Cardio", creatorId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getWorkoutsByCreator(creatorId);

            expect(mockModel.find).toHaveBeenCalledWith({ creatorId });
            expect(result).toEqual(data);
        });
    });

    describe("getWorkoutsByGym", () => {
        it("should return workouts by gym", async () => {
            const gymId = "gym1";
            const data = [{ id: "1", name: "Monday Cardio", gymId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getWorkoutsByGym(gymId);

            expect(mockModel.find).toHaveBeenCalledWith({ gymId });
            expect(result).toEqual(data);
        });
    });

    describe("getPublicWorkouts", () => {
        it("should return public workouts", async () => {
            const data = [
                {
                    id: "1",
                    name: "Monday Cardio",
                    visibility: Visibility.PUBLIC,
                    isActive: true,
                },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getPublicWorkouts();

            expect(mockModel.find).toHaveBeenCalledWith({
                visibility: Visibility.PUBLIC,
                isActive: true,
            });
            expect(result).toEqual(data);
        });
    });

    describe("getWorkoutsWithFilters", () => {
        it("should return workouts matching filters", async () => {
            const filters = { difficulty: "medium", gymId: "gym1" };
            const data = [
                {
                    id: "1",
                    name: "Monday Cardio",
                    difficulty: "medium",
                    gymId: "gym1",
                    isActive: true,
                },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getWorkoutsWithFilters(filters);

            expect(mockModel.find).toHaveBeenCalledWith({
                isActive: true,
                difficulty: "medium",
                gymId: "gym1",
            });
            expect(result).toEqual(data);
        });
    });
});
