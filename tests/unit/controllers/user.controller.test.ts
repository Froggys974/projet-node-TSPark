import { UserController } from "../../../src/controllers/user.controller";
import { UserService } from "../../../src/services/mongoose/services/user.service";
import { ChallengeParticipationService } from "../../../src/services/mongoose/services/challengeParticipation.service";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";

jest.mock("../../../src/services/mongoose/services/user.service");
jest.mock("../../../src/services/mongoose/services/challengeParticipation.service");
jest.mock("../../../src/middlewares/auth.middleware");

describe("UserController", () => {
    let userController: UserController;
    let userService: jest.Mocked<UserService>;
    let challengeParticipationService: jest.Mocked<ChallengeParticipationService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: any;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let endMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        userService = new UserService({} as any) as jest.Mocked<UserService>;
        challengeParticipationService = new ChallengeParticipationService({} as any) as jest.Mocked<ChallengeParticipationService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        userService.getAllUsers = jest.fn();
        userService.getUserById = jest.fn();
        userService.createUser = jest.fn();
        userService.updateUser = jest.fn();
        userService.deleteUser = jest.fn();
        challengeParticipationService.getParticipationsByUser = jest.fn();

        userController = new UserController(userService, challengeParticipationService, authMiddleware);

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        endMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
            end: endMock
        };
    });

    describe("getAllUsers", () => {
        it("should return all users with 200 status", async () => {
            const users = [{ name: "User 1" }, { name: "User 2" }];
            userService.getAllUsers.mockResolvedValue(users as any);

            await userController.getAllUsers(req as Request, res as Response);

            expect(userService.getAllUsers).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(users);
        });
    });

    describe("getUserById", () => {
        it("should return 400 if id is missing", async () => {
            req = { params: {} };
            await userController.getUserById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "User id is required" });
        });

        it("should return 404 if user not found", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue(null);

            await userController.getUserById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: "User with id 123 not found" });
        });

        it("should return user with 200 status if found", async () => {
            req = { params: { id: "123" } };
            const user = { _id: "123", name: "User 1" };
            userService.getUserById.mockResolvedValue(user as any);

            await userController.getUserById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(user);
        });
    });

    describe("createUser", () => {
        it("should create user and return 201 status", async () => {
            req = { body: { name: "New User" } };
            const createdUser = { _id: "123", name: "New User" };
            userService.createUser.mockResolvedValue(createdUser as any);

            await userController.createUser(req as Request, res as Response);

            expect(userService.createUser).toHaveBeenCalledWith(req.body);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(createdUser);
        });
    });

    describe("updateUser", () => {
        it("should return 400 if id is missing", async () => {
            req = { params: {} };
            await userController.updateUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if user not found", async () => {
            req = { params: { id: "123" }, body: { name: "Updated" } };
            userService.updateUser.mockResolvedValue(null);

            await userController.updateUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
        });

        it("should return updated user with 200 status", async () => {
            req = { params: { id: "123" }, body: { name: "Updated" } };
            const updatedUser = { _id: "123", name: "Updated" };
            userService.updateUser.mockResolvedValue(updatedUser as any);

            await userController.updateUser(req as Request, res as Response);

            expect(userService.updateUser).toHaveBeenCalledWith("123", req.body);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe("deleteUser", () => {
        it("should return 400 if id is missing", async () => {
            req = { params: {} };
            await userController.deleteUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if user not found", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue(null);

            await userController.deleteUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
        });

        it("should delete user and return 204 status", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue({ _id: "123" } as any);
            userService.deleteUser.mockResolvedValue(undefined);

            await userController.deleteUser(req as Request, res as Response);

            expect(userService.deleteUser).toHaveBeenCalledWith("123");
            expect(statusMock).toHaveBeenCalledWith(204);
            expect(endMock).toHaveBeenCalled();
        });
    });

    describe("getUserParticipations", () => {
        it("should return participations for user", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue({ _id: "123" } as any);
            const participations = [{ id: "p1" }];
            challengeParticipationService.getParticipationsByUser.mockResolvedValue(participations as any);

            await userController.getUserParticipations(req as Request, res as Response);

            expect(challengeParticipationService.getParticipationsByUser).toHaveBeenCalledWith("123");
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(participations);
        });

        it("should return 404 if user not found", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue(null);

            await userController.getUserParticipations(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
        });
    });

    describe("deactivateUser", () => {
        it("should deactivate user and return 200", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue({ _id: "123" } as any);

            await userController.deactivateUser(req as Request, res as Response);

            expect(userService.updateUser).toHaveBeenCalledWith("123", { isActive: false });
            expect(statusMock).toHaveBeenCalledWith(200);
        });

         it("should return 404 if user not found", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue(null);

            await userController.deactivateUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
        });
    });

     describe("activateUser", () => {
        it("should activate user and return 200", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue({ _id: "123" } as any);

            await userController.activateUser(req as Request, res as Response);

            expect(userService.updateUser).toHaveBeenCalledWith("123", { isActive: true });
            expect(statusMock).toHaveBeenCalledWith(200);
        });

         it("should return 404 if user not found", async () => {
            req = { params: { id: "123" } };
            userService.getUserById.mockResolvedValue(null);

            await userController.activateUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
        });
    });
});
