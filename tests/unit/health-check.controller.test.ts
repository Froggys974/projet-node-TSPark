import { HealthCheckController } from "../../src/controllers/health-check.controller";
import { Request, Response } from "express";

describe("HealthCheckController", () => {
  let controller: HealthCheckController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new HealthCheckController();
    res = {
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
  });

  describe("checkHealth", () => {
    it("devrait retourner 204", async () => {
      req = {};

      await controller.checkHealth(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });
  });
});
