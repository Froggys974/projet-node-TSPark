import bcrypt from "bcrypt";

export class SecurityUtils {
    private static readonly SALT_ROUNDS = 10;

    static async hashPassword(plainPassword: string): Promise<string> {
        return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    }

    static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static validatePasswordStrength(password: string): { valid: boolean; message?: string } {
        if (password.length < 8) {
            return { valid: false, message: "Password must be at least 8 characters long" };
        }

        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: "Password must contain at least one uppercase letter" };
        }

        if (!/[a-z]/.test(password)) {
            return { valid: false, message: "Password must contain at least one lowercase letter" };
        }

        if (!/[0-9]/.test(password)) {
            return { valid: false, message: "Password must contain at least one number" };
        }

        return { valid: true };
    }
}
