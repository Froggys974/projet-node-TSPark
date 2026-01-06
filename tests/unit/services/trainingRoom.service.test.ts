import { TrainingRoomService } from "../../../src/services/mongoose/services/trainingRoom.service";
import { Mongoose } from "mongoose";

describe("TrainingRoomService", () => {
    let service: TrainingRoomService;
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

        service = new TrainingRoomService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createTrainingRoom", () => {
        it("should create a training room", async () => {
            const data: any = { name: "Room 1" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createTrainingRoom(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllTrainingRooms", () => {
        it("should return all training rooms", async () => {
            const data = [{ id: "1" }];
            (mockModel.find().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getAllTrainingRooms();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getTrainingRoomById", () => {
        it("should return a training room by id", async () => {
            const data = { id: "1" };
            (mockModel.findOne().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getTrainingRoomById("1");

            expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "1" });
            expect(result).toEqual(data);
        });
    });

    describe("updateTrainingRoom", () => {
        it("should update a training room", async () => {
            const id = "1";
            const updateData: any = { name: "Updated Room" };
            const updatedData = { id: "1", ...updateData };
            (mockModel.findByIdAndUpdate().exec as jest.Mock).mockResolvedValue(updatedData);

            const result = await service.updateTrainingRoom(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteTrainingRoom", () => {
        it("should delete a training room", async () => {
            const id = "1";
            (mockModel.findByIdAndDelete().exec as jest.Mock).mockResolvedValue(null);

            await service.deleteTrainingRoom(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getTrainingRoomsByOwner", () => {
        it("should return training rooms by owner", async () => {
            const ownerId = "owner1";
            const data = [{ id: "1", ownerId }];
            (mockModel.find().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getTrainingRoomsByOwner(ownerId);

            expect(mockModel.find).toHaveBeenCalledWith({ ownerId: ownerId });
            expect(result).toEqual(data);
        });
    });

    describe("approveTrainingRoom", () => {
        it("should approve a training room", async () => {
            const id = "1";
            const updatedData = { id, isApproved: true };
            (mockModel.findByIdAndUpdate().exec as jest.Mock).mockResolvedValue(updatedData);

            const result = await service.approveTrainingRoom(id);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, { isApproved: true }, { new: true });
            expect(result).toEqual(updatedData);
        });
    });
});
