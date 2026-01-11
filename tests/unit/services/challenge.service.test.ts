import { ChallengeService } from "../../../src/services/mongoose/services/challenge.service";
import { Mongoose } from "mongoose";

describe("ChallengeService", () => {
    let service: ChallengeService;
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

        service = new ChallengeService(mockMongoose as Mongoose);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createChallenge", () => {
        it("should create a challenge", async () => {
            const data: any = {
                title: "Challenge 1",
                creatorId: "123",
                workoutId: "456",
                rankingType: "fastest_time",
                startDate: new Date(),
                endDate: new Date(),
            };
            mockModel.create.mockResolvedValue(data);

            const result = await service.createChallenge(data);

            expect(mockModel.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(data);
        });
    });

    describe("getAllChallenges", () => {
        it("should return all challenges", async () => {
            const data = [{ id: "1", title: "Challenge 1" }];
            mockModel.find.mockResolvedValue(data);

            const result = await service.getAllChallenges();

            expect(mockModel.find).toHaveBeenCalled();
            expect(result).toEqual(data);
        });
    });

    describe("getChallengeById", () => {
        it("should return a challenge by id", async () => {
            const data = { id: "1", title: "Challenge 1" };
            mockModel.findById.mockResolvedValue(data);

            const result = await service.getChallengeById("1");

            expect(mockModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(data);
        });
    });
});

