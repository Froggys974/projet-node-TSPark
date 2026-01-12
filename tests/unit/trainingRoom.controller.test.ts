import { TrainingRoomController } from "../../src/controllers/trainingRoom.controller";
import { TrainingRoomService } from "../../src/services";
import { Request, Response } from "express";

// Mock Service
const mockTrainingRoomService = {
  getAllTrainingRooms: jest.fn(),
  getTrainingRoomById: jest.fn(),
  createTrainingRoom: jest.fn(),
  updateTrainingRoom: jest.fn(),
  deleteTrainingRoom: jest.fn(),
  approveTrainingRoom: jest.fn(),
} as unknown as TrainingRoomService;

describe("TrainingRoomController", () => {
  let controller: TrainingRoomController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TrainingRoomController(mockTrainingRoomService);
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("getAllTrainingRooms", () => {
    it("devrait retourner la liste des salles", async () => {
      req = {};
      const rooms = [{ name: "Room A" }, { name: "Room B" }];
      (mockTrainingRoomService.getAllTrainingRooms as jest.Mock).mockResolvedValue(rooms);

      await controller.getAllTrainingRooms(req as Request, res as Response);

      expect(mockTrainingRoomService.getAllTrainingRooms).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rooms);
    });
  });

  describe("getTrainingRoomById", () => {
    it("devrait retourner une salle si l'ID existe", async () => {
      req = { params: { id: "123" } };
      const room = { _id: "123", name: "Room A" };
      (mockTrainingRoomService.getTrainingRoomById as jest.Mock).mockResolvedValue(room);

      await controller.getTrainingRoomById(req as Request, res as Response);

      expect(mockTrainingRoomService.getTrainingRoomById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(room);
    });

    it("devrait retourner 404 si la salle n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockTrainingRoomService.getTrainingRoomById as jest.Mock).mockResolvedValue(null);

      await controller.getTrainingRoomById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.getTrainingRoomById(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("createTrainingRoom", () => {
    it("devrait créer une salle", async () => {
      const newRoom = { name: "Room X" };
      req = { body: newRoom };
      const createdRoom = { ...newRoom, _id: "123" };
      (mockTrainingRoomService.createTrainingRoom as jest.Mock).mockResolvedValue(createdRoom);

      await controller.createTrainingRoom(req as Request, res as Response);

      expect(mockTrainingRoomService.createTrainingRoom).toHaveBeenCalledWith(newRoom);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdRoom);
    });
  });

  describe("updateTrainingRoom", () => {
    it("devrait mettre à jour une salle existante", async () => {
      req = { params: { id: "123" }, body: { name: "Updated Room" } };
      const updatedRoom = { _id: "123", name: "Updated Room" };
      (mockTrainingRoomService.updateTrainingRoom as jest.Mock).mockResolvedValue(updatedRoom);

      await controller.updateTrainingRoom(req as Request, res as Response);

      expect(mockTrainingRoomService.updateTrainingRoom).toHaveBeenCalledWith("123", { name: "Updated Room" });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("devrait retourner 404 si la salle n'existe pas", async () => {
      req = { params: { id: "999" }, body: { name: "Up" } };
      (mockTrainingRoomService.updateTrainingRoom as jest.Mock).mockResolvedValue(null);

      await controller.updateTrainingRoom(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.updateTrainingRoom(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteTrainingRoom", () => {
    it("devrait supprimer une salle existante", async () => {
      req = { params: { id: "123" } };
      (mockTrainingRoomService.getTrainingRoomById as jest.Mock).mockResolvedValue({ _id: "123" });
      (mockTrainingRoomService.deleteTrainingRoom as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteTrainingRoom(req as Request, res as Response);

      expect(mockTrainingRoomService.deleteTrainingRoom).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it("devrait retourner 404 si la salle n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockTrainingRoomService.getTrainingRoomById as jest.Mock).mockResolvedValue(null);

      await controller.deleteTrainingRoom(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.deleteTrainingRoom(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("approveTrainingRoom", () => {
    it("devrait approuver une salle", async () => {
      req = { params: { id: "123" } };
      const approvedRoom = { _id: "123", isApproved: true };
      (mockTrainingRoomService.approveTrainingRoom as jest.Mock).mockResolvedValue(approvedRoom);

      await controller.approveTrainingRoom(req as Request, res as Response);

      expect(mockTrainingRoomService.approveTrainingRoom).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(approvedRoom);
    });

    it("devrait retourner 404 si la salle à approuver n'existe pas", async () => {
      req = { params: { id: "999" } };
      (mockTrainingRoomService.approveTrainingRoom as jest.Mock).mockResolvedValue(null);

      await controller.approveTrainingRoom(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("devrait retourner 400 si l'ID est manquant", async () => {
      req = { params: {} };
      await controller.approveTrainingRoom(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
