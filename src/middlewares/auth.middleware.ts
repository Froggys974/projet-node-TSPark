import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";
import jwt, { SignOptions } from "jsonwebtoken";

interface JWTPayload {
    userId: string;
    role: UserRole;
    email: string;
}

export class AuthMiddleware {
    private readonly JWT_SECRET: string;

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
    }

    authorize(...allowedRoles: UserRole[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                const authHeader = req.headers.authorization;

                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    res.status(401).json({
                        message: "Unauthorized: No token provided",
                        hint: "Include a valid JWT token in the Authorization header (Bearer <token>)"
                    });
                    return;
                }

                const token = authHeader.substring(7);

                const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
                if (allowedRoles.length === 0) {
                    req.user = decoded;
                    next();
                    return;
                }

                if (!allowedRoles.includes(decoded.role)) {
                    res.status(403).json({
                        message: "Forbidden: Insufficient permissions"
                    });
                    return;
                }

                req.user = decoded;
                next();

            } catch (error) {
                if (error instanceof jwt.JsonWebTokenError) {
                    res.status(401).json({
                        message: "Unauthorized: Invalid token"
                    });
                    return;
                } else if (error instanceof jwt.TokenExpiredError) {
                    res.status(401).json({
                        message: "Unauthorized: Token has expired"
                    });
                    return;
                } else {
                    res.status(500).json({
                        message: "Internal server error during authentication"
                    });
                    return;
                }
            }
        };
    }

    generateToken(payload: JWTPayload, expiresIn: string | number = "24h"): string {
        return jwt.sign(payload, this.JWT_SECRET, { expiresIn: expiresIn as any });
    }

    verifyToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
        } catch {
            return null;
        }
    }
}
