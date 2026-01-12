import { GymOwnerController } from "../../src/controllers/gymOwner.controller";
import { GymOwnerService, ChallengeParticipationService } from "../../src/services";
import { Request, Response } from "express";

const mockGymOwnerService = {
  getAllGymOwners: jest.fn(),
  getGymOwnerById: jest.fn(),
  createGymOwner: jest.fn(),
  updateGymOwner: jest.fn(),
  deleteGymOwner: jest.fn(),
} as unknown as GymOwnerService;

const mockChallengeParticipationService = {
  getParticipationsForGymOwner: jest.fn(),
} as unknown as ChallengeParticipationService;

describe("GymOwnerController", () => {
  let controller: GymOwnerController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new GymOwnerController(
      mockGymOwnerService,
      mockChallengeParticipationService
    );

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("getAllGymOwners", () => {
    it("devrait retourner la liste des propriétaires de salle", async () => {
      req = {};
      const owners = [{ name: "Gym Owner A" }, { name: "Gym Owner B" }];
      (mockGymOwnerService.getAllGymOwners as jest.Mock).mockResolvedValue(owners);

      await controller.getAllGymOwners(req as Request, res as Response);

      expect(mockGymOwnerService.getAllGymOwners).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(owners);
    });
  });

  describe("getGymOwnerById", () => {
    it("devrait retourner un propriétaire si l'ID existe", async () => {
      req = { params: { id: "123" } };
      const owner = { _id: "123", name: "Gym Owner A" };
      (mockGymOwnerService.getGymOwnerById as jest.Mock).mockResolvedValue(owner);

      await controller.getGymOwnerById(req as Request, res as Response);

      expect(mockGymOwnerService.getGymOwnerById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(owner);
    });

    it("devrait retourner 404 si le propriétaire n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockGymOwnerService.getGymOwnerById as jest.Mock).mockResolvedValue(null);

      await controller.getGymOwnerById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "GymOwner with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.getGymOwnerById(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "GymOwner id is required" });
    });
  });

  describe("createGymOwner", () => {
    it("devrait créer un propriétaire", async () => {
      const newOwner = { name: "New Gym Owner", email: "gym@test.com" };
      req = { body: newOwner };
      const createdOwner = { ...newOwner, _id: "123" };
      (mockGymOwnerService.createGymOwner as jest.Mock).mockResolvedValue(createdOwner);

      await controller.createGymOwner(req as Request, res as Response);

      expect(mockGymOwnerService.createGymOwner).toHaveBeenCalledWith(newOwner);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdOwner);
    });
  });

  describe("updateGymOwner", () => {
    it("devrait mettre à jour un propriétaire existant", async () => {
      req = { params: { id: "123" }, body: { name: "Updated Name" } };
      const updatedOwner = { _id: "123", name: "Updated Name" };
      (mockGymOwnerService.updateGymOwner as jest.Mock).mockResolvedValue(updatedOwner);

      await controller.updateGymOwner(req as Request, res as Response);

      expect(mockGymOwnerService.updateGymOwner).toHaveBeenCalledWith("123", { name: "Updated Name" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedOwner);
    });

    it("devrait retourner 404 si le propriétaire à mettre à jour n'existe pas", async () => {
      req = { params: { id: "999" }, body: { name: "Updated" } };
      (mockGymOwnerService.updateGymOwner as jest.Mock).mockResolvedValue(null);

      await controller.updateGymOwner(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "GymOwner with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.updateGymOwner(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "GymOwner id is required" });
    });
  });

  describe("deleteGymOwner", () => {
    it("devrait supprimer un propriétaire existant", async () => {
      req = { params: { id: "123" } };
      (mockGymOwnerService.getGymOwnerById as jest.Mock).mockResolvedValue({ _id: "123" });
      (mockGymOwnerService.deleteGymOwner as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteGymOwner(req as Request, res as Response);

      expect(mockGymOwnerService.deleteGymOwner).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it("devrait retourner 404 si le propriétaire à supprimer n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockGymOwnerService.getGymOwnerById as jest.Mock).mockResolvedValue(null);

      await controller.deleteGymOwner(req as Request, res as Response);

      expect(mockGymOwnerService.deleteGymOwner).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "GymOwner with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.deleteGymOwner(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "GymOwner id is required" });
    });
  });

  describe("getGymOwnerParticipations", () => {
      it("devrait retourner les participations liées à un propriétaire", async () => {
          req = { params: { id: "123" } };
          const owner = { _id: "123" };
          const participations = [{ id: "p1", gymOwner: "123" }];
          
          (mockGymOwnerService.getGymOwnerById as jest.Mock).mockResolvedValue(owner);
          (mockChallengeParticipationService.getParticipationsForGymOwner as jest.Mock).mockResolvedValue(participations);

          await controller.getGymOwnerParticipations(req as Request, res as Response);

          expect(mockChallengeParticipationService.getParticipationsForGymOwner).toHaveBeenCalledWith("123");
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith(participations);
      });

      it("devrait retourner 404 si le propriétaire n'existe pas lors de la récupération des participations", async () => {
        req = { params: { id: "999" } };
        (mockGymOwnerService.getGymOwnerById as jest.Mock).mockResolvedValue(null);

        await controller.getGymOwnerParticipations(req as Request, res as Response);

        expect(mockChallengeParticipationService.getParticipationsForGymOwner).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "GymOwner with id 999 not found" });
      });

      it("devrait retourner 400 si l'ID est manquant", async () => {
        req = { params: {} };
        await controller.getGymOwnerParticipations(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "GymOwner id is required" });
      });
  });
});
