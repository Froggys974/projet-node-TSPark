
import { config } from "dotenv";
import { openMongooseConnection } from "../services/mongoose/utils/mongoose-connect.utils";
import { 
    getUserSchema, 
    getChallengeSchema, 
    getTrainingRoomSchema, 
    getGymOwnerSchema, 
    getBadgeSchema 
} from "../services/mongoose/schema";
import { Types } from "mongoose";

config();

async function seed() {
    console.log("🌱 Starting seed...");

    let connection;
    try {
        connection = await openMongooseConnection();
        console.log("✅ Connected to MongoDB");

        // Instantiate models
        const UserModel = connection.model("User", getUserSchema());
        const ChallengeModel = connection.model("Challenge", getChallengeSchema());
        const TrainingRoomModel = connection.model("TrainingRoom", getTrainingRoomSchema());
        const GymOwnerModel = connection.model("GymOwner", getGymOwnerSchema());
        const BadgeModel = connection.model("Badge", getBadgeSchema());

        // Clear existing data
        console.log("🧹 Clearing existing data...");
        await Promise.all([
            UserModel.deleteMany({}),
            ChallengeModel.deleteMany({}),
            TrainingRoomModel.deleteMany({}),
            GymOwnerModel.deleteMany({}),
            BadgeModel.deleteMany({})
        ]);

        console.log("📝 Inserting new data...");

        const user1Id = new Types.ObjectId("000000000000000000000001");
        const user2Id = new Types.ObjectId("000000000000000000000002");
        const gymOwnerId = new Types.ObjectId("000000000000000000000003");
        const trainingRoomId = new Types.ObjectId("000000000000000000000004");
        const challenge1Id = new Types.ObjectId("000000000000000000000005");
        const challenge2Id = new Types.ObjectId("000000000000000000000006");
        const badge1Id = new Types.ObjectId("000000000000000000000007");
        const badge2Id = new Types.ObjectId("000000000000000000000008");

        // Create Users
        await UserModel.create([
            {
                _id: user1Id,
                name: "John Doe",
                email: "john@example.com",
                birthdate: new Date("1990-01-01"),
                fitnessLevel: "Intermediate",
                totalScore: 100,
                badges: []
            },
            {
                _id: user2Id,
                name: "Jane Smith",
                email: "jane@example.com",
                birthdate: new Date("1992-05-15"),
                fitnessLevel: "Advanced",
                totalScore: 250,
                badges: []
            }
        ]);

        // Create Gym Owner
        await GymOwnerModel.create({
            _id: gymOwnerId,
            name: "Gym Master",
            email: "owner@gym.com",
            reputationScore: 50
        });

        // Create Training Room
        await TrainingRoomModel.create({
            _id: trainingRoomId,
            name: "Muscle Beach",
            address: "123 Sandy Shores",
            ownerId: gymOwnerId,
            equipments: ["Bench Press", "Dumbbells", "Pull-up Bar"],
            capacity: 50,
            isApproved: true
        });

        // Create Challenges
        await ChallengeModel.create([
            {
                _id: challenge1Id,
                title: "Morning Run",
                description: "Run 5km every morning",
                exerciseType: "Running",
                targetValue: 5000,
                trainingRoomId: trainingRoomId,
                creatorId: user1Id, // John Created it
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
                difficulty: "Medium",
                rewardPoints: 50
            },
            {
                _id: challenge2Id,
                title: "100 Pushups",
                description: "Do 100 pushups in one go",
                exerciseType: "Strength",
                targetValue: 100,
                trainingRoomId: trainingRoomId,
                creatorId: gymOwnerId, // Owner Created it
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                difficulty: "Hard",
                rewardPoints: 100
            }
        ]);

        // Create Badges
        await BadgeModel.create([
            {
                _id: badge1Id,
                name: "Early Bird",
                description: "Complete a workout before 6 AM",
                icon: "🐦",
                requirement: "workout_time < 06:00",
                points: 10
            },
            {
                _id: badge2Id,
                name: "Marathoner",
                description: "Run 42km total",
                icon: "🏃",
                requirement: "type_match == 'Running'",
                points: 100
            }
        ]);

        console.log("✅ Seed completed successfully!");

    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.disconnect();
            console.log("👋 Disconnected from MongoDB");
        }
    }
}

seed();
