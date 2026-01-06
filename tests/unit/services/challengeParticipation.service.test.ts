import { ChallengeParticipationService } from "../../../src/services/mongoose/services/challengeParticipation.service";
import { Mongoose } from "mongoose";

describe("ChallengeParticipationService", () => {
    let service: ChallengeParticipationService;
    let mockMongoose: Partial<Mongoose>;
    let mockModel: any;

    beforeEach(() => {
        // Mock chainable methods
        const mockExec = jest.fn();
        const mockPopulate = jest.fn().mockReturnThis(); // Returns itself to allow chaining if needed, or we can control it better
        // Actually populate returns the query, so it should have exec
        const mockQuery = {
            exec: mockExec,
            populate: mockPopulate,
        };

        mockModel = {
            create: jest.fn(),
            find: jest.fn().mockReturnValue(mockQuery),
            findOne: jest.fn().mockReturnValue(mockQuery),
            findByIdAndUpdate: jest.fn().mockReturnValue(mockQuery),
            findByIdAndDelete: jest.fn().mockReturnValue(mockQuery),
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
            const data: any = { challengeId: "1", userId: "user1" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createChallengeParticipation(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllChallengeParticipations", () => {
        it("should return all challenge participations", async () => {
            const data = [{ id: "1" }, { id: "2" }];
            (mockModel.find().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getAllChallengeParticipations();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getChallengeParticipationById", () => {
        it("should return a challenge participation by id", async () => {
            const data = { id: "1" };
            (mockModel.findOne().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getChallengeParticipationById("1");

            expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "1" });
            expect(result).toEqual(data);
        });
    });

    describe("updateChallengeParticipation", () => {
        it("should update a challenge participation", async () => {
            const id = "1";
            const updateData: any = { status: "completed" };
            const updatedData = { id: "1", ...updateData };
            (mockModel.findByIdAndUpdate().exec as jest.Mock).mockResolvedValue(updatedData);

            const result = await service.updateChallengeParticipation(id, updateData);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });

    describe("deleteChallengeParticipation", () => {
        it("should delete a challenge participation", async () => {
            const id = "1";
            (mockModel.findByIdAndDelete().exec as jest.Mock).mockResolvedValue(null);

            await service.deleteChallengeParticipation(id);

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });

    describe("getParticipationsForGymOwner", () => {
        it("should return participations for a gym owner", async () => {
            const gymOwnerId = "owner1";
            const data = [{ id: "1", gymOwner: gymOwnerId }];
            (mockModel.find().populate().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getParticipationsForGymOwner(gymOwnerId);

            expect(mockModel.find).toHaveBeenCalledWith({ gymOwner: gymOwnerId });
            expect(mockModel.find().populate).toHaveBeenCalledWith("gymOwner");
            expect(result).toEqual(data);
        });
    });

    describe("getParticipationsForUser", () => {
        it("should return participations for a user", async () => {
            const userId = "user1";
            const data = [{ id: "1", user: userId }];
            (mockModel.find().populate().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getParticipationsForUser(userId);

            expect(mockModel.find).toHaveBeenCalledWith({ user: userId });
            expect(mockModel.find().populate).toHaveBeenCalledWith("user");
            expect(result).toEqual(data);
        });
    });

    describe("getParticipationsForChallengeForDate", () => {
        it("should return participation for a challenge regarding a date", async () => {
            const challengeId = "challenge1";
            const date = new Date("2023-01-01");
            const data = { id: "1", challengeId, startDate: date };
            (mockModel.findOne().exec as jest.Mock).mockResolvedValue(data);

            const result = await service.getParticipationsForChallengeForDate(challengeId, date);

            expect(mockModel.findOne).toHaveBeenCalledWith({
                challengeId: challengeId,
                startDate: date
            });
            expect(result).toEqual(data);
        });
    });
});
