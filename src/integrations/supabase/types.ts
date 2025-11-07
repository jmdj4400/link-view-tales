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
      channel_alerts: {
        Row: {
          acknowledged: boolean | null
          alert_type: string
          created_at: string | null
          id: string
          message: string
          platform: string
          recommendation: string | null
          severity: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          platform: string
          recommendation?: string | null
          severity?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          platform?: string
          recommendation?: string | null
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      channel_benchmarks: {
        Row: {
          avg_conversion_rate: number | null
          avg_ctr: number | null
          avg_redirect_success: number | null
          created_at: string | null
          id: string
          platform: string
          sample_size: number | null
          updated_at: string | null
        }
        Insert: {
          avg_conversion_rate?: number | null
          avg_ctr?: number | null
          avg_redirect_success?: number | null
          created_at?: string | null
          id?: string
          platform: string
          sample_size?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_conversion_rate?: number | null
          avg_ctr?: number | null
          avg_redirect_success?: number | null
          created_at?: string | null
          id?: string
          platform?: string
          sample_size?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string | null
          email_type: string
          error_message: string | null
          id: string
          sent_at: string | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          success?: boolean | null
          user_id?: string
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
          variant_id: string | null
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
          variant_id?: string | null
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
          variant_id?: string | null
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
            foreignKeyName: "events_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "link_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string | null
          end_ts: string | null
          id: string
          link_id: string | null
          start_ts: string | null
          status: string | null
          user_id: string
          variant_a_id: string | null
          variant_b_id: string | null
          winner: string | null
        }
        Insert: {
          created_at?: string | null
          end_ts?: string | null
          id?: string
          link_id?: string | null
          start_ts?: string | null
          status?: string | null
          user_id: string
          variant_a_id?: string | null
          variant_b_id?: string | null
          winner?: string | null
        }
        Update: {
          created_at?: string | null
          end_ts?: string | null
          id?: string
          link_id?: string | null
          start_ts?: string | null
          status?: string | null
          user_id?: string
          variant_a_id?: string | null
          variant_b_id?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiments_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_variant_a_id_fkey"
            columns: ["variant_a_id"]
            isOneToOne: false
            referencedRelation: "link_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_variant_b_id_fkey"
            columns: ["variant_b_id"]
            isOneToOne: false
            referencedRelation: "link_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_events: {
        Row: {
          conversion_value: number | null
          event_ref: string | null
          goal_id: string | null
          id: string
          link_id: string | null
          matched_click_id: string | null
          referrer: string | null
          source: string | null
          ts: string
        }
        Insert: {
          conversion_value?: number | null
          event_ref?: string | null
          goal_id?: string | null
          id?: string
          link_id?: string | null
          matched_click_id?: string | null
          referrer?: string | null
          source?: string | null
          ts?: string
        }
        Update: {
          conversion_value?: number | null
          event_ref?: string | null
          goal_id?: string | null
          id?: string
          link_id?: string | null
          matched_click_id?: string | null
          referrer?: string | null
          source?: string | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_events_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_events_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          affected_users: number | null
          country: string | null
          detected_at: string
          device: string | null
          error_rate: number
          id: string
          metadata: Json | null
          platform: string
          resolved_at: string | null
          sample_size: number | null
          severity: string
        }
        Insert: {
          affected_users?: number | null
          country?: string | null
          detected_at?: string
          device?: string | null
          error_rate: number
          id?: string
          metadata?: Json | null
          platform: string
          resolved_at?: string | null
          sample_size?: number | null
          severity: string
        }
        Update: {
          affected_users?: number | null
          country?: string | null
          detected_at?: string
          device?: string | null
          error_rate?: number
          id?: string
          metadata?: Json | null
          platform?: string
          resolved_at?: string | null
          sample_size?: number | null
          severity?: string
        }
        Relationships: []
      }
      lead_forms: {
        Row: {
          button_text: string | null
          collect_message: boolean | null
          collect_name: boolean | null
          collect_phone: boolean | null
          created_at: string | null
          custom_fields: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          redirect_url: string | null
          send_confirmation_email: boolean | null
          submission_count: number | null
          success_message: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          button_text?: string | null
          collect_message?: boolean | null
          collect_name?: boolean | null
          collect_phone?: boolean | null
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          redirect_url?: string | null
          send_confirmation_email?: boolean | null
          submission_count?: number | null
          success_message?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          button_text?: string | null
          collect_message?: boolean | null
          collect_name?: boolean | null
          collect_phone?: boolean | null
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          redirect_url?: string | null
          send_confirmation_email?: boolean | null
          submission_count?: number | null
          success_message?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          email: string
          form_id: string | null
          id: string
          message: string | null
          metadata: Json | null
          name: string | null
          phone: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          form_id?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          form_id?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "lead_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      link_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          position: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      link_variants: {
        Row: {
          created_at: string | null
          dest_url: string
          id: string
          is_active: boolean | null
          link_id: string
          name: string
          traffic_percentage: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dest_url: string
          id?: string
          is_active?: boolean | null
          link_id: string
          name: string
          traffic_percentage?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dest_url?: string
          id?: string
          is_active?: boolean | null
          link_id?: string
          name?: string
          traffic_percentage?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_variants_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          active_from: string | null
          active_until: string | null
          category_id: string | null
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
          category_id?: string | null
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
          category_id?: string | null
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
            foreignKeyName: "links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "link_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_daily: {
        Row: {
          avg_session_duration: number | null
          clicks: number | null
          conversion_count: number | null
          created_at: string | null
          ctr: number | null
          date: string
          flow_integrity_score: number | null
          id: string
          page_views: number | null
          redirect_success_rate: number | null
          top_referrer: string | null
          user_id: string
        }
        Insert: {
          avg_session_duration?: number | null
          clicks?: number | null
          conversion_count?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          flow_integrity_score?: number | null
          id?: string
          page_views?: number | null
          redirect_success_rate?: number | null
          top_referrer?: string | null
          user_id: string
        }
        Update: {
          avg_session_duration?: number | null
          clicks?: number | null
          conversion_count?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          flow_integrity_score?: number | null
          id?: string
          page_views?: number | null
          redirect_success_rate?: number | null
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
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          active_theme_id: string | null
          avatar_url: string | null
          background_color: string | null
          background_image_url: string | null
          background_pattern: string | null
          bio: string | null
          body_font: string | null
          button_style: string | null
          card_style: string | null
          created_at: string | null
          email: string
          firewall_enabled: boolean | null
          handle: string
          heading_font: string | null
          id: string
          instagram_bio_setup_completed: boolean | null
          layout_style: string | null
          name: string | null
          onboarding_completed_at: string | null
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          primary_color: string | null
          secondary_color: string | null
          setup_guide_dismissed: boolean | null
          text_color: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          active_theme_id?: string | null
          avatar_url?: string | null
          background_color?: string | null
          background_image_url?: string | null
          background_pattern?: string | null
          bio?: string | null
          body_font?: string | null
          button_style?: string | null
          card_style?: string | null
          created_at?: string | null
          email: string
          firewall_enabled?: boolean | null
          handle: string
          heading_font?: string | null
          id: string
          instagram_bio_setup_completed?: boolean | null
          layout_style?: string | null
          name?: string | null
          onboarding_completed_at?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          primary_color?: string | null
          secondary_color?: string | null
          setup_guide_dismissed?: boolean | null
          text_color?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          active_theme_id?: string | null
          avatar_url?: string | null
          background_color?: string | null
          background_image_url?: string | null
          background_pattern?: string | null
          bio?: string | null
          body_font?: string | null
          button_style?: string | null
          card_style?: string | null
          created_at?: string | null
          email?: string
          firewall_enabled?: boolean | null
          handle?: string
          heading_font?: string | null
          id?: string
          instagram_bio_setup_completed?: boolean | null
          layout_style?: string | null
          name?: string | null
          onboarding_completed_at?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          primary_color?: string | null
          secondary_color?: string | null
          setup_guide_dismissed?: boolean | null
          text_color?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_theme_id_fkey"
            columns: ["active_theme_id"]
            isOneToOne: false
            referencedRelation: "theme_presets"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          accent_color: string | null
          avatar_url: string | null
          background_color: string | null
          background_image_url: string | null
          background_pattern: string | null
          bio: string | null
          body_font: string | null
          button_style: string | null
          card_style: string | null
          created_at: string | null
          handle: string
          heading_font: string | null
          id: string
          layout_style: string | null
          name: string | null
          primary_color: string | null
          secondary_color: string | null
          text_color: string | null
          theme: string | null
        }
        Insert: {
          accent_color?: string | null
          avatar_url?: string | null
          background_color?: string | null
          background_image_url?: string | null
          background_pattern?: string | null
          bio?: string | null
          body_font?: string | null
          button_style?: string | null
          card_style?: string | null
          created_at?: string | null
          handle: string
          heading_font?: string | null
          id: string
          layout_style?: string | null
          name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          theme?: string | null
        }
        Update: {
          accent_color?: string | null
          avatar_url?: string | null
          background_color?: string | null
          background_image_url?: string | null
          background_pattern?: string | null
          bio?: string | null
          body_font?: string | null
          button_style?: string | null
          card_style?: string | null
          created_at?: string | null
          handle?: string
          heading_font?: string | null
          id?: string
          layout_style?: string | null
          name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          theme?: string | null
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
      recovery_attempts: {
        Row: {
          browser: string
          created_at: string
          device: string
          id: string
          link_id: string | null
          platform: string
          strategy_used: string
          success: boolean
          user_id: string
        }
        Insert: {
          browser: string
          created_at?: string
          device: string
          id?: string
          link_id?: string | null
          platform: string
          strategy_used: string
          success?: boolean
          user_id: string
        }
        Update: {
          browser?: string
          created_at?: string
          device?: string
          id?: string
          link_id?: string | null
          platform?: string
          strategy_used?: string
          success?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_attempts_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          avoided_failure: boolean | null
          browser: string | null
          country: string | null
          device: string | null
          fallback_used: boolean | null
          firewall_strategy: string | null
          id: string
          link_id: string | null
          platform: string | null
          referrer: string | null
          risk_score: number | null
          success: boolean | null
          ts: string
          user_agent: string | null
        }
        Insert: {
          avoided_failure?: boolean | null
          browser?: string | null
          country?: string | null
          device?: string | null
          fallback_used?: boolean | null
          firewall_strategy?: string | null
          id?: string
          link_id?: string | null
          platform?: string | null
          referrer?: string | null
          risk_score?: number | null
          success?: boolean | null
          ts?: string
          user_agent?: string | null
        }
        Update: {
          avoided_failure?: boolean | null
          browser?: string | null
          country?: string | null
          device?: string | null
          fallback_used?: boolean | null
          firewall_strategy?: string | null
          id?: string
          link_id?: string | null
          platform?: string | null
          referrer?: string | null
          risk_score?: number | null
          success?: boolean | null
          ts?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redirects_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_templates: {
        Row: {
          category: string | null
          conditions: Json
          created_at: string | null
          description: string
          dest_example: string | null
          id: string
          impact_score: number | null
          name: string
        }
        Insert: {
          category?: string | null
          conditions: Json
          created_at?: string | null
          description: string
          dest_example?: string | null
          id?: string
          impact_score?: number | null
          name: string
        }
        Update: {
          category?: string | null
          conditions?: Json
          created_at?: string | null
          description?: string
          dest_example?: string | null
          id?: string
          impact_score?: number | null
          name?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          conditions: Json
          created_at: string | null
          dest_url: string
          id: string
          is_active: boolean | null
          link_id: string | null
          priority: number | null
        }
        Insert: {
          conditions: Json
          created_at?: string | null
          dest_url: string
          id?: string
          is_active?: boolean | null
          link_id?: string | null
          priority?: number | null
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          dest_url?: string
          id?: string
          is_active?: boolean | null
          link_id?: string | null
          priority?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rules_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecards: {
        Row: {
          created_at: string
          data: Json
          id: string
          period_end: string
          period_start: string
          signature: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          period_end: string
          period_start: string
          signature: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          period_end?: string
          period_start?: string
          signature?: string
          updated_at?: string
          user_id?: string
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
        ]
      }
      theme_presets: {
        Row: {
          accent_color: string | null
          background_color: string | null
          background_image_url: string | null
          background_pattern: string | null
          body_font: string | null
          button_style: string | null
          card_style: string | null
          created_at: string | null
          heading_font: string | null
          id: string
          is_active: boolean | null
          layout_style: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          text_color: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          background_image_url?: string | null
          background_pattern?: string | null
          body_font?: string | null
          button_style?: string | null
          card_style?: string | null
          created_at?: string | null
          heading_font?: string | null
          id?: string
          is_active?: boolean | null
          layout_style?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          background_image_url?: string | null
          background_pattern?: string | null
          body_font?: string | null
          button_style?: string | null
          card_style?: string | null
          created_at?: string | null
          heading_font?: string | null
          id?: string
          is_active?: boolean | null
          layout_style?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_redirect_risk: {
        Args: { p_country: string; p_platform: string; p_user_agent: string }
        Returns: number
      }
      check_and_increment_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_requests: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_requests: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      get_user_scorecard_data: {
        Args: {
          p_period_end: string
          p_period_start: string
          p_user_id: string
        }
        Returns: Json
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
