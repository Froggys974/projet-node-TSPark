import { BadgeController } from "../../../src/controllers/badge.controller";
import { BadgeService } from "../../../src/services/mongoose/services/badge.service";
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { BadgeCategory, BadgeRarity } from "../../../src/types";

jest.mock("../../../src/services/mongoose/services/badge.service");
jest.mock("../../../src/middlewares/auth.middleware");

describe("BadgeController", () => {
    let badgeController: BadgeController;
    let badgeService: jest.Mocked<BadgeService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: any;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let endMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        badgeService = new BadgeService({} as any) as jest.Mocked<BadgeService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;

        badgeService.getAllBadges = jest.fn();
        badgeService.getBadgesByCategory = jest.fn();
        badgeService.getBadgesByRarity = jest.fn();
        badgeService.getBadgeById = jest.fn();
        badgeService.createBadge = jest.fn();
        badgeService.updateBadge = jest.fn();
        badgeService.deleteBadge = jest.fn();

        badgeController = new BadgeController(badgeService, authMiddleware);

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        endMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
            end: endMock
        };
    });

    describe("getAllBadges", () => {
        it("should return all badges if no query params", async () => {
             req = { query: {} };
             const badges = [{ name: "Badge 1" }];
             badgeService.getAllBadges.mockResolvedValue(badges as any);

             await badgeController.getAllBadges(req as Request, res as Response);

             expect(badgeService.getAllBadges).toHaveBeenCalled();
             expect(statusMock).toHaveBeenCalledWith(200);
             expect(jsonMock).toHaveBeenCalledWith(badges);
        });

        it("should filter by category", async () => {
            req = { query: { category: "STREAK" } };
            const badges = [{ name: "Streak Badge" }];
            badgeService.getBadgesByCategory.mockResolvedValue(badges as any);

            await badgeController.getAllBadges(req as Request, res as Response);

            expect(badgeService.getBadgesByCategory).toHaveBeenCalledWith("STREAK");
            expect(jsonMock).toHaveBeenCalledWith(badges);
        });

         it("should filter by rarity", async () => {
            req = { query: { rarity: "COMMON" } };
            const badges = [{ name: "Common Badge" }];
            badgeService.getBadgesByRarity.mockResolvedValue(badges as any);

            await badgeController.getAllBadges(req as Request, res as Response);

            expect(badgeService.getBadgesByRarity).toHaveBeenCalledWith("COMMON");
            expect(jsonMock).toHaveBeenCalledWith(badges);
        });
    });

    describe("getBadgeById", () => {
         it("should return 400 if id missing", async () => {
            req = { params: {} };
            await badgeController.getBadgeById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
             req = { params: { id: "123" } };
             badgeService.getBadgeById.mockResolvedValue(null);
             await badgeController.getBadgeById(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(404);
        });

         it("should return badge if found", async () => {
             req = { params: { id: "123" } };
             const badge = { _id: "123" };
             badgeService.getBadgeById.mockResolvedValue(badge as any);
             await badgeController.getBadgeById(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(200);
             expect(jsonMock).toHaveBeenCalledWith(badge);
        });
    });

    describe("createBadge", () => {
        it("should create badge", async () => {
             req = { body: { name: "New Badge" } };
             const badge = { _id: "1", name: "New Badge" };
             badgeService.createBadge.mockResolvedValue(badge as any);

             await badgeController.createBadge(req as Request, res as Response);

             expect(badgeService.createBadge).toHaveBeenCalledWith(req.body);
             expect(statusMock).toHaveBeenCalledWith(201);
             expect(jsonMock).toHaveBeenCalledWith(badge);
        });
    });

    describe("updateBadge", () => {
         it("should return 400 if id missing", async () => {
            req = { params: {} };
            await badgeController.updateBadge(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
             req = { params: { id: "123" }, body: { name: "up" } };
             badgeService.updateBadge.mockResolvedValue(null);
             await badgeController.updateBadge(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(404);
        });

        it("should update badge", async () => {
             req = { params: { id: "123" }, body: { name: "up" } };
             const badge = { _id: "123", name: "up" };
             badgeService.updateBadge.mockResolvedValue(badge as any);

             await badgeController.updateBadge(req as Request, res as Response);

             expect(badgeService.updateBadge).toHaveBeenCalledWith("123", req.body);
             expect(statusMock).toHaveBeenCalledWith(200);
             expect(jsonMock).toHaveBeenCalledWith(badge);
        });
    });

    describe("deleteBadge", () => {
         it("should return 400 if id missing", async () => {
            req = { params: {} };
            await badgeController.deleteBadge(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it("should return 404 if not found", async () => {
             req = { params: { id: "123" } };
             badgeService.getBadgeById.mockResolvedValue(null);
             await badgeController.deleteBadge(req as Request, res as Response);
             expect(statusMock).toHaveBeenCalledWith(404);
        });

        it("should delete badge", async () => {
             req = { params: { id: "123" } };
             badgeService.getBadgeById.mockResolvedValue({ _id: "123" } as any);

             await badgeController.deleteBadge(req as Request, res as Response);

             expect(badgeService.deleteBadge).toHaveBeenCalledWith("123");
             expect(statusMock).toHaveBeenCalledWith(204);
        });
    });
});
