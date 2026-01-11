export class ValidationUtils {
    private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    static isValidEmail(email: string): boolean {
        return this.EMAIL_REGEX.test(email);
    }

    static validateEmail(email: string): void {
        if (!email) {
            throw new Error("Email is required");
        }
        if (!this.isValidEmail(email)) {
            throw new Error("Invalid email format");
        }
    }
}
