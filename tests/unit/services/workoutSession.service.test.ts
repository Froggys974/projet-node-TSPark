import { WorkoutSessionService } from "../../../src/services/mongoose/services/workoutSession.service";
import { Mongoose } from "mongoose";
import { SessionStatus } from "../../../src/types";

describe("WorkoutSessionService", () => {
    let service: WorkoutSessionService;
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
        };

        mockMongoose = {
            model: jest.fn().mockReturnValue(mockModel),
        };

        service = new WorkoutSessionService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createWorkoutSession", () => {
        it("should create a workout session", async () => {
            const data: any = {
                userId: "user1",
                workoutId: "workout1",
                sessionDate: new Date(),
            };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createWorkoutSession(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllWorkoutSessions", () => {
        it("should return all workout sessions", async () => {
            const data = [
                { id: "1", userId: "user1", workoutId: "workout1" },
                { id: "2", userId: "user2", workoutId: "workout2" },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllWorkoutSessions();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getWorkoutSessionById", () => {
        it("should return a workout session by id", async () => {
            const data = { id: "1", userId: "user1", workoutId: "workout1" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getWorkoutSessionById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("updateWorkoutSession", () => {
        it("should update a workout session", async () => {
            const id = "1";
            const updateData: any = { status: SessionStatus.IN_PROGRESS };
            const updatedData = { id: "1", userId: "user1", ...updateData };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateWorkoutSession(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteWorkoutSession", () => {
        it("should delete a workout session", async () => {
            const id = "1";
            mockModel.findByIdAndDelete.mockResolvedValue(null);

            await service.deleteWorkoutSession(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getSessionsByUser", () => {
        it("should return sessions by user", async () => {
            const userId = "user1";
            const data = [{ id: "1", userId, workoutId: "workout1" }];
            const mockQuery = {
                sort: jest.fn().mockResolvedValue(data),
            };
            mockModel.find.mockReturnValue(mockQuery);

            const result = await service.getSessionsByUser(userId);

            expect(mockModel.find).toHaveBeenCalledWith({ userId });
            expect(result).toEqual(data);
        });
    });

    describe("getSessionsByWorkout", () => {
        it("should return sessions by workout", async () => {
            const workoutId = "workout1";
            const data = [{ id: "1", userId: "user1", workoutId }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getSessionsByWorkout(workoutId);

            expect(mockModel.find).toHaveBeenCalledWith({ workoutId });
            expect(result).toEqual(data);
        });
    });

    describe("getSessionsByStatus", () => {
        it("should return sessions by status", async () => {
            const status = SessionStatus.COMPLETED;
            const data = [
                { id: "1", userId: "user1", workoutId: "workout1", status },
            ];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getSessionsByStatus(status);

            expect(mockModel.find).toHaveBeenCalledWith({ status });
            expect(result).toEqual(data);
        });
    });

    describe("getUserSessionsByDateRange", () => {
        it("should return user sessions in date range", async () => {
            const userId = "user1";
            const startDate = new Date("2024-01-01");
            const endDate = new Date("2024-01-31");
            const data = [{ id: "1", userId, workoutId: "workout1" }];
            const mockQuery = {
                sort: jest.fn().mockResolvedValue(data),
            };
            mockModel.find.mockReturnValue(mockQuery);

            const result = await service.getUserSessionsByDateRange(userId, startDate, endDate);

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("completeSession", () => {
        it("should complete a session", async () => {
            const id = "1";
            const sessionData = {
                _id: id,
                userId: "user1",
                workoutId: "workout1",
                startedAt: new Date(Date.now() - 3600000),
            };
            mockModel.findById.mockResolvedValueOnce(sessionData);
            const completedData = {
                ...sessionData,
                status: SessionStatus.COMPLETED,
                completedAt: expect.any(Date),
                actualDuration: expect.any(Number),
            };
            mockModel.findByIdAndUpdate.mockResolvedValue(completedData);

            const result = await service.completeSession(id);

            expect(mockModel.findById).toHaveBeenCalledWith(id);
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result?.status).toEqual(SessionStatus.COMPLETED);
        });
    });

    describe("startSession", () => {
        it("should start a session", async () => {
            const id = "1";
            const updatedData = {
                id: "1",
                userId: "user1",
                status: SessionStatus.IN_PROGRESS,
                startedAt: expect.any(Date),
            };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.startSession(id);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result?.status).toEqual(SessionStatus.IN_PROGRESS);
        });
    });

    describe("abandonSession", () => {
        it("should abandon a session", async () => {
            const id = "1";
            const updatedData = {
                id: "1",
                userId: "user1",
                status: SessionStatus.ABANDONED,
            };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.abandonSession(id);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result?.status).toEqual(SessionStatus.ABANDONED);
        });
    });

    describe("updateCalories", () => {
        it("should update calories for a session", async () => {
            const id = "1";
            const sessionData = {
                _id: id,
                userId: "user1",
                weight: 70,
                duration: 60,
            };
            const workoutData = { difficulty: "medium" };
            const stepsData: any[] = [];

            mockModel.findById.mockResolvedValueOnce(sessionData);
            const updatedData = {
                ...sessionData,
                caloriesBurned: expect.any(Number),
            };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateCalories(id, workoutData, stepsData);

            expect(mockModel.findById).toHaveBeenCalledWith(id);
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
});
