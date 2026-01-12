import { BadgeController } from "../../src/controllers/badge.controller";
import { BadgeService } from "../../src/services";
import { Request, Response } from "express";

// Mock Service
const mockBadgeService = {
  getAllBadges: jest.fn(),
  getBadgeById: jest.fn(),
  createBadge: jest.fn(),
  updateBadge: jest.fn(),
  deleteBadge: jest.fn(),
} as unknown as BadgeService;

describe("BadgeController", () => {
  let controller: BadgeController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new BadgeController(mockBadgeService);
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("getAllBadges", () => {
    it("devrait retourner la liste des badges", async () => {
      req = {};
      const badges = [{ name: "Gold" }, { name: "Silver" }];
      (mockBadgeService.getAllBadges as jest.Mock).mockResolvedValue(badges);

      await controller.getAllBadges(req as Request, res as Response);

      expect(mockBadgeService.getAllBadges).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(badges);
    });
  });

  describe("getBadgeById", () => {
    it("devrait retourner un badge si l'ID existe", async () => {
      req = { params: { id: "123" } };
      const badge = { _id: "123", name: "Gold" };
      (mockBadgeService.getBadgeById as jest.Mock).mockResolvedValue(badge);

      await controller.getBadgeById(req as Request, res as Response);

      expect(mockBadgeService.getBadgeById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(badge);
    });

    it("devrait retourner 404 si le badge n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockBadgeService.getBadgeById as jest.Mock).mockResolvedValue(null);

      await controller.getBadgeById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Badge with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.getBadgeById(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Badge id is required" });
    });
  });

  describe("createBadge", () => {
    it("devrait créer un badge", async () => {
      const newBadge = { name: "Platinum" };
      req = { body: newBadge };
      const createdBadge = { ...newBadge, _id: "123" };
      (mockBadgeService.createBadge as jest.Mock).mockResolvedValue(createdBadge);

      await controller.createBadge(req as Request, res as Response);

      expect(mockBadgeService.createBadge).toHaveBeenCalledWith(newBadge);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdBadge);
    });
  });

  describe("updateBadge", () => {
    it("devrait mettre à jour un badge existant", async () => {
      req = { params: { id: "123" }, body: { name: "Diamond" } };
      const updatedBadge = { _id: "123", name: "Diamond" };
      (mockBadgeService.updateBadge as jest.Mock).mockResolvedValue(updatedBadge);

      await controller.updateBadge(req as Request, res as Response);

      expect(mockBadgeService.updateBadge).toHaveBeenCalledWith("123", { name: "Diamond" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedBadge);
    });

    it("devrait retourner 404 si le badge à mettre à jour n'existe pas", async () => {
      req = { params: { id: "999" }, body: { name: "Fail" } };
      (mockBadgeService.updateBadge as jest.Mock).mockResolvedValue(null);

      await controller.updateBadge(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Badge with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.updateBadge(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Badge id is required" });
    });
  });

  describe("deleteBadge", () => {
    it("devrait supprimer un badge existant", async () => {
      req = { params: { id: "123" } };
      (mockBadgeService.getBadgeById as jest.Mock).mockResolvedValue({ _id: "123" });
      (mockBadgeService.deleteBadge as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteBadge(req as Request, res as Response);

      expect(mockBadgeService.deleteBadge).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it("devrait retourner 404 si le badge à supprimer n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockBadgeService.getBadgeById as jest.Mock).mockResolvedValue(null);

      await controller.deleteBadge(req as Request, res as Response);

      expect(mockBadgeService.deleteBadge).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Badge with id 999 not found" });
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.deleteBadge(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Badge id is required" });
    });
  });
});
