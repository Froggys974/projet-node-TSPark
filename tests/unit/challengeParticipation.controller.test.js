"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const challengeParticipation_controller_1 = require("../../src/controllers/challengeParticipation.controller");
// Mock the services
const mockChallengeParticipationService = {
    createChallengeParticipation: jest.fn(),
    getParticipationsForChallengeForDate: jest.fn(),
    getChallengeParticipationById: jest.fn(),
    updateChallengeParticipation: jest.fn(),
    deleteChallengeParticipation: jest.fn(),
    getAllChallengeParticipations: jest.fn(),
};
const mockGymOwnerService = {
    getGymOwnerById: jest.fn(),
};
describe("ChallengeParticipationController", () => {
    let controller;
    let req;
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        controller = new challengeParticipation_controller_1.ChallengeParticipationController(mockChallengeParticipationService, mockGymOwnerService);
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
        };
    });
    describe("createChallengeParticipation", () => {
        it("should return 400 if a participation already exists for the same challenge and date", async () => {
            // Arrange
            const commonDate = new Date("2023-10-10");
            req = {
                body: {
                    gymOwner: "gymOwner123",
                    startDate: commonDate.toISOString(),
                    challengeId: "challenge123",
                },
            };
            // Mock GymOwner found
            mockGymOwnerService.getGymOwnerById.mockResolvedValue({ _id: "gymOwner123" });
            // Mock Participation FOUND (Conflict)
            mockChallengeParticipationService.getParticipationsForChallengeForDate.mockResolvedValue({
                _id: "existingPart123",
            });
            // Act
            await controller.createChallengeParticipation(req, res);
            // Assert
            expect(mockGymOwnerService.getGymOwnerById).toHaveBeenCalledWith("gymOwner123");
            expect(mockChallengeParticipationService.getParticipationsForChallengeForDate).toHaveBeenCalledWith("challenge123", expect.any(Date)); // Note: Depending on implementation, might need strict date check
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Une participation existe déjà pour ce défi à cette date.",
            });
            // Should NOT create
            expect(mockChallengeParticipationService.createChallengeParticipation).not.toHaveBeenCalled();
        });
        it("should create participation if no conflict exists", async () => {
            // Arrange
            const commonDate = new Date("2023-10-12");
            req = {
                body: {
                    gymOwner: "gymOwner123",
                    startDate: commonDate.toISOString(),
                    challengeId: "challenge123",
                },
            };
            // Mock GymOwner found
            mockGymOwnerService.getGymOwnerById.mockResolvedValue({ _id: "gymOwner123" });
            // Mock Participation NOT FOUND
            mockChallengeParticipationService.getParticipationsForChallengeForDate.mockResolvedValue(null);
            // Mock Create Success
            const newParticipation = { _id: "newPart123", ...req.body };
            mockChallengeParticipationService.createChallengeParticipation.mockResolvedValue(newParticipation);
            // Act
            await controller.createChallengeParticipation(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newParticipation);
        });
    });
});
//# sourceMappingURL=challengeParticipation.controller.test.js.map