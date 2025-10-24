// Storage Service Stub
// This is a temporary stub while migrating from Supabase to PostgreSQL
// Image uploads will be handled by the backend API

export class StorageService {
  static async initializeBucket(): Promise<void> {
    // Stub: No-op for now
    return Promise.resolve();
  }

  static async uploadImage(file: File, path: string): Promise<string> {
    // Stub: Return a placeholder URL
    return Promise.resolve(`/uploads/${path}/${file.name}`);
  }

  static async deleteImage(path: string): Promise<void> {
    // Stub: No-op for now
    return Promise.resolve();
  }

  static getPublicUrl(path: string): string {
    // Stub: Return the path as-is
    return path;
  }
}

