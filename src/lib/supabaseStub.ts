// Stub for Supabase client - returns empty data for all operations
// This is used temporarily while migrating from Supabase to PostgreSQL

export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({ data: [], error: null }),
      neq: (column: string, value: any) => ({ data: [], error: null }),
      gt: (column: string, value: any) => ({ data: [], error: null }),
      gte: (column: string, value: any) => ({ data: [], error: null }),
      lt: (column: string, value: any) => ({ data: [], error: null }),
      lte: (column: string, value: any) => ({ data: [], error: null }),
      like: (column: string, pattern: string) => ({ data: [], error: null }),
      ilike: (column: string, pattern: string) => ({ data: [], error: null }),
      is: (column: string, value: any) => ({ data: [], error: null }),
      in: (column: string, values: any[]) => ({ data: [], error: null }),
      contains: (column: string, value: any) => ({ data: [], error: null }),
      containedBy: (column: string, value: any) => ({ data: [], error: null }),
      rangeGt: (column: string, value: any) => ({ data: [], error: null }),
      rangeGte: (column: string, value: any) => ({ data: [], error: null }),
      rangeLt: (column: string, value: any) => ({ data: [], error: null }),
      rangeLte: (column: string, value: any) => ({ data: [], error: null }),
      rangeAdjacent: (column: string, value: any) => ({ data: [], error: null }),
      overlaps: (column: string, value: any) => ({ data: [], error: null }),
      textSearch: (column: string, query: string) => ({ data: [], error: null }),
      match: (query: Record<string, any>) => ({ data: [], error: null }),
      not: (column: string, operator: string, value: any) => ({ data: [], error: null }),
      or: (filters: string) => ({ data: [], error: null }),
      filter: (column: string, operator: string, value: any) => ({ data: [], error: null }),
      order: (column: string, options?: { ascending?: boolean }) => ({ data: [], error: null }),
      limit: (count: number) => ({ data: [], error: null }),
      range: (from: number, to: number) => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
      maybeSingle: () => ({ data: null, error: null }),
      csv: () => ({ data: '', error: null }),
    }),
    insert: (values: any) => ({
      select: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
      data: null,
      error: null
    }),
    upsert: (values: any) => ({
      select: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
      data: null,
      error: null
    }),
    update: (values: any) => ({
      eq: (column: string, value: any) => ({ data: [], error: null }),
      match: (query: Record<string, any>) => ({ data: [], error: null }),
      data: null,
      error: null
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({ data: [], error: null }),
      in: (column: string, values: any[]) => ({ data: [], error: null }),
      match: (query: Record<string, any>) => ({ data: [], error: null }),
      data: null,
      error: null
    }),
  }),
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signIn: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: Function) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
  storage: {
    from: (bucket: string) => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
      list: async () => ({ data: [], error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
    }),
  },
  rpc: async (fn: string, params?: any) => ({ data: null, error: null }),
};

// Helper functions for backward compatibility
export const getAllUsers = async () => ({ data: [], error: null });
export const updateUserRole = async (userId: string, role: string) => ({ data: null, error: null });
export const deleteUsersBulk = async (userIds: string[]) => ({ data: null, error: null });
export const updateUsersBulk = async (updates: any[]) => ({ data: null, error: null });
