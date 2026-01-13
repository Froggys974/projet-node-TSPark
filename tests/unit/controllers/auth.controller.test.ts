import { AuthController } from "../../../src/controllers/auth.controller";
import { UserService } from "../../../src/services/mongoose/services/user.service"; // Adjust import if needed, controller imports from ../services
import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response } from "express";
import { UserRole } from "../../../src/types";
import { SecurityUtils, ValidationUtils } from "../../../src/utils";

// Mock dependencies
jest.mock("../../../src/services/mongoose/services/user.service");
jest.mock("../../../src/middlewares/auth.middleware");
jest.mock("../../../src/utils");

describe("AuthController", () => {
    let authController: AuthController;
    let userService: jest.Mocked<UserService>;
    let authMiddleware: jest.Mocked<AuthMiddleware>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Instantiate mocked dependencies
        userService = new UserService({} as any) as jest.Mocked<UserService>;
        authMiddleware = new AuthMiddleware() as jest.Mocked<AuthMiddleware>;
        
        // Mock specific methods needed
        userService.getUserByEmail = jest.fn();
        userService.createUser = jest.fn();
        authMiddleware.generateToken = jest.fn();

        // Setup controller
        authController = new AuthController(userService, authMiddleware);

        // Setup Response mock
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    describe("registerUser", () => {
        const validUserBody = {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "Password123!",
            dateOfBirth: "1990-01-01",
            gender: "MALE"
        };

        it("should return 400 if required fields are missing", async () => {
            req = {
                body: { firstName: "John" } // Missing fields
            };

            await authController.registerUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ 
                message: "firstName, lastName, email and password are required" 
            });
        });

        it("should return 400 if email is invalid", async () => {
            req = { body: { ...validUserBody, email: "invalid-email" } };
            
            // Mock ValidationUtils.validateEmail to throw error
            (ValidationUtils.validateEmail as jest.Mock).mockImplementation(() => {
                throw new Error("Invalid email format");
            });

            await authController.registerUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Invalid email format" });
        });

        it("should return 400 if password is weak", async () => {
            req = { body: validUserBody };
            
            (ValidationUtils.validateEmail as jest.Mock).mockImplementation(() => { return true; });
            (SecurityUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
                valid: false,
                message: "Password too weak"
            });

            await authController.registerUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Password too weak" });
        });

        it("should return 409 if email already exists", async () => {
            req = { body: validUserBody };
            
            (ValidationUtils.validateEmail as jest.Mock).mockImplementation(() => { return true; });
            (SecurityUtils.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
            
            userService.getUserByEmail.mockResolvedValue({ _id: "existing_id" } as any);

            await authController.registerUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(409);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Email already exists" });
        });

        it("should register user successfully", async () => {
            req = { body: validUserBody };
            
            (ValidationUtils.validateEmail as jest.Mock).mockImplementation(() => { return true; });
            (SecurityUtils.validatePasswordStrength as jest.Mock).mockReturnValue({ valid: true });
            (SecurityUtils.hashPassword as jest.Mock).mockResolvedValue("hashed_password");
            
            userService.getUserByEmail.mockResolvedValue(null);
            
            const createdUser = {
                _id: "new_user_id",
                firstName: validUserBody.firstName,
                lastName: validUserBody.lastName,
                email: validUserBody.email,
                role: UserRole.USER
            };
            userService.createUser.mockResolvedValue(createdUser as any);
            
            authMiddleware.generateToken.mockReturnValue("fake_token");

            await authController.registerUser(req as Request, res as Response);

            expect(userService.createUser).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                message: "User registered successfully",
                token: "fake_token",
                user: expect.objectContaining({
                    email: validUserBody.email
                })
            }));
        });
    });
});
