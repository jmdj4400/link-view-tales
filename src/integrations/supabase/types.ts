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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_whitelist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invited_at: string | null
          invited_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          country: string | null
          created_at: string | null
          event_type: string
          id: string
          is_bot: boolean | null
          link_id: string | null
          referrer: string | null
          user_agent_hash: string | null
          user_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          is_bot?: boolean | null
          link_id?: string | null
          referrer?: string | null
          user_agent_hash?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          is_bot?: boolean | null
          link_id?: string | null
          referrer?: string | null
          user_agent_hash?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          active_from: string | null
          active_until: string | null
          created_at: string | null
          current_clicks: number | null
          dest_url: string
          id: string
          is_active: boolean | null
          max_clicks: number | null
          position: number
          title: string
          updated_at: string | null
          user_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string | null
          current_clicks?: number | null
          dest_url: string
          id?: string
          is_active?: boolean | null
          max_clicks?: number | null
          position?: number
          title: string
          updated_at?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string | null
          current_clicks?: number | null
          dest_url?: string
          id?: string
          is_active?: boolean | null
          max_clicks?: number | null
          position?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_daily: {
        Row: {
          clicks: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          page_views: number | null
          top_referrer: string | null
          user_id: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          id?: string
          page_views?: number | null
          top_referrer?: string | null
          user_id: string
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          page_views?: number | null
          top_referrer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_daily_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_daily_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          handle: string
          id: string
          name: string | null
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          handle: string
          id: string
          name?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          handle?: string
          id?: string
          name?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          count?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end_date: string | null
          trial_granted: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          trial_granted?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          trial_granted?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          handle: string | null
          id: string | null
          name: string | null
          theme: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          handle?: string | null
          id?: string | null
          name?: string | null
          theme?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          handle?: string | null
          id?: string | null
          name?: string | null
          theme?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_requests: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      grant_trial: { Args: { p_user_id: string }; Returns: undefined }
      is_email_whitelisted: { Args: { check_email: string }; Returns: boolean }
    }
    Enums: {
      subscription_plan: "free" | "pro" | "business"
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
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
      subscription_plan: ["free", "pro", "business"],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
    },
  },
} as const
