import type { Profile } from "@/types/profile";
import { supabase } from "./supabase";

class StorageAdapter {
  async getProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to get profiles from Supabase:", error);
        return [];
      }

      if (!data) {
        return [];
      }

      // データベースのスキーマからProfile型に変換
      return data.map((row) => ({
        id: row.id,
        name: row.name,
        imageUrl: row.image_url || "",
        links: row.links || {},
      }));
    } catch (error) {
      console.error("Failed to get profiles from Supabase:", error);
      return [];
    }
  }

  async getProfile(id: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to get profile from Supabase:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      // データベースのスキーマからProfile型に変換
      return {
        id: data.id,
        name: data.name,
        imageUrl: data.image_url || "",
        links: data.links || {},
      };
    } catch (error) {
      console.error("Failed to get profile from Supabase:", error);
      return null;
    }
  }

  async saveProfile(profile: Profile): Promise<void> {
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: profile.id,
          name: profile.name,
          image_url: profile.imageUrl || null,
          links: profile.links || {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      );

      if (error) {
        console.error("Failed to save profile to Supabase:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to save profile to Supabase:", error);
      throw error;
    }
  }

  async deleteProfile(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);

      if (error) {
        console.error("Failed to delete profile from Supabase:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to delete profile from Supabase:", error);
      throw error;
    }
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // 作成者ID管理機能
  getMyProfileIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const ids = localStorage.getItem("myProfileIds");
      return ids ? JSON.parse(ids) : [];
    } catch (error) {
      console.error("Failed to get myProfileIds from localStorage:", error);
      return [];
    }
  }

  addMyProfileId(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const ids = this.getMyProfileIds();
      if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem("myProfileIds", JSON.stringify(ids));
      }
    } catch (error) {
      console.error("Failed to add myProfileId to localStorage:", error);
    }
  }

  removeMyProfileId(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const ids = this.getMyProfileIds();
      const filtered = ids.filter((profileId) => profileId !== id);
      localStorage.setItem("myProfileIds", JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to remove myProfileId from localStorage:", error);
    }
  }

  isMyProfile(id: string): boolean {
    return this.getMyProfileIds().includes(id);
  }
}

export const storage = new StorageAdapter();
