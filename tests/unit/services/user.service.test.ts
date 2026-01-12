import { UserService } from "../../../src/services/mongoose/services/user.service";
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

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(mockMongoose);
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      const userData = { email: "test@test.com", password: "pwd", name: "Test" };
      const createdUser = { ...userData, _id: "123" };
      mockModel.create.mockResolvedValue(createdUser);

      const result = await service.createUser(userData);

      expect(mockModel.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const users = [{ name: "Test" }];
      mockExec.mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(mockModel.find).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe("getUserById", () => {
    it("should return a user by id", async () => {
      const user = { _id: "123", name: "Test" };
      mockExec.mockResolvedValue(user);

      const result = await service.getUserById("123");

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toEqual(user);
    });

    it("should return null if not found", async () => {
      mockExec.mockResolvedValue(null);
      const result = await service.getUserById("999");
      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const updateData = { name: "Updated" };
      const updatedUser = { _id: "123", ...updateData };
      mockExec.mockResolvedValue(updatedUser);

      // Note: UserService uses findByIdAndUpdate(id, data, { new: true })
      const result = await service.updateUser("123", updateData as any);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", updateData, { new: true });
      expect(result).toEqual(updatedUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      mockExec.mockResolvedValue(null); // findByIdAndDelete usually returns the doc or null

      await service.deleteUser("123");

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("123");
    });
  });
});
