import { BadgeService } from "../../../src/services/mongoose/services/badge.service";
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

describe("BadgeService", () => {
  let service: BadgeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BadgeService(mockMongoose);
  });

  describe("createBadge", () => {
    it("should create a badge", async () => {
      const data = { name: "Gold", image: "img.png" };
      const created = { ...data, _id: "123" };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createBadge(data);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe("getAllBadges", () => {
    it("should return all badges", async () => {
      const items = [{ name: "Gold" }];
      mockExec.mockResolvedValue(items);

      const result = await service.getAllBadges();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual(items);
    });
  });

  describe("getBadgeById", () => {
    it("should return a badge by id", async () => {
      const item = { _id: "123", name: "Gold" };
      mockExec.mockResolvedValue(item);

      const result = await service.getBadgeById("123");

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toEqual(item);
    });
  });

  describe("updateBadge", () => {
    it("should update a badge", async () => {
      const updateData = { name: "Silver" };
      const updated = { _id: "123", ...updateData };
      mockExec.mockResolvedValue(updated);

      const result = await service.updateBadge("123", updateData as any);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", updateData, { new: true });
      expect(result).toEqual(updated);
    });
  });

  describe("deleteBadge", () => {
    it("should delete a badge", async () => {
      mockExec.mockResolvedValue(null);
      await service.deleteBadge("123");
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });
});
