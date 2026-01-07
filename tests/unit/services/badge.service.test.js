"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const badge_service_1 = require("../../../src/services/mongoose/services/badge.service");
describe("BadgeService", () => {
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
        service = new badge_service_1.BadgeService(mockMongoose);
    });
    it("should be defined", () => {
        expect(service).toBeDefined();
    });
    describe("createBadge", () => {
        it("should create a badge", async () => {
            const data = { name: "Test Badge" };
            mockModel.create.mockResolvedValue(data);
            const result = await service.createBadge(data);
            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });
    describe("getAllBadges", () => {
        it("should return all badges", async () => {
            const data = [{ id: "1" }, { id: "2" }];
            mockModel.find().exec.mockResolvedValue(data);
            const result = await service.getAllBadges();
            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });
    describe("getBadgeById", () => {
        it("should return a badge by id", async () => {
            const data = { id: "1" };
            mockModel.findOne().exec.mockResolvedValue(data);
            const result = await service.getBadgeById("1");
            expect(mockModel.findOne).toHaveBeenCalledWith({ _id: "1" });
            expect(result).toEqual(data);
        });
    });
    describe("updateBadge", () => {
        it("should update a badge", async () => {
            const id = "1";
            const updateData = { name: "Updated Badge" };
            const updatedData = { id: "1", ...updateData };
            mockModel.findByIdAndUpdate().exec.mockResolvedValue(updatedData);
            const result = await service.updateBadge(id, updateData);
            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
            expect(result).toEqual(updatedData);
        });
    });
    describe("deleteBadge", () => {
        it("should delete a badge", async () => {
            const id = "1";
            mockModel.findByIdAndDelete().exec.mockResolvedValue(null);
            await service.deleteBadge(id);
            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
        });
    });
});
//# sourceMappingURL=badge.service.test.js.map