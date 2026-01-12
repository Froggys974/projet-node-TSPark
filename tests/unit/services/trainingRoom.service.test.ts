import { TrainingRoomService } from "../../../src/services/mongoose/services/trainingRoom.service";
import { Mongoose } from "mongoose";

const mockExec = jest.fn();

const mockModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnValue({ exec: mockExec }),
  findOne: jest.fn().mockReturnValue({ exec: mockExec }),
  findByIdAndUpdate: jest.fn().mockReturnValue({ exec: mockExec }),
  findByIdAndDelete: jest.fn().mockReturnValue({ exec: mockExec }),
};

const mockMongoose = {
  model: jest.fn().mockReturnValue(mockModel),
} as unknown as Mongoose;

describe("TrainingRoomService", () => {
  let service: TrainingRoomService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TrainingRoomService(mockMongoose);
  });

  describe("createTrainingRoom", () => {
    it("should create a training room", async () => {
      const data = { name: "Room 1", capacity: 10 };
      const created = { ...data, _id: "123" };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createTrainingRoom(data as any);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe("getAllTrainingRooms", () => {
    it("should return all training rooms", async () => {
      const items = [{ name: "Room 1" }];
      mockExec.mockResolvedValue(items);

      const result = await service.getAllTrainingRooms();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual(items);
    });
  });

  describe("getTrainingRoomById", () => {
    it("should return a training room by id", async () => {
      const item = { _id: "123", name: "Room 1" };
      mockExec.mockResolvedValue(item);

      const result = await service.getTrainingRoomById("123");

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toEqual(item);
    });
  });

  describe("updateTrainingRoom", () => {
    it("should update a training room", async () => {
      const updateData = { name: "Room Updated" };
      const updated = { _id: "123", ...updateData };
      mockExec.mockResolvedValue(updated);

      const result = await service.updateTrainingRoom("123", updateData as any);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", updateData, { new: true });
      expect(result).toEqual(updated);
    });
  });

  describe("deleteTrainingRoom", () => {
    it("should delete a training room", async () => {
      mockExec.mockResolvedValue(null);
      await service.deleteTrainingRoom("123");
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });
});
