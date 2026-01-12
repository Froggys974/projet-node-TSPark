import { ChallengeService } from "../../../src/services/mongoose/services/challenge.service";
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

describe("ChallengeService", () => {
  let service: ChallengeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ChallengeService(mockMongoose);
  });

  describe("createChallenge", () => {
    it("should create a challenge", async () => {
      const data = { name: "Run" };
      const created = { ...data, _id: "123" };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createChallenge(data as any);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe("getAllChallenges", () => {
    it("should return all challenges", async () => {
      const items = [{ name: "Run" }];
      mockExec.mockResolvedValue(items);

      const result = await service.getAllChallenges();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual(items);
    });
  });

  describe("getChallengeById", () => {
    it("should return a challenge by id", async () => {
      const item = { _id: "123", name: "Run" };
      mockExec.mockResolvedValue(item);

      const result = await service.getChallengeById("123");

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toEqual(item);
    });
  });

  describe("updateChallenge", () => {
    it("should update a challenge", async () => {
      const updateData = { name: "Sprint" };
      const updated = { _id: "123", ...updateData };
      mockExec.mockResolvedValue(updated);

      const result = await service.updateChallenge("123", updateData as any);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", updateData, { new: true });
      expect(result).toEqual(updated);
    });
  });

  describe("deleteChallenge", () => {
    it("should delete a challenge", async () => {
      mockExec.mockResolvedValue(null);
      await service.deleteChallenge("123");
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });
});
