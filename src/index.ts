import express from "express";
import { GymOwnerService, openMongooseConnection, UserService, ChallengeParticipationService, TrainingRoomService, ChallengeService,  } from "./services";
import { HealthCheckController, GymOwnerController, UserController, ChallengeParticipationController, TrainingRoomController, ChallengeController,  } from "./controllers";
import { config } from "dotenv";
config();
async function main() : Promise<void> {
    const mongooseConnexion = await openMongooseConnection();
    const app = express();
    app.use(express.json());

    const healthCheckController = new HealthCheckController();
    app.use("/health-check", healthCheckController.buildRouter());

    const challengeParticipationService = new ChallengeParticipationService(mongooseConnexion);
    const userService = new UserService(mongooseConnexion);
    const gymOwnerService = new GymOwnerService(mongooseConnexion);
    const trainingRoomService = new TrainingRoomService(mongooseConnexion);
    const challengeService = new ChallengeService(mongooseConnexion);



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



    const PORT = process.env.PORT as string;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

}
main().catch((err) => {
    console.error("Error during main execution:", err);
});
