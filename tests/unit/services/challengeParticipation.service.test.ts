import { ChallengeParticipationService } from "../../../src/services/mongoose/services/challengeParticipation.service";
import { Mongoose } from "mongoose";

describe("ChallengeParticipationService", () => {
    let service: ChallengeParticipationService;
    let mockMongoose: Partial<Mongoose>;
    let mockModel: any;

    beforeEach(() => {
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        };

        mockModel = {
            create: jest.fn(),
            find: jest.fn().mockReturnValue(mockQuery),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
        };

        mockMongoose = {
            model: jest.fn().mockReturnValue(mockModel),
        };

        service = new ChallengeParticipationService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createChallengeParticipation", () => {
        it("should create a challenge participation", async () => {
            const data: any = { challengeId: "1", userId: "user1", score: 100 };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createChallengeParticipation(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllChallengeParticipations", () => {
        it("should return all challenge participations", async () => {
            const data = [{ id: "1", score: 100 }, { id: "2", score: 95 }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllChallengeParticipations();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getChallengeParticipationById", () => {
        it("should return a challenge participation by id", async () => {
            const data = { id: "1", score: 100 };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getChallengeParticipationById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });

    describe("updateChallengeParticipation", () => {
        it("should update a challenge participation", async () => {
            const id = "1";
            const updateData: any = { score: 150 };
            const updatedData = { id: "1", ...updateData };
            mockModel.findByIdAndUpdate.mockResolvedValue(updatedData);

            const result = await service.updateChallengeParticipation(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteChallengeParticipation", () => {
        it("should delete a challenge participation", async () => {
            const id = "1";
            mockModel.findByIdAndDelete.mockResolvedValue(null);

            await service.deleteChallengeParticipation(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getParticipationsByChallenge", () => {
        it("should return participations for a challenge", async () => {
            const challengeId = "1";
            const data = [{ id: "1", score: 100 }];
            const mockQuery = {
                sort: jest.fn().mockReturnValue(Promise.resolve(data)),
            };
            mockModel.find.mockReturnValue(mockQuery);

            const result = await service.getParticipationsByChallenge(challengeId);

            expect(mockModel.find).toHaveBeenCalledWith({ challengeId });
            expect(result).toEqual(data);
        });
    });

    describe("getParticipationsByUser", () => {
        it("should return participations for a user", async () => {
            const userId = "user1";
            const data = [{ id: "1", userId, score: 100 }];
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(data),
            };
            mockModel.find.mockReturnValue(mockQuery);

            const result = await service.getParticipationsByUser(userId);

            expect(mockModel.find).toHaveBeenCalledWith({ userId });
            expect(result).toEqual(data);
        });
    });

    describe("getUserParticipationInChallenge", () => {
        it("should return a user's participation in a challenge", async () => {
            const userId = "user1";
            const challengeId = "challenge1";
            const data = { id: "1", userId, challengeId, score: 100 };
            mockModel.findOne.mockResolvedValue(data);

            const result = await service.getUserParticipationInChallenge(userId, challengeId);

            expect(mockModel.findOne).toHaveBeenCalledWith({ userId, challengeId });
            expect(result).toEqual(data);
        });
    });

    describe("updateRankings", () => {
        it("should update rankings for a challenge", async () => {
            const challengeId = "challenge1";
            const participations = [
                { _id: "1", score: 100 },
                { _id: "2", score: 90 },
            ];
            const mockQuery = {
                sort: jest.fn().mockResolvedValue(participations),
            };
            mockModel.find.mockReturnValue(mockQuery);
            mockModel.findByIdAndUpdate.mockResolvedValue({});

            await service.updateRankings(challengeId);

            expect(mockModel.find).toHaveBeenCalledWith({ challengeId });
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
        });
    });

    describe("getTopParticipants", () => {
        it("should return top participants for a challenge", async () => {
            const challengeId = "challenge1";
            const data = [{ id: "1", score: 100 }];
            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(data),
            };
            mockModel.find.mockReturnValue(mockQuery);

            const result = await service.getTopParticipants(challengeId, 10);

            expect(mockModel.find).toHaveBeenCalledWith({ challengeId });
            expect(result).toEqual(data);
        });
    });
});
