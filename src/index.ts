import express from "express";
import { GymOwnerService, openMongooseConnection, UserService, TrainingRoomService } from "./services";
import { HealthCheckController, GymOwnerController, UserController, TrainingRoomController, } from "./controllers";
import { config } from "dotenv";
config();
async function main() : Promise<void> {
    const mongooseConnexion = await openMongooseConnection();
    const app = express();
    app.use(express.json());

    const healthCheckController = new HealthCheckController();
    app.use("/health-check", healthCheckController.buildRouter());

    const userService = new UserService(mongooseConnexion);
    const gymOwnerService = new GymOwnerService(mongooseConnexion);
    const trainingRoomService = new TrainingRoomService(mongooseConnexion);


    const userController = new UserController(userService);
    app.use("/users", userController.buildRouter());

    const gymOwnerController = new GymOwnerController(gymOwnerService);
    app.use("/gym-owners", gymOwnerController.buildRouter());

    const trainingRoomController = new TrainingRoomController(trainingRoomService);
    app.use("/training-rooms", trainingRoomController.buildRouter());


    const PORT = process.env.PORT as string;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

}
main().catch((err) => {
    console.error("Error during main execution:", err);
});
