"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../../src/controllers/user.controller");
const mockUserService = {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
};
const mockChallengeParticipationService = {
    getParticipationsForUser: jest.fn(),
};
describe("UserController", () => {
    let controller;
    let req;
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        controller = new user_controller_1.UserController(mockUserService, mockChallengeParticipationService);
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
        };
    });
    describe("getAllUsers", () => {
        it("devrait retourner la liste des utilisateurs", async () => {
            req = {};
            const users = [{ name: "John Doe" }, { name: "Jane Doe" }];
            mockUserService.getAllUsers.mockResolvedValue(users);
            await controller.getAllUsers(req, res);
            expect(mockUserService.getAllUsers).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(users);
        });
    });
    describe("getUserById", () => {
        it("devrait retourner un utilisateur si l'ID existe", async () => {
            req = { params: { id: "123" } };
            const user = { _id: "123", name: "John Doe" };
            mockUserService.getUserById.mockResolvedValue(user);
            await controller.getUserById(req, res);
            expect(mockUserService.getUserById).toHaveBeenCalledWith("123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(user);
        });
        it("devrait retourner 404 si l'utilisateur n'existe pas", async () => {
            req = { params: { id: "999" } };
            mockUserService.getUserById.mockResolvedValue(null);
            await controller.getUserById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "User with id 999 not found" });
        });
        it("devrait retourner 400 si l'ID est manquant", async () => {
            req = { params: {} };
            await controller.getUserById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
    describe("createUser", () => {
        it("devrait créer un utilisateur", async () => {
            const newUser = { name: "New User", email: "test@test.com" };
            req = { body: newUser };
            const createdUser = { ...newUser, _id: "123" };
            mockUserService.createUser.mockResolvedValue(createdUser);
            await controller.createUser(req, res);
            expect(mockUserService.createUser).toHaveBeenCalledWith(newUser);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdUser);
        });
        it("devrait retourner 400 si le nom ou l'email est manquant", async () => {
            req = { body: { name: "User Without Email" } };
            await controller.createUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Le nom et l'email sont requis" });
            expect(mockUserService.createUser).not.toHaveBeenCalled();
        });
        it("devrait retourner 500 si le service échoue (ex: erreur BDD)", async () => {
            req = { body: { name: "Adama", email: "diawara@test.com" } };
            mockUserService.createUser.mockRejectedValue(new Error("Erreur de connexion DB"));
            await controller.createUser(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Erreur lors de la création de l'utilisateur",
                error: "Erreur de connexion DB"
            });
        });
    });
    describe("updateUser", () => {
        it("devrait mettre à jour un utilisateur existant", async () => {
            req = { params: { id: "123" }, body: { name: "Updated" } };
            const updatedUser = { _id: "123", name: "Updated" };
            mockUserService.updateUser.mockResolvedValue(updatedUser);
            await controller.updateUser(req, res);
            expect(mockUserService.updateUser).toHaveBeenCalledWith("123", { name: "Updated" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedUser);
        });
        it("devrait retourner 404 si l'utilisateur à mettre à jour n'existe pas", async () => {
            req = { params: { id: "999" }, body: { name: "Updated" } };
            mockUserService.updateUser.mockResolvedValue(null);
            await controller.updateUser(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
    describe("deleteUser", () => {
        it("devrait supprimer un utilisateur existant", async () => {
            req = { params: { id: "123" } };
            mockUserService.getUserById.mockResolvedValue({ _id: "123" });
            mockUserService.deleteUser.mockResolvedValue(undefined);
            await controller.deleteUser(req, res);
            expect(mockUserService.deleteUser).toHaveBeenCalledWith("123");
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalled();
        });
        it("devrait retourner 404 si l'utilisateur à supprimer n'existe pas", async () => {
            req = { params: { id: "999" } };
            mockUserService.getUserById.mockResolvedValue(null);
            await controller.deleteUser(req, res);
            expect(mockUserService.deleteUser).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
    describe("getUserParticipations", () => {
        it("devrait retourner les participations d'un utilisateur", async () => {
            req = { params: { id: "123" } };
            const user = { _id: "123" };
            const participations = [{ id: "p1", user: "123" }];
            mockUserService.getUserById.mockResolvedValue(user);
            mockChallengeParticipationService.getParticipationsForUser.mockResolvedValue(participations);
            await controller.getUserParticipations(req, res);
            expect(mockChallengeParticipationService.getParticipationsForUser).toHaveBeenCalledWith("123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(participations);
        });
    });
});
//# sourceMappingURL=user.controller.test.js.map