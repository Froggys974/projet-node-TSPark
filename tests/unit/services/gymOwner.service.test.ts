import { GymOwnerService } from "../../../src/services/mongoose/services/gymOwner.service";
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

describe("GymOwnerService", () => {
  let service: GymOwnerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GymOwnerService(mockMongoose);
  });

  describe("createGymOwner", () => {
    it("should create a gym owner", async () => {
      const data = { name: "Owner 1", email: "owner@test.com", password: "pwd" };
      const created = { ...data, _id: "123" };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createGymOwner(data);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe("getAllGymOwners", () => {
    it("should return all gym owners", async () => {
      const items = [{ name: "Owner 1" }];
      mockExec.mockResolvedValue(items);

      const result = await service.getAllGymOwners();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual(items);
    });
  });

  describe("getGymOwnerById", () => {
    it("should return a gym owner by id", async () => {
      const item = { _id: "123", name: "Owner 1" };
      mockExec.mockResolvedValue(item);

      const result = await service.getGymOwnerById("123");

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toEqual(item);
    });
  });

  describe("updateGymOwner", () => {
    it("should update a gym owner", async () => {
      const updateData = { name: "Owner Updated" };
      const updated = { _id: "123", ...updateData };
      mockExec.mockResolvedValue(updated);

      const result = await service.updateGymOwner("123", updateData as any);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", updateData, { new: true });
      expect(result).toEqual(updated);
    });
  });

  describe("deleteGymOwner", () => {
    it("should delete a gym owner", async () => {
      mockExec.mockResolvedValue(null);
      await service.deleteGymOwner("123");
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });
});
