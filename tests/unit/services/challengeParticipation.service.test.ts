import { ChallengeParticipationService } from "../../../src/services/mongoose/services/challengeParticipation.service";
import { Mongoose } from "mongoose";

const mockExec = jest.fn();

// Create a query mock object that supports chaining
const mockQuery = {
  populate: jest.fn().mockReturnThis(), // Return self for chaining
  exec: mockExec
};

const mockModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnValue(mockQuery),
  findOne: jest.fn().mockReturnValue(mockQuery),
  findByIdAndUpdate: jest.fn().mockReturnValue({ exec: mockExec }),
  findByIdAndDelete: jest.fn().mockReturnValue({ exec: mockExec }),
};

const mockMongoose = {
  model: jest.fn().mockReturnValue(mockModel),
} as unknown as Mongoose;

describe("ChallengeParticipationService", () => {
  let service: ChallengeParticipationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ChallengeParticipationService(mockMongoose);
  });

  describe("createChallengeParticipation", () => {
    it("should create a participation", async () => {
      const data = { gymOwner: "go1", user: "u1" };
      const created = { ...data, _id: "123" };
      mockModel.create.mockResolvedValue(created);

      const result = await service.createChallengeParticipation(data as any);

      expect(mockModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe("getAllChallengeParticipations", () => {
    it("should return all participations", async () => {
      const items = [{ _id: "123" }];
      mockExec.mockResolvedValue(items);

      const result = await service.getAllChallengeParticipations();

      expect(mockModel.find).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual(items);
    });
  });

  describe("getChallengeParticipationById", () => {
    it("should return a participation by id", async () => {
      const item = { _id: "123" };
      mockExec.mockResolvedValue(item);

      const result = await service.getChallengeParticipationById("123");

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toEqual(item);
    });
  });

  describe("updateChallengeParticipation", () => {
    it("should update a participation", async () => {
      const updateData = { status: "Done" };
      const updated = { _id: "123", ...updateData };
      mockExec.mockResolvedValue(updated);

      const result = await service.updateChallengeParticipation("123", updateData as any);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", updateData, { new: true });
      expect(result).toEqual(updated);
    });
  });

  describe("deleteChallengeParticipation", () => {
    it("should delete a participation", async () => {
      mockExec.mockResolvedValue(null);
      await service.deleteChallengeParticipation("123");
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });

  describe("getParticipationsForGymOwner", () => {
    it("should return participations for a gym owner with populated field", async () => {
      const items = [{ _id: "p1", gymOwner: "g1" }];
      mockExec.mockResolvedValue(items);

      const result = await service.getParticipationsForGymOwner("g1");

      expect(mockModel.find).toHaveBeenCalledWith({ gymOwner: "g1" });
      expect(mockQuery.populate).toHaveBeenCalledWith("gymOwner");
      expect(result).toEqual(items);
    });
  });

  describe("getParticipationsForUser", () => {
    it("should return participations for a user with populated field", async () => {
      const items = [{ _id: "p1", user: "u1" }];
      mockExec.mockResolvedValue(items);

      const result = await service.getParticipationsForUser("u1");

      expect(mockModel.find).toHaveBeenCalledWith({ user: "u1" });
      expect(mockQuery.populate).toHaveBeenCalledWith("user");
      expect(result).toEqual(items);
    });
  });

  describe("getParticipationsForChallengeForDate", () => {
    it("should return participation for challenge and date", async () => {
      const date = new Date("2023-01-01");
      const item = { _id: "p1" };
      mockExec.mockResolvedValue(item);

      const result = await service.getParticipationsForChallengeForDate("c1", date);

      expect(mockModel.findOne).toHaveBeenCalledWith({
        challengeId: "c1",
        startDate: date
      });
      expect(result).toEqual(item);
    });
  });
});
