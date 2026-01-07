"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const challenge_service_1 = require("../../../src/services/mongoose/services/challenge.service");
describe("ChallengeService", () => {
    let service;
    let mockMongoose;
    let mockModel;
    beforeEach(() => {
        const mockExec = jest.fn();
        const mockQuery = {
            exec: mockExec,
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
        service = new challenge_service_1.ChallengeService(mockMongoose);
    });
    it("should be defined", () => {
        expect(service).toBeDefined();
    });
    describe("createChallenge", () => {
        it("should create a challenge", async () => {
            const data = { title: "Challenge 1" };
            mockModel.create.mockResolvedValue(data);
            const result = await service.createChallenge(data);
            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });
    describe("getAllChallenges", () => {
        it("should return all challenges", async () => {
            const data = [{ id: "1" }];
            mockModel.find().exec.mockResolvedValue(data);
            const result = await service.getAllChallenges();
            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });
    describe("getChallengeById", () => {
        it("should return a challenge by id", async () => {
            const data = { id: "1" };
            mockModel.findOne().exec.mockResolvedValue(data);
            const result = await service.getChallengeById("1");
            expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "1" });
            expect(result).toEqual(data);
        });
    });
    describe("updateChallenge", () => {
        it("should update a challenge", async () => {
            const id = "1";
            const updateData = { title: "Updated Challenge" };
            const updatedData = { id: "1", ...updateData };
            mockModel.findByIdAndUpdate().exec.mockResolvedValue(updatedData);
            const result = await service.updateChallenge(id, updateData);
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });
    describe("deleteChallenge", () => {
        it("should delete a challenge", async () => {
            const id = "1";
            mockModel.findByIdAndDelete().exec.mockResolvedValue(null);
            await service.deleteChallenge(id);
            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });
    describe("getChallengesByCreator", () => {
        it("should return challenges by creator", async () => {
            const creatorId = "creator1";
            const data = [{ id: "1", creatorId }];
            mockModel.find().exec.mockResolvedValue(data);
            const result = await service.getChallengesByCreator(creatorId);
            expect(mockModel.find).toHaveBeenCalledWith({ creatorId: creatorId });
            expect(result).toEqual(data);
        });
    });
    describe("getChallengesByTrainingRoom", () => {
        it("should return challenges by training room", async () => {
            const trainingRoomId = "room1";
            const data = [{ id: "1", trainingRoomId }];
            mockModel.find().exec.mockResolvedValue(data);
            const result = await service.getChallengesByTrainingRoom(trainingRoomId);
            expect(mockModel.find).toHaveBeenCalledWith({ trainingRoomId: trainingRoomId });
            expect(result).toEqual(data);
        });
    });
});
//# sourceMappingURL=challenge.service.test.js.map