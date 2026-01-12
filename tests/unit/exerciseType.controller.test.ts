import { ExerciseTypeController } from "../../src/controllers/exerciseType.controller";
import { ExerciseTypeService } from "../../src/services";
import { Request, Response } from "express";

// Mock Service
const mockExerciseTypeService = {
  getAllExerciseTypes: jest.fn(),
  getExerciseTypeById: jest.fn(),
  createExerciseType: jest.fn(),
  updateExerciseType: jest.fn(),
  deleteExerciseType: jest.fn(),
} as unknown as ExerciseTypeService;

describe("ExerciseTypeController", () => {
  let controller: ExerciseTypeController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ExerciseTypeController(mockExerciseTypeService);
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("getAllExerciseTypes", () => {
    it("devrait retourner la liste des types d'exercices", async () => {
      req = {};
      const types = [{ name: "Cardio" }, { name: "Strength" }];
      (mockExerciseTypeService.getAllExerciseTypes as jest.Mock).mockResolvedValue(types);

      await controller.getAllExerciseTypes(req as Request, res as Response);

      expect(mockExerciseTypeService.getAllExerciseTypes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(types);
    });
  });

  describe("getExerciseTypeById", () => {
    it("devrait retourner un type d'exercice si l'ID existe", async () => {
      req = { params: { id: "123" } };
      const type = { _id: "123", name: "Cardio" };
      (mockExerciseTypeService.getExerciseTypeById as jest.Mock).mockResolvedValue(type);

      await controller.getExerciseTypeById(req as Request, res as Response);

      expect(mockExerciseTypeService.getExerciseTypeById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(type);
    });

    it("devrait retourner 404 si le type n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockExerciseTypeService.getExerciseTypeById as jest.Mock).mockResolvedValue(null);

      await controller.getExerciseTypeById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.getExerciseTypeById(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("createExerciseType", () => {
    it("devrait créer un type d'exercice", async () => {
      const newType = { name: "Yoga" };
      req = { body: newType };
      const createdType = { ...newType, _id: "123" };
      (mockExerciseTypeService.createExerciseType as jest.Mock).mockResolvedValue(createdType);

      await controller.createExerciseType(req as Request, res as Response);

      expect(mockExerciseTypeService.createExerciseType).toHaveBeenCalledWith(newType);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdType);
    });
  });

  describe("updateExerciseType", () => {
    it("devrait mettre à jour un type existant", async () => {
      req = { params: { id: "123" }, body: { name: "Pilates" } };
      const updatedType = { _id: "123", name: "Pilates" };
      (mockExerciseTypeService.updateExerciseType as jest.Mock).mockResolvedValue(updatedType);

      await controller.updateExerciseType(req as Request, res as Response);

      expect(mockExerciseTypeService.updateExerciseType).toHaveBeenCalledWith("123", { name: "Pilates" });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("devrait retourner 404 si le type à mettre à jour n'existe pas", async () => {
      req = { params: { id: "999" }, body: { name: "Up" } };
      (mockExerciseTypeService.updateExerciseType as jest.Mock).mockResolvedValue(null);

      await controller.updateExerciseType(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.updateExerciseType(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteExerciseType", () => {
    it("devrait supprimer un type existant", async () => {
      req = { params: { id: "123" } };
      (mockExerciseTypeService.getExerciseTypeById as jest.Mock).mockResolvedValue({ _id: "123" });
      (mockExerciseTypeService.deleteExerciseType as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteExerciseType(req as Request, res as Response);

      expect(mockExerciseTypeService.deleteExerciseType).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it("devrait retourner 404 si le type à supprimer n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockExerciseTypeService.getExerciseTypeById as jest.Mock).mockResolvedValue(null);

      await controller.deleteExerciseType(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.deleteExerciseType(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
