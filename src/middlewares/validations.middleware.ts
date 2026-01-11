import { Request, Response, NextFunction } from "express";

export class ValidationMiddleware {
    constructor() {}

    validateChallengeDates() {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { startDate, endDate } = req.body;

            if (!startDate || !endDate) {
                res.status(400).json({ message: "startDate and endDate are required" });
                return;
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (end <= start) {
                res.status(400).json({ message: "endDate must be after startDate" });
                return;
            }

            next();
        };
    }

    validateSessionDates() {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { startedAt, completedAt } = req.body;

            if (completedAt && startedAt) {
                const start = new Date(startedAt);
                const end = new Date(completedAt);

                if (end <= start) {
                    res.status(400).json({ message: "completedAt must be after startedAt" });
                    return;
                }
            }

            next();
        };
    }

    validateMaxParticipants() {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { maxParticipants } = req.body;

            if (maxParticipants !== undefined && maxParticipants <= 0) {
                res.status(400).json({ message: "maxParticipants must be greater than 0" });
                return;
            }

            next();
        };
    }
}
