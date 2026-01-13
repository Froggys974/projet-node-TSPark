import { AuthMiddleware } from "../../../src/middlewares/auth.middleware";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../../src/types";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("AuthMiddleware", () => {
    let authMiddleware: AuthMiddleware;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        process.env.JWT_SECRET = "test_secret";
        authMiddleware = new AuthMiddleware();
        
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
        next = jest.fn();
        req = {
            headers: {}
        };
        
        jest.clearAllMocks();
    });

    describe("generateToken", () => {
        it("should call jwt.sign with correct params", () => {
            const payload = { userId: "123", role: UserRole.USER, email: "test@test.com" };
            (jwt.sign as jest.Mock).mockReturnValue("signed_token");
            
            const token = authMiddleware.generateToken(payload);
            
            expect(jwt.sign).toHaveBeenCalledWith(payload, "test_secret", { expiresIn: "24h" });
            expect(token).toBe("signed_token");
        });
    });

    describe("authorize", () => {
        it("should return 401 if no authorization header", () => {
            req.headers = {};
            
            const middleware = authMiddleware.authorize(UserRole.USER);
            middleware(req as Request, res as Response, next);
            
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Unauthorized: No token provided" }));
            expect(next).not.toHaveBeenCalled();
        });

        it("should return 401 if authorization header format is wrong", () => {
            req.headers = { authorization: "Token 12345" };
            
            const middleware = authMiddleware.authorize(UserRole.USER);
            middleware(req as Request, res as Response, next);
            
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Unauthorized: No token provided" }));
        });

        it("should return 401 if token is invalid", () => {
            req.headers = { authorization: "Bearer invalid_token" };
            const error = new jwt.JsonWebTokenError("Invalid token");
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw error;
            });
            
            const middleware = authMiddleware.authorize(UserRole.USER);
            middleware(req as Request, res as Response, next);
            
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Unauthorized: Invalid token" }));
        });

        it("should return 403 if role is not allowed", () => {
            req.headers = { authorization: "Bearer valid_token" };
            (jwt.verify as jest.Mock).mockReturnValue({ role: UserRole.USER });
            
            const middleware = authMiddleware.authorize(UserRole.ADMIN); // Expect ADMIN
            middleware(req as Request, res as Response, next);
            
            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: "Forbidden: Insufficient permissions" }));
        });

        it("should call next if authenticated and role authorized", () => {
            req.headers = { authorization: "Bearer valid_token" };
            const payload = { role: UserRole.USER, userId: "1", email: "a@a.com" };
            (jwt.verify as jest.Mock).mockReturnValue(payload);
            
            const middleware = authMiddleware.authorize(UserRole.USER);
            middleware(req as Request, res as Response, next);
            
            expect(next).toHaveBeenCalled();
            // Need cast to any because TS might complain about 'user' property on Partial<Request> 
            // depending on global type definitions availability in test context.
            expect((req as any).user).toEqual(payload);
        });
    });
});
