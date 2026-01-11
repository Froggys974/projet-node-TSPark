import { BadgeService } from "../../../src/services/mongoose/services/badge.service";
import { Mongoose } from "mongoose";

describe("BadgeService", () => {
    let service: BadgeService;
    let mockMongoose: Partial<Mongoose>;
    let mockModel: any;

    beforeEach(() => {
        mockModel = {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
        };

        mockMongoose = {
            model: jest.fn().mockReturnValue(mockModel),
        };

        service = new BadgeService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createBadge", () => {
        it("should create a badge", async () => {
            const data: any = { name: "Test Badge", category: "achievement", rarity: "common" };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createBadge(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllBadges", () => {
        it("should return all badges", async () => {
            const data = [{ id: "1", name: "Badge 1" }, { id: "2", name: "Badge 2" }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllBadges();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getBadgeById", () => {
        it("should return a badge by id", async () => {
            const data = { id: "1", name: "Badge 1" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getBadgeById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });
});

