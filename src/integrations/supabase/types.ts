export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      goals: {
        Row: {
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          progress: number
          status: string
          target: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          progress?: number
          status?: string
          target?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          progress?: number
          status?: string
          target?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      habit_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_assignments_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_completions: {
        Row: {
          completed_at: string
          completed_on: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_on?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_on?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          active: boolean
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          frequency: string
          icon: string
          id: string
          name: string
          start_date: string
          target: string | null
          time_of_day: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency?: string
          icon?: string
          id?: string
          name: string
          start_date?: string
          target?: string | null
          time_of_day?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency?: string
          icon?: string
          id?: string
          name?: string
          start_date?: string
          target?: string | null
          time_of_day?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          activity_level: string | null
          available_time: number | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          current_weight: number | null
          email: string
          experience_level: string | null
          gender: string | null
          goal: string | null
          goal_other: string | null
          height_cm: number | null
          id: string
          last_seen_at: string | null
          name: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          onboarding_step: number
          preferred_activities: string[]
          start_weight: number | null
          target_weight: number | null
          training_frequency: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          activity_level?: string | null
          available_time?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          current_weight?: number | null
          email?: string
          experience_level?: string | null
          gender?: string | null
          goal?: string | null
          goal_other?: string | null
          height_cm?: number | null
          id: string
          last_seen_at?: string | null
          name?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          onboarding_step?: number
          preferred_activities?: string[]
          start_weight?: number | null
          target_weight?: number | null
          training_frequency?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          activity_level?: string | null
          available_time?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          current_weight?: number | null
          email?: string
          experience_level?: string | null
          gender?: string | null
          goal?: string | null
          goal_other?: string | null
          height_cm?: number | null
          id?: string
          last_seen_at?: string | null
          name?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          onboarding_step?: number
          preferred_activities?: string[]
          start_weight?: number | null
          target_weight?: number | null
          training_frequency?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          id: string
          scheduled_date: string | null
          user_id: string
          workout_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          id?: string
          scheduled_date?: string | null
          user_id: string
          workout_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          id?: string
          scheduled_date?: string | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_completions: {
        Row: {
          completed_at: string
          completed_on: string
          id: string
          notes: string | null
          user_id: string
          workout_id: string
        }
        Insert: {
          completed_at?: string
          completed_on?: string
          id?: string
          notes?: string | null
          user_id: string
          workout_id: string
        }
        Update: {
          completed_at?: string
          completed_on?: string
          id?: string
          notes?: string | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_completions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          description: string | null
          id: string
          load: string | null
          name: string
          notes: string | null
          position: number
          reps: string
          rest_seconds: number
          sets: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          load?: string | null
          name: string
          notes?: string | null
          position?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          workout_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          load?: string | null
          name?: string
          notes?: string | null
          position?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          active: boolean
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_min: number
          id: string
          level: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_min?: number
          id?: string
          level?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_min?: number
          id?: string
          level?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
