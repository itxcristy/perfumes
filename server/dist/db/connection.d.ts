import { PoolClient, QueryResult } from 'pg';
declare const pool: any;
/**
 * Initialize database connection and verify connectivity
 */
export declare function initializeDatabase(): Promise<void>;
/**
 * Execute a query with connection pooling
 */
export declare function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
/**
 * Get a client from the pool for transactions
 */
export declare function getClient(): Promise<PoolClient>;
/**
 * Close the connection pool
 */
export declare function closePool(): Promise<void>;
export { pool };
//# sourceMappingURL=connection.d.ts.map