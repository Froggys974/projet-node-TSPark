
import { BadgeService } from "../../../src/services/mongoose/services/badge.service";
import mongoose from "mongoose";

describe("BadgeService - Badge Acquisition", () => {
    let badgeService: BadgeService;
    let mockConnexion: any;
    let mockBadgeModel: any;
    let mockUserModel: any;

    beforeEach(() => {
        // Mock Mongoose models
        mockBadgeModel = {
            find: jest.fn().mockReturnThis(),
            exec: jest.fn(),
            findByIdAndDelete: jest.fn().mockReturnThis(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            findOne: jest.fn().mockReturnThis()
        };

        mockUserModel = {
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            exec: jest.fn()
        };

        mockConnexion = {
            model: jest.fn((name) => {
                if (name === "Badge") return mockBadgeModel;
                if (name === "User") return mockUserModel;
                return {};
            })
        };

        badgeService = new BadgeService(mockConnexion);
    });

    it("should award a badge if requirements are met (total_score)", async () => {
        // Arrange
        const user = { _id: "user1", badges: [], totalScore: 150 };
        const participation = {};
        const challenge = {};
        const badges = [
            { _id: "badge1", name: "Score Master", requirement: "total_score >= 100", requirementType: "total_score" }
        ];

        mockBadgeModel.exec.mockResolvedValue(badges);

        // Act
        await badgeService.checkForBadges(user, participation, challenge);

        // Assert
        expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith("user1", { $addToSet: { badges: "badge1" } });
    });

    it("should NOT award a badge if requirements are NOT met (total_score)", async () => {
        // Arrange
        const user = { _id: "user1", badges: [], totalScore: 50 };
        const participation = {};
        const challenge = {};
        const badges = [
            { _id: "badge1", name: "Score Master", requirement: "total_score >= 100" }
        ];

        mockBadgeModel.exec.mockResolvedValue(badges);

        // Act
        await badgeService.checkForBadges(user, participation, challenge);

        // Assert
        expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should award a badge if requirement met (workout_time)", async () => {
        // Arrange
        const user = { _id: "user1", badges: [] };
        // 05:30 AM
        const participation = { startDate: new Date("2023-01-01T05:30:00") };
        const challenge = {};
        const badges = [
            { _id: "badge2", name: "Early Bird", requirement: "workout_time < 06:00" }
        ];

        mockBadgeModel.exec.mockResolvedValue(badges);

        // Act
        await badgeService.checkForBadges(user, participation, challenge);

         // Assert
         expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith("user1", { $addToSet: { badges: "badge2" } });
    });

    it("should NOT award badge if user already has it", async () => {
         // Arrange
         const user = { _id: "user1", badges: ["badge1"], totalScore: 150 };
         const participation = {};
         const challenge = {};
         const badges = [
             { _id: "badge1", name: "Score Master", requirement: "total_score >= 100" }
         ];
 
         mockBadgeModel.exec.mockResolvedValue(badges);
 
         // Act
         await badgeService.checkForBadges(user, participation, challenge);
 
         // Assert
         expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
    
    it("should award a badge if requirement met (type_match)", async () => {
         // Arrange
         const user = { _id: "user1", badges: [] };
         const participation = {};
         const challenge = { exerciseType: "Running" };
         const badges = [
             { _id: "badge3", name: "Runner", requirement: "type_match == 'Running'" }
         ];
 
         mockBadgeModel.exec.mockResolvedValue(badges);
 
         // Act
         await badgeService.checkForBadges(user, participation, challenge);
 
          // Assert
          expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith("user1", { $addToSet: { badges: "badge3" } });
    });
});
