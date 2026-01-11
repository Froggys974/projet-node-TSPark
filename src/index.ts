import express from "express";
import {
    openMongooseConnection,
    UserService,
    GymService,
    ExerciseCategoryService,
    EquipmentService,
    ExerciseService,
    WorkoutService,
    WorkoutStepService,
    WorkoutSessionService,
    ChallengeService,
    ChallengeParticipationService,
    BadgeService
} from "./services";
import {
    HealthCheckController,
    AuthController,
    UserController,
    GymController,
    ExerciseCategoryController,
    EquipmentController,
    ExerciseController,
    WorkoutController,
    WorkoutStepController,
    WorkoutSessionController,
    ChallengeController,
    ChallengeParticipationController,
    BadgeController
} from "./controllers";
import { ValidationMiddleware, AuthMiddleware, ErrorMiddleware } from "./middlewares";
import { SecurityUtils } from "./utils";
import { UserRole } from "./types";
import { config } from "dotenv";

config();

async function createDefaultAdmin(userService: UserService): Promise<void> {
    const isEmpty = await userService.isEmpty();
    if (isEmpty) {
        const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin123!";
        const hashedPassword = await SecurityUtils.hashPassword(adminPassword);
        await userService.createUser({
            email: "admin@fitnesspark.com",
            password: hashedPassword,
            firstName: "Admin",
            lastName: "System",
            role: UserRole.ADMIN,
            badges: [],
            points: 0,
            level: 1,
            isActive: true,
            isVerified: true
        });
        console.log("Default admin created: admin@fitnesspark.com");
    }
}

async function main(): Promise<void> {
    const mongooseConnexion = await openMongooseConnection();
    const app = express();
    app.use(express.json());

    const healthCheckController = new HealthCheckController();
    app.use("/health-check", healthCheckController.buildRouter());

    const userService = new UserService(mongooseConnexion);

    await createDefaultAdmin(userService);
    const gymService = new GymService(mongooseConnexion);
    const exerciseCategoryService = new ExerciseCategoryService(mongooseConnexion);
    const equipmentService = new EquipmentService(mongooseConnexion);
    const exerciseService = new ExerciseService(mongooseConnexion);
    const workoutService = new WorkoutService(mongooseConnexion);
    const workoutStepService = new WorkoutStepService(mongooseConnexion);
    const workoutSessionService = new WorkoutSessionService(mongooseConnexion);
    const challengeService = new ChallengeService(mongooseConnexion);
    const challengeParticipationService = new ChallengeParticipationService(mongooseConnexion);
    const badgeService = new BadgeService(mongooseConnexion);

    const validationMiddleware = new ValidationMiddleware();
    const authMiddleware = new AuthMiddleware();

    const authController = new AuthController(userService, authMiddleware);
    app.use("/auth", authController.buildRouter());

    const userController = new UserController(userService, challengeParticipationService, authMiddleware);
    app.use("/users", userController.buildRouter());

    const gymController = new GymController(gymService, authMiddleware);
    app.use("/gyms", gymController.buildRouter());

    const exerciseCategoryController = new ExerciseCategoryController(exerciseCategoryService, authMiddleware);
    app.use("/exercise-categories", exerciseCategoryController.buildRouter());

    const equipmentController = new EquipmentController(equipmentService, gymService, authMiddleware);
    app.use("/equipments", equipmentController.buildRouter());

    const exerciseController = new ExerciseController(exerciseService, authMiddleware);
    app.use("/exercises", exerciseController.buildRouter());

    const workoutController = new WorkoutController(workoutService, workoutStepService, gymService, authMiddleware);
    app.use("/workouts", workoutController.buildRouter());

    const workoutStepController = new WorkoutStepController(workoutStepService, workoutService, equipmentService, gymService, authMiddleware);
    app.use("/workout-steps", workoutStepController.buildRouter());

    const workoutSessionController = new WorkoutSessionController(workoutSessionService, workoutService, workoutStepService, authMiddleware);
    app.use("/workout-sessions", workoutSessionController.buildRouter());

    const challengeController = new ChallengeController(challengeService, workoutService, gymService, validationMiddleware, authMiddleware);
    app.use("/challenges", challengeController.buildRouter());

    const challengeParticipationController = new ChallengeParticipationController(
        challengeParticipationService,
        challengeService,
        workoutSessionService,
        userService,
        authMiddleware
    );
    app.use("/participations", challengeParticipationController.buildRouter());

    const badgeController = new BadgeController(badgeService, authMiddleware);
    app.use("/badges", badgeController.buildRouter());

    app.use(ErrorMiddleware.handle);

    const PORT = process.env.PORT as string;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

main().catch((err) => {
    console.error("Error during main execution:", err);
});
