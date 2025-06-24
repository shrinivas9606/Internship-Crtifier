// This certificate generator app uses Firebase for all data storage
// We don't need traditional server-side storage as everything is handled client-side
// This file is kept for compatibility but not actively used

export interface IStorage {
  // Empty interface for compatibility
}

export class MemStorage implements IStorage {
  constructor() {
    // Firebase handles all storage
  }
}

export const storage = new MemStorage();
