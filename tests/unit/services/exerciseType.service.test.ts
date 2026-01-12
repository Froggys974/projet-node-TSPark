import { ExerciseTypeService } from "../../../src/services/mongoose/services/exerciseType.service";
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

describe("ExerciseTypeService", () => {
  let service: ExerciseTypeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExerciseTypeService(mockMongoose);
  });

  describe("createExerciseType", () => {
    it("should create an exercise type", async () => {
      const data = { name: "Cardio" };
      const created = { ...data, _id: "123" };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createExerciseType(data);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe("getAllExerciseTypes", () => {
    it("should return all exercise types", async () => {
      const items = [{ name: "Cardio" }];
      mockExec.mockResolvedValue(items);

      const result = await service.getAllExerciseTypes();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual(items);
    });
  });

  describe("getExerciseTypeById", () => {
    it("should return an exercise type by id", async () => {
      const item = { _id: "123", name: "Cardio" };
      mockExec.mockResolvedValue(item);

      const result = await service.getExerciseTypeById("123");

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toEqual(item);
    });
  });

  describe("updateExerciseType", () => {
    it("should update an exercise type", async () => {
      const updateData = { name: "Strength" };
      const updated = { _id: "123", ...updateData };
      mockExec.mockResolvedValue(updated);

      const result = await service.updateExerciseType("123", updateData);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", updateData, { new: true });
      expect(result).toEqual(updated);
    });
  });

  describe("deleteExerciseType", () => {
    it("should delete an exercise type", async () => {
      mockExec.mockResolvedValue(null);
      await service.deleteExerciseType("123");
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });
});
