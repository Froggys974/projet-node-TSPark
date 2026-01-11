import { UserService } from "../../../src/services/mongoose/services/user.service";
import { Mongoose } from "mongoose";

describe("UserService", () => {
    let service: UserService;
    let mockMongoose: Partial<Mongoose>;
    let mockModel: any;

    beforeEach(() => {
        mockModel = {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            countDocuments: jest.fn(),
        };

        mockMongoose = {
            model: jest.fn().mockReturnValue(mockModel),
        };

        service = new UserService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createUser", () => {
        it("should create a user", async () => {
            const data: any = { email: "test@test.com", password: "hashed", role: "user" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createUser(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllUsers", () => {
        it("should return all users", async () => {
            const data = [{ id: "1", email: "user1@test.com" }, { id: "2", email: "user2@test.com" }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllUsers();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getUserById", () => {
        it("should return a user by id", async () => {
            const data = { id: "1", email: "user1@test.com" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getUserById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("getUserByEmail", () => {
        it("should return a user by email", async () => {
            const data = { id: "1", email: "test@test.com" };
            mockModel.findOne.mockResolvedValue(data);

            const result = await service.getUserByEmail("test@test.com");

            expect(mockModel.findOne).toHaveBeenCalledWith({ email: "test@test.com" });
            expect(result).toEqual(data);
        });
    });

    describe("isEmpty", () => {
        it("should return true if no users exist", async () => {
            mockModel.countDocuments.mockResolvedValue(0);

            const result = await service.isEmpty();

            expect(mockModel.countDocuments).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it("should return false if users exist", async () => {
            mockModel.countDocuments.mockResolvedValue(1);

            const result = await service.isEmpty();

            expect(mockModel.countDocuments).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });
});
