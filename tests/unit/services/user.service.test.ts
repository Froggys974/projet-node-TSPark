import { UserService } from "../../../src/services/mongoose/services/user.service";
import { Mongoose } from "mongoose";

describe("UserService", () => {
    let service: UserService;
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

        service = new UserService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createUser", () => {
        it("should create a user", async () => {
            const data: any = { name: "User 1" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createUser(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllUsers", () => {
        it("should return all users", async () => {
            const data = [{ id: "1" }];
            (mockModel.find().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getAllUsers();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getUserById", () => {
        it("should return a user by id", async () => {
            const data = { id: "1" };
            (mockModel.findOne().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getUserById("1");

            expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "1" });
            expect(result).toEqual(data);
        });
    });

    describe("updateUser", () => {
        it("should update a user", async () => {
            const id = "1";
            const updateData: any = { name: "Updated User" };
            const updatedData = { id: "1", ...updateData };
            (mockModel.findByIdAndUpdate().exec as jest.Mock).mockResolvedValue(updatedData);

            const result = await service.updateUser(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteUser", () => {
        it("should delete a user", async () => {
            const id = "1";
            (mockModel.findByIdAndDelete().exec as jest.Mock).mockResolvedValue(null);

            await service.deleteUser(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });
});
