import express from "express";
import { GymOwnerService, openMongooseConnection, UserService, ChallengeParticipationService, TrainingRoomService, ChallengeService, BadgeService } from "./services";
import { HealthCheckController, GymOwnerController, UserController, ChallengeParticipationController, TrainingRoomController, ChallengeController, BadgeController } from "./controllers";
import { config } from "dotenv";
config();
export async function createApp(mongooseConnexion: any): Promise<express.Application> {
    const app = express();
    app.use(express.json());

    const healthCheckController = new HealthCheckController();
    app.use("/health-check", healthCheckController.buildRouter());

    // Global Error Handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error("Unhandled Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    });

    const challengeParticipationService = new ChallengeParticipationService(mongooseConnexion);
    const userService = new UserService(mongooseConnexion);
    const gymOwnerService = new GymOwnerService(mongooseConnexion);
    const trainingRoomService = new TrainingRoomService(mongooseConnexion);
    const challengeService = new ChallengeService(mongooseConnexion);
    const badgeService = new BadgeService(mongooseConnexion);


    const challengeParticipationController = new ChallengeParticipationController(challengeParticipationService, gymOwnerService);
    app.use("/participations", challengeParticipationController.buildRouter());

    const userController = new UserController(userService, challengeParticipationService);
    app.use("/users", userController.buildRouter());

    const gymOwnerController = new GymOwnerController(gymOwnerService, challengeParticipationService);
    app.use("/gym-owners", gymOwnerController.buildRouter());

    const trainingRoomController = new TrainingRoomController(trainingRoomService);
    app.use("/training-rooms", trainingRoomController.buildRouter());

    const challengeController = new ChallengeController(challengeService);
    app.use("/challenges", challengeController.buildRouter());

    const badgeController = new BadgeController(badgeService);
    app.use("/badges", badgeController.buildRouter());

    return app;
}

if (require.main === module) {
    async function main() : Promise<void> {
        const mongooseConnexion = await openMongooseConnection();
        const app = await createApp(mongooseConnexion);
        
        const PORT = process.env.PORT as string || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }

    main().catch((err) => {
        console.error("Error during main execution:", err);
    });
}
