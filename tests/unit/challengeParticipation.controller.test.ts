import { ChallengeParticipationController } from "../../src/controllers/challengeParticipation.controller";
import { ChallengeParticipationService, GymOwnerService } from "../../src/services";
import { Request, Response } from "express";

const mockChallengeParticipationService = {
  createChallengeParticipation: jest.fn(),
  getParticipationsForChallengeForDate: jest.fn(),
  getChallengeParticipationById: jest.fn(),
  updateChallengeParticipation: jest.fn(),
  deleteChallengeParticipation: jest.fn(),
  getAllChallengeParticipations: jest.fn(),
} as unknown as ChallengeParticipationService;

const mockGymOwnerService = {
  getGymOwnerById: jest.fn(),
} as unknown as GymOwnerService;

describe("ChallengeParticipationController", () => {
  let controller: ChallengeParticipationController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ChallengeParticipationController(
      mockChallengeParticipationService,
      mockGymOwnerService
    );

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("createChallengeParticipation", () => {
    it("should return 400 if a participation already exists for the same challenge and date", async () => {
      const commonDate = new Date("2023-10-10");
      req = {
        body: {
          gymOwner: "gymOwner123",
          startDate: commonDate.toISOString(),
          challengeId: "challenge123",
        },
      };

      (mockGymOwnerService.getGymOwnerById as jest.Mock).mockResolvedValue({ _id: "gymOwner123" });

      (mockChallengeParticipationService.getParticipationsForChallengeForDate as jest.Mock).mockResolvedValue({
        _id: "existingPart123",
      });

      await controller.createChallengeParticipation(
        req as Request,
        res as Response
      );

      expect(mockGymOwnerService.getGymOwnerById).toHaveBeenCalledWith("gymOwner123");
      expect(
        mockChallengeParticipationService.getParticipationsForChallengeForDate
      ).toHaveBeenCalledWith("challenge123", expect.any(Date));
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Une participation existe déjà pour ce défi à cette date.",
      });
      expect(
        mockChallengeParticipationService.createChallengeParticipation
      ).not.toHaveBeenCalled();
    });

    it("should create participation if no conflict exists", async () => {
      const commonDate = new Date("2023-10-12");
      req = {
        body: {
          gymOwner: "gymOwner123",
          startDate: commonDate.toISOString(),
          challengeId: "challenge123",
        },
      };

      (mockGymOwnerService.getGymOwnerById as jest.Mock).mockResolvedValue({ _id: "gymOwner123" });

      (mockChallengeParticipationService.getParticipationsForChallengeForDate as jest.Mock).mockResolvedValue(null);

      const newParticipation = { _id: "newPart123", ...req.body };
      (mockChallengeParticipationService.createChallengeParticipation as jest.Mock).mockResolvedValue(newParticipation);

      await controller.createChallengeParticipation(
        req as Request,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newParticipation);
    });
  });

  describe("getAllChallengeParticipations", () => {
    it("devrait retourner la liste des participations", async () => {
        req = {};
        const participations = [{ id: "p1" }, { id: "p2" }];
        (mockChallengeParticipationService.getAllChallengeParticipations as jest.Mock).mockResolvedValue(participations);

        await controller.getAllChallengeParticipations(req as Request, res as Response);

        expect(mockChallengeParticipationService.getAllChallengeParticipations).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(participations);
    });
  });

  describe("getChallengeParticipationById", () => {
    it("devrait retourner une participation si l'ID existe", async () => {
        req = { params: { id: "p1" } };
        const participation = { id: "p1" };
        (mockChallengeParticipationService.getChallengeParticipationById as jest.Mock).mockResolvedValue(participation);

        await controller.getChallengeParticipationById(req as Request, res as Response);

        expect(mockChallengeParticipationService.getChallengeParticipationById).toHaveBeenCalledWith("p1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(participation);
    });

    it("devrait retourner 404 si la participation n'existe pas", async () => {
        req = { params: { id: "999" } };
        (mockChallengeParticipationService.getChallengeParticipationById as jest.Mock).mockResolvedValue(null);

        await controller.getChallengeParticipationById(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "ChallengeParticipation with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
        req = { params: {} };
        await controller.getChallengeParticipationById(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "ChallengeParticipation id is required" });
    });
  });

  describe("updateChallengeParticipation", () => {
    it("devrait mettre à jour une participation existante", async () => {
        req = { params: { id: "p1" }, body: { status: "completed" } };
        const updatedParticipation = { id: "p1", status: "completed" };
        (mockChallengeParticipationService.updateChallengeParticipation as jest.Mock).mockResolvedValue(updatedParticipation);

        await controller.updateChallengeParticipation(req as Request, res as Response);

        expect(mockChallengeParticipationService.updateChallengeParticipation).toHaveBeenCalledWith("p1", { status: "completed" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(updatedParticipation);
    });

    it("devrait retourner 404 si la participation à mettre à jour n'existe pas", async () => {
        req = { params: { id: "999" }, body: { status: "completed" } };
        (mockChallengeParticipationService.updateChallengeParticipation as jest.Mock).mockResolvedValue(null);

        await controller.updateChallengeParticipation(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "ChallengeParticipation with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
        req = { params: {} };
        await controller.updateChallengeParticipation(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "ChallengeParticipation id is required" });
    });
  });

  describe("deleteChallengeParticipation", () => {
    it("devrait supprimer une participation existante", async () => {
        req = { params: { id: "p1" } };
        (mockChallengeParticipationService.getChallengeParticipationById as jest.Mock).mockResolvedValue({ id: "p1" });
        (mockChallengeParticipationService.deleteChallengeParticipation as jest.Mock).mockResolvedValue(undefined);

        await controller.deleteChallengeParticipation(req as Request, res as Response);

        expect(mockChallengeParticipationService.deleteChallengeParticipation).toHaveBeenCalledWith("p1");
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.end).toHaveBeenCalled();
    });

    it("devrait retourner 404 si la participation à supprimer n'existe pas", async () => {
        req = { params: { id: "999" } };
        (mockChallengeParticipationService.getChallengeParticipationById as jest.Mock).mockResolvedValue(null);

        await controller.deleteChallengeParticipation(req as Request, res as Response);

        expect(mockChallengeParticipationService.deleteChallengeParticipation).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "ChallengeParticipation with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
        req = { params: {} };
        await controller.deleteChallengeParticipation(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "ChallengeParticipation id is required" });
    });
  });
});
