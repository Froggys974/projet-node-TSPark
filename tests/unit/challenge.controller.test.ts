import { ChallengeController } from "../../src/controllers/challenge.controller";
import { ChallengeService } from "../../src/services";
import { Request, Response } from "express";

const mockChallengeService = {
  getAllChallenges: jest.fn(),
  getChallengeById: jest.fn(),
  createChallenge: jest.fn(),
  updateChallenge: jest.fn(),
  deleteChallenge: jest.fn(),
} as unknown as ChallengeService;

describe("ChallengeController", () => {
  let controller: ChallengeController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ChallengeController(mockChallengeService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("getAllChallenges", () => {
    it("devrait retourner la liste des défis", async () => {
      req = {};
      const challenges = [{ name: "Defi 1" }, { name: "Defi 2" }];
      (mockChallengeService.getAllChallenges as jest.Mock).mockResolvedValue(challenges);

      await controller.getAllChallenges(req as Request, res as Response);

      expect(mockChallengeService.getAllChallenges).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(challenges);
    });
  });

  describe("getChallengeById", () => {
    it("devrait retourner un défi si l'ID existe", async () => {
      req = { params: { id: "123" } };
      const challenge = { _id: "123", name: "Defi 1" };
      (mockChallengeService.getChallengeById as jest.Mock).mockResolvedValue(challenge);

      await controller.getChallengeById(req as Request, res as Response);

      expect(mockChallengeService.getChallengeById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(challenge);
    });

    it("devrait retourner 404 si le défi n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockChallengeService.getChallengeById as jest.Mock).mockResolvedValue(null);

      await controller.getChallengeById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Challenge with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
        req = { params: {} };
        await controller.getChallengeById(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Challenge id is required" });
    });
  });

  describe("createChallenge", () => {
    it("devrait créer un défi", async () => {
      const newChallenge = { name: "Super Defi", exercises: [] };
      req = { body: newChallenge };
      const createdChallenge = { ...newChallenge, _id: "123" };
      (mockChallengeService.createChallenge as jest.Mock).mockResolvedValue(createdChallenge);

      await controller.createChallenge(req as Request, res as Response);

      expect(mockChallengeService.createChallenge).toHaveBeenCalledWith(newChallenge);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdChallenge);
    });
  });

  describe("updateChallenge", () => {
    it("devrait mettre à jour un défi existant", async () => {
      req = { params: { id: "123" }, body: { name: "Updated Defi" } };
      const updatedChallenge = { _id: "123", name: "Updated Defi" };
      (mockChallengeService.updateChallenge as jest.Mock).mockResolvedValue(updatedChallenge);

      await controller.updateChallenge(req as Request, res as Response);

      expect(mockChallengeService.updateChallenge).toHaveBeenCalledWith("123", { name: "Updated Defi" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedChallenge);
    });

    it("devrait retourner 404 si le défi à mettre à jour n'existe pas", async () => {
      req = { params: { id: "999" }, body: { name: "Updated" } };
      (mockChallengeService.updateChallenge as jest.Mock).mockResolvedValue(null);

      await controller.updateChallenge(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Challenge with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
        req = { params: {} };
        await controller.updateChallenge(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Challenge id is required" });
    });
  });

  describe("deleteChallenge", () => {
    it("devrait supprimer un défi existant", async () => {
      req = { params: { id: "123" } };
      (mockChallengeService.getChallengeById as jest.Mock).mockResolvedValue({ _id: "123" });
      (mockChallengeService.deleteChallenge as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteChallenge(req as Request, res as Response);

      expect(mockChallengeService.deleteChallenge).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it("devrait retourner 404 si le défi à supprimer n'existe pas", async () => {
        req = { params: { id: "999" } };
        (mockChallengeService.getChallengeById as jest.Mock).mockResolvedValue(null);
  
        await controller.deleteChallenge(req as Request, res as Response);
  
        expect(mockChallengeService.deleteChallenge).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Challenge with id 999 not found" });
      });

    it("devrait retourner 400 si l'ID est manquant", async () => {
        req = { params: {} };
        await controller.deleteChallenge(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Challenge id is required" });
    });
  });
});
