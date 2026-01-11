import { Request, Response, Router } from "express";
import { UserService } from "../services";
import { AuthMiddleware } from "../middlewares";
import { SecurityUtils, ValidationUtils } from "../utils";
import { UserRole } from "../types";

export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly authMiddleware: AuthMiddleware
    ) {}

    async registerUser(req: Request, res: Response): Promise<void> {
        try {
            const { firstName, lastName, email, password, dateOfBirth, gender } = req.body;

            if (!firstName || !lastName || !email || !password) {
                res.status(400).json({ message: "firstName, lastName, email and password are required" });
                return;
            }

            try {
                ValidationUtils.validateEmail(email);
            } catch (error: any) {
                res.status(400).json({ message: error.message });
                return;
            }

            const passwordValidation = SecurityUtils.validatePasswordStrength(password);
            if (!passwordValidation.valid) {
                res.status(400).json({ message: passwordValidation.message });
                return;
            }

            const existingUser = await this.userService.getUserByEmail(email);
            if (existingUser) {
                res.status(409).json({ message: "Email already exists" });
                return;
            }

            const hashedPassword = await SecurityUtils.hashPassword(password);

            const userData: any = {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: UserRole.USER,
                badges: [],
                points: 0,
                level: 1,
                isActive: true,
                isVerified: false
            };

            if (dateOfBirth) {
                userData.dateOfBirth = new Date(dateOfBirth);
            }

            if (gender) {
                userData.gender = gender;
            }

            const user = await this.userService.createUser(userData);

            const token = this.authMiddleware.generateToken({
                userId: user._id.toString(),
                role: user.role,
                email: user.email
            });

            res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async registerGymOwner(req: Request, res: Response): Promise<void> {
        try {
            const { firstName, lastName, email, password } = req.body;

            if (!firstName || !lastName || !email || !password) {
                res.status(400).json({ message: "firstName, lastName, email and password are required" });
                return;
            }

            try {
                ValidationUtils.validateEmail(email);
            } catch (error: any) {
                res.status(400).json({ message: error.message });
                return;
            }

            const passwordValidation = SecurityUtils.validatePasswordStrength(password);
            if (!passwordValidation.valid) {
                res.status(400).json({ message: passwordValidation.message });
                return;
            }

            const existingUser = await this.userService.getUserByEmail(email);
            if (existingUser) {
                res.status(409).json({ message: "Email already exists" });
                return;
            }

            const hashedPassword = await SecurityUtils.hashPassword(password);

            const gymOwner = await this.userService.createUser({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: UserRole.GYM_OWNER,
                badges: [],
                points: 0,
                level: 1,
                isActive: true,
                isVerified: false
            });

            const token = this.authMiddleware.generateToken({
                userId: gymOwner._id.toString(),
                role: UserRole.GYM_OWNER,
                email: gymOwner.email
            });

            res.status(201).json({
                message: "Gym owner registered successfully",
                token,
                user: {
                    _id: gymOwner._id,
                    firstName: gymOwner.firstName,
                    lastName: gymOwner.lastName,
                    email: gymOwner.email,
                    role: gymOwner.role
                }
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "email and password are required" });
                return;
            }

            const user = await this.userService.getUserByEmailWithPassword(email);
            if (!user) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            const isPasswordValid = await SecurityUtils.comparePassword(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            if (user.isActive === false) {
                res.status(403).json({ message: "Account is deactivated" });
                return;
            }

            const token = this.authMiddleware.generateToken({
                userId: user._id.toString(),
                role: user.role,
                email: user.email
            });

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    points: user.points,
                    level: user.level
                }
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async loginGymOwner(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "email and password are required" });
                return;
            }

            const user = await this.userService.getUserByEmailWithPassword(email);
            if (!user) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            if (user.role !== UserRole.GYM_OWNER) {
                res.status(403).json({ message: "This login is reserved for gym owners" });
                return;
            }

            const isPasswordValid = await SecurityUtils.comparePassword(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            if (user.isActive === false) {
                res.status(403).json({ message: "Account is deactivated" });
                return;
            }

            const token = this.authMiddleware.generateToken({
                userId: user._id.toString(),
                role: user.role,
                email: user.email
            });

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async loginAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "email and password are required" });
                return;
            }

            const user = await this.userService.getUserByEmailWithPassword(email);
            if (!user) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            if (user.role !== UserRole.ADMIN) {
                res.status(403).json({ message: "This login is reserved for administrators" });
                return;
            }

            const isPasswordValid = await SecurityUtils.comparePassword(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            if (user.isActive === false) {
                res.status(403).json({ message: "Account is deactivated" });
                return;
            }

            const token = this.authMiddleware.generateToken({
                userId: user._id.toString(),
                role: user.role,
                email: user.email
            });

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMe(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({ message: "Not authenticated" });
                return;
            }

            const user = await this.userService.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            res.status(200).json(user);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    buildRouter(): Router {
        const router = Router();

        router.post("/register/user", this.registerUser.bind(this));
        router.post("/register/gym-owner", this.registerGymOwner.bind(this));
        router.post("/login", this.login.bind(this));
        router.post("/login/gym-owner", this.loginGymOwner.bind(this));
        router.post("/login/admin", this.loginAdmin.bind(this));
        router.get("/me", this.authMiddleware.authorize(), this.getMe.bind(this));

        return router;
    }
}
