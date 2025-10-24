/**
 * Hash a password
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare password with hash
 */
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
/**
 * Generate JWT token
 */
export declare function generateToken(userId: string, role: string): string;
/**
 * Verify JWT token
 */
export declare function verifyToken(token: string): {
    userId: string;
    role: string;
};
/**
 * Extract token from Authorization header
 */
export declare function extractToken(authHeader?: string): string | null;
//# sourceMappingURL=auth.d.ts.map