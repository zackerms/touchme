import type { Profile } from "@/types/profile";

const STORAGE_KEY = "touchme_profiles";

class StorageAdapter {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  getProfiles(): Profile[] {
    if (!this.isClient()) {
      return [];
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as Profile[];
    } catch (error) {
      console.error("Failed to get profiles from localStorage:", error);
      return [];
    }
  }

  getProfile(id: string): Profile | null {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  }

  saveProfile(profile: Profile): void {
    if (!this.isClient()) {
      return;
    }

    try {
      const profiles = this.getProfiles();
      const existingIndex = profiles.findIndex((p) => p.id === profile.id);

      if (existingIndex >= 0) {
        profiles[existingIndex] = profile;
      } else {
        profiles.push(profile);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error("Failed to save profile to localStorage:", error);
    }
  }

  deleteProfile(id: string): void {
    if (!this.isClient()) {
      return;
    }

    try {
      const profiles = this.getProfiles();
      const filtered = profiles.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete profile from localStorage:", error);
    }
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const storage = new StorageAdapter();

