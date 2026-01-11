import { Request, Response, NextFunction } from "express";

export class ErrorMiddleware {
    static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
        console.error("Error occurred:", err);

        // Erreur de validation Mongoose
        if (err.name === "ValidationError") {
            res.status(400).json({
                message: "Validation error",
                error: err.message
            });
            return;
        }

        // Erreur de duplication (email existant)
        if (err.name === "MongoServerError" && (err as any).code === 11000) {
            res.status(409).json({
                message: "Duplicate key error",
                error: "A record with this value already exists"
            });
            return;
        }

        // Erreur de cast (ID invalide)
        if (err.name === "CastError") {
            res.status(400).json({
                message: "Invalid ID format",
                error: err.message
            });
            return;
        }

        // Erreur par défaut
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "production" ? "An error occurred" : err.message
        });
    }
}
