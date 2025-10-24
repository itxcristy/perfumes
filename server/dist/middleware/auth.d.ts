import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
    role?: string;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
/**
 * Authentication middleware - verifies JWT token
 */
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
/**
 * Authorization middleware - checks user role
 */
export declare function authorize(...allowedRoles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => any;
/**
 * Optional authentication - doesn't fail if token is missing
 */
export declare function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map