
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

    it("should award a badge if score meets total_calories criteria", async () => {
        // Arrange
        const user = { _id: "user1", badges: [], points: 150 }; // Assuming points mapped to total_calories
        const participation = {};
        const challenge = {};
        const badges = [
            { 
                _id: "badge1", 
                name: "Score Master", 
                criteria: { type: "total_calories", threshold: 100 } 
            }
        ];

        mockBadgeModel.exec.mockResolvedValue(badges);

        // Act
        await badgeService.checkForBadges(user, participation, challenge);

        // Assert
        expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith("user1", { $addToSet: { badges: "badge1" } });
    });

    it("should NOT award a badge if score below threshold", async () => {
        // Arrange
        const user = { _id: "user1", badges: [], points: 50 };
        const participation = {};
        const challenge = {};
        const badges = [
            { 
                 _id: "badge1", 
                 name: "Score Master", 
                 criteria: { type: "total_calories", threshold: 100 } 
            }
        ];

        mockBadgeModel.exec.mockResolvedValue(badges);

        // Act
        await badgeService.checkForBadges(user, participation, challenge);

        // Assert
        expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should NOT award badge if user already has it", async () => {
         // Arrange
         const user = { _id: "user1", badges: ["badge1"], points: 150 };
         const participation = {};
         const challenge = {};
         const badges = [
            { 
                _id: "badge1", 
                name: "Score Master", 
                criteria: { type: "total_calories", threshold: 100 } 
           }
         ];
 
         mockBadgeModel.exec.mockResolvedValue(badges);
 
         // Act
         await badgeService.checkForBadges(user, participation, challenge);
 
         // Assert
         expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
    
});
