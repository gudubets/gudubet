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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_activities: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activities_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          admin_id: string
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_granted: boolean | null
          permission_name: string
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean | null
          permission_name: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean | null
          permission_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          department: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          password_hash: string
          role_type: Database["public"]["Enums"]["admin_role"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          password_hash: string
          role_type?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          password_hash?: string
          role_type?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_admins_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          country_code: string | null
          created_at: string
          device_type: string | null
          event_category: string
          event_name: string
          event_properties: Json | null
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          event_category: string
          event_name: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          event_category?: string
          event_name?: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      betslip_items: {
        Row: {
          betslip_id: string
          created_at: string | null
          id: string
          market_name: string
          market_type: string
          match_id: string
          odds_id: string
          odds_value: number
          selection: string
          stake: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          betslip_id: string
          created_at?: string | null
          id?: string
          market_name: string
          market_type: string
          match_id: string
          odds_id: string
          odds_value: number
          selection: string
          stake: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          betslip_id?: string
          created_at?: string | null
          id?: string
          market_name?: string
          market_type?: string
          match_id?: string
          odds_id?: string
          odds_value?: number
          selection?: string
          stake?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "betslip_items_betslip_id_fkey"
            columns: ["betslip_id"]
            isOneToOne: false
            referencedRelation: "betslips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "betslip_items_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "betslip_items_odds_id_fkey"
            columns: ["odds_id"]
            isOneToOne: false
            referencedRelation: "odds"
            referencedColumns: ["id"]
          },
        ]
      }
      betslips: {
        Row: {
          created_at: string | null
          id: string
          potential_win: number
          settled_at: string | null
          slip_type: string | null
          status: string | null
          total_odds: number
          total_stake: number
          updated_at: string | null
          user_id: string
          win_amount: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          potential_win: number
          settled_at?: string | null
          slip_type?: string | null
          status?: string | null
          total_odds: number
          total_stake: number
          updated_at?: string | null
          user_id: string
          win_amount?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          potential_win?: number
          settled_at?: string | null
          slip_type?: string | null
          status?: string | null
          total_odds?: number
          total_stake?: number
          updated_at?: string | null
          user_id?: string
          win_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "betslips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_campaigns: {
        Row: {
          amount_type: string
          amount_value: number
          applicable_games: string | null
          auto_apply: boolean | null
          bonus_amount_fixed: number | null
          bonus_percentage: number | null
          bonus_type: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_amount: number | null
          max_bonus: number | null
          max_uses_per_user: number | null
          min_deposit: number | null
          name: string
          promotion_code: string | null
          slug: string
          start_date: string | null
          terms_conditions: string | null
          total_max_uses: number | null
          trigger_type: string
          updated_at: string | null
          usage_limit_per_user: number | null
          valid_days: number | null
          wagering_requirement: number | null
        }
        Insert: {
          amount_type: string
          amount_value: number
          applicable_games?: string | null
          auto_apply?: boolean | null
          bonus_amount_fixed?: number | null
          bonus_percentage?: number | null
          bonus_type: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_amount?: number | null
          max_bonus?: number | null
          max_uses_per_user?: number | null
          min_deposit?: number | null
          name: string
          promotion_code?: string | null
          slug: string
          start_date?: string | null
          terms_conditions?: string | null
          total_max_uses?: number | null
          trigger_type: string
          updated_at?: string | null
          usage_limit_per_user?: number | null
          valid_days?: number | null
          wagering_requirement?: number | null
        }
        Update: {
          amount_type?: string
          amount_value?: number
          applicable_games?: string | null
          auto_apply?: boolean | null
          bonus_amount_fixed?: number | null
          bonus_percentage?: number | null
          bonus_type?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_amount?: number | null
          max_bonus?: number | null
          max_uses_per_user?: number | null
          min_deposit?: number | null
          name?: string
          promotion_code?: string | null
          slug?: string
          start_date?: string | null
          terms_conditions?: string | null
          total_max_uses?: number | null
          trigger_type?: string
          updated_at?: string | null
          usage_limit_per_user?: number | null
          valid_days?: number | null
          wagering_requirement?: number | null
        }
        Relationships: []
      }
      campaign_deliveries: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          created_at: string
          delivered_at: string | null
          delivery_status: string | null
          failure_reason: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string | null
          failure_reason?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string | null
          failure_reason?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_deliveries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      captcha_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          user_email: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          user_email: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          user_email?: string
        }
        Relationships: []
      }
      casino_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      casino_games: {
        Row: {
          background_url: string | null
          category_id: string
          created_at: string | null
          description: string | null
          external_game_id: string | null
          game_url: string | null
          has_demo: boolean | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          is_popular: boolean | null
          jackpot_amount: number | null
          max_bet: number | null
          min_bet: number | null
          name: string
          play_count: number | null
          provider_id: string | null
          rtp_percentage: number | null
          slug: string
          sort_order: number | null
          thumbnail_url: string | null
          updated_at: string | null
          volatility: string | null
        }
        Insert: {
          background_url?: string | null
          category_id: string
          created_at?: string | null
          description?: string | null
          external_game_id?: string | null
          game_url?: string | null
          has_demo?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          jackpot_amount?: number | null
          max_bet?: number | null
          min_bet?: number | null
          name: string
          play_count?: number | null
          provider_id?: string | null
          rtp_percentage?: number | null
          slug: string
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          volatility?: string | null
        }
        Update: {
          background_url?: string | null
          category_id?: string
          created_at?: string | null
          description?: string | null
          external_game_id?: string | null
          game_url?: string | null
          has_demo?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          jackpot_amount?: number | null
          max_bet?: number | null
          min_bet?: number | null
          name?: string
          play_count?: number | null
          provider_id?: string | null
          rtp_percentage?: number | null
          slug?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          volatility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casino_games_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "casino_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casino_games_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "game_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_analyses: {
        Row: {
          analysis_type: string
          competitors: string[] | null
          created_at: string
          id: string
          query: string
          related_questions: string[] | null
          result: string
          updated_at: string
        }
        Insert: {
          analysis_type: string
          competitors?: string[] | null
          created_at?: string
          id?: string
          query: string
          related_questions?: string[] | null
          result: string
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          competitors?: string[] | null
          created_at?: string
          id?: string
          query?: string
          related_questions?: string[] | null
          result?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_campaigns: {
        Row: {
          campaign_type: string
          content: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          scheduled_at: string | null
          target_segments: string[] | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          campaign_type: string
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          scheduled_at?: string | null
          target_segments?: string[] | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          scheduled_at?: string | null
          target_segments?: string[] | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          avg_session_duration: number | null
          created_at: string
          dau: number | null
          game_sessions: number | null
          ggr: number | null
          id: string
          metric_date: string
          new_registrations: number | null
          ngr: number | null
          total_bets: number | null
          total_deposits: number | null
          total_wins: number | null
          total_withdrawals: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          created_at?: string
          dau?: number | null
          game_sessions?: number | null
          ggr?: number | null
          id?: string
          metric_date: string
          new_registrations?: number | null
          ngr?: number | null
          total_bets?: number | null
          total_deposits?: number | null
          total_wins?: number | null
          total_withdrawals?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          created_at?: string
          dau?: number | null
          game_sessions?: number | null
          ggr?: number | null
          id?: string
          metric_date?: string
          new_registrations?: number | null
          ngr?: number | null
          total_bets?: number | null
          total_deposits?: number | null
          total_wins?: number | null
          total_withdrawals?: number | null
        }
        Relationships: []
      }
      device_fingerprints: {
        Row: {
          browser_info: Json | null
          created_at: string | null
          fingerprint_hash: string
          first_seen_at: string | null
          id: string
          is_trusted: boolean | null
          language: string | null
          last_seen_at: string | null
          risk_score: number | null
          screen_resolution: string | null
          timezone: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string | null
          fingerprint_hash: string
          first_seen_at?: string | null
          id?: string
          is_trusted?: boolean | null
          language?: string | null
          last_seen_at?: string | null
          risk_score?: number | null
          screen_resolution?: string | null
          timezone?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          browser_info?: Json | null
          created_at?: string | null
          fingerprint_hash?: string
          first_seen_at?: string | null
          id?: string
          is_trusted?: boolean | null
          language?: string | null
          last_seen_at?: string | null
          risk_score?: number | null
          screen_resolution?: string | null
          timezone?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          assigned_to: string | null
          created_at: string | null
          description: string
          evidence: Json | null
          id: string
          resolution_note: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          assigned_to?: string | null
          created_at?: string | null
          description: string
          evidence?: Json | null
          id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          evidence?: Json | null
          id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fraud_rules: {
        Row: {
          action: string
          auto_action: string | null
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          risk_score_impact: number | null
          rule_category: string | null
          rule_type: string
          threshold_count: number | null
          time_window_hours: number | null
          updated_at: string | null
        }
        Insert: {
          action: string
          auto_action?: string | null
          conditions: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          risk_score_impact?: number | null
          rule_category?: string | null
          rule_type: string
          threshold_count?: number | null
          time_window_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          auto_action?: string | null
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          risk_score_impact?: number | null
          rule_category?: string | null
          rule_type?: string
          threshold_count?: number | null
          time_window_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      game_provider_configs: {
        Row: {
          created_at: string
          demo_mode: boolean
          id: string
          max_bet_amount: number | null
          min_bet_amount: number | null
          provider_id: string
          return_url: string | null
          session_timeout: number | null
          supported_currencies: string[]
          supported_languages: string[]
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          demo_mode?: boolean
          id?: string
          max_bet_amount?: number | null
          min_bet_amount?: number | null
          provider_id: string
          return_url?: string | null
          session_timeout?: number | null
          supported_currencies?: string[]
          supported_languages?: string[]
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          demo_mode?: boolean
          id?: string
          max_bet_amount?: number | null
          min_bet_amount?: number | null
          provider_id?: string
          return_url?: string | null
          session_timeout?: number | null
          supported_currencies?: string[]
          supported_languages?: string[]
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_provider_configs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "game_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      game_providers: {
        Row: {
          api_endpoint: string | null
          api_key: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          provider_type: string | null
          slug: string
          sort_order: number | null
          status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          provider_type?: string | null
          slug: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          provider_type?: string | null
          slug?: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      game_rounds: {
        Row: {
          balance_after: number
          balance_before: number
          bet_amount: number
          created_at: string | null
          external_round_id: string | null
          game_id: string
          game_result: Json | null
          id: string
          played_at: string | null
          round_number: number
          session_id: string
          status: string | null
          updated_at: string | null
          user_id: string
          win_amount: number | null
        }
        Insert: {
          balance_after: number
          balance_before: number
          bet_amount: number
          created_at?: string | null
          external_round_id?: string | null
          game_id: string
          game_result?: Json | null
          id?: string
          played_at?: string | null
          round_number: number
          session_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          win_amount?: number | null
        }
        Update: {
          balance_after?: number
          balance_before?: number
          bet_amount?: number
          created_at?: string | null
          external_round_id?: string | null
          game_id?: string
          game_result?: Json | null
          id?: string
          played_at?: string | null
          round_number?: number
          session_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          win_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_rounds_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_rounds_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          balance_end: number | null
          balance_start: number
          created_at: string | null
          ended_at: string | null
          game_id: string
          id: string
          ip_address: unknown | null
          rounds_played: number | null
          session_token: string
          started_at: string | null
          status: string | null
          total_bet: number | null
          total_win: number | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          balance_end?: number | null
          balance_start: number
          created_at?: string | null
          ended_at?: string | null
          game_id: string
          id?: string
          ip_address?: unknown | null
          rounds_played?: number | null
          session_token: string
          started_at?: string | null
          status?: string | null
          total_bet?: number | null
          total_win?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          balance_end?: number | null
          balance_start?: number
          created_at?: string | null
          ended_at?: string | null
          game_id?: string
          id?: string
          ip_address?: unknown | null
          rounds_played?: number | null
          session_token?: string
          started_at?: string | null
          status?: string | null
          total_bet?: number | null
          total_win?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          external_game_id: string | null
          game_type: string
          has_demo: boolean | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_live: boolean | null
          max_bet: number | null
          min_bet: number | null
          name: string
          provider_id: string
          rtp_percentage: number | null
          slug: string
          sort_order: number | null
          thumbnail_url: string | null
          updated_at: string | null
          volatility: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_game_id?: string | null
          game_type: string
          has_demo?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_live?: boolean | null
          max_bet?: number | null
          min_bet?: number | null
          name: string
          provider_id: string
          rtp_percentage?: number | null
          slug: string
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          volatility?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_game_id?: string | null
          game_type?: string
          has_demo?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_live?: boolean | null
          max_bet?: number | null
          min_bet?: number | null
          name?: string
          provider_id?: string
          rtp_percentage?: number | null
          slug?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          volatility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "game_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_analysis: {
        Row: {
          city: string | null
          country_code: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          is_datacenter: boolean | null
          is_proxy: boolean | null
          is_tor: boolean | null
          is_vpn: boolean | null
          last_checked_at: string | null
          provider_data: Json | null
          region: string | null
          risk_score: number | null
          threat_level: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          ip_address: unknown
          is_datacenter?: boolean | null
          is_proxy?: boolean | null
          is_tor?: boolean | null
          is_vpn?: boolean | null
          last_checked_at?: string | null
          provider_data?: Json | null
          region?: string | null
          risk_score?: number | null
          threat_level?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_datacenter?: boolean | null
          is_proxy?: boolean | null
          is_tor?: boolean | null
          is_vpn?: boolean | null
          last_checked_at?: string | null
          provider_data?: Json | null
          region?: string | null
          risk_score?: number | null
          threat_level?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string
          document_number: string | null
          document_type: Database["public"]["Enums"]["kyc_document_type"]
          document_url: string
          expiry_date: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["kyc_status_type"]
          updated_at: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_number?: string | null
          document_type: Database["public"]["Enums"]["kyc_document_type"]
          document_url: string
          expiry_date?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status_type"]
          updated_at?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["kyc_document_type"]
          document_url?: string
          expiry_date?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status_type"]
          updated_at?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kyc_limits: {
        Row: {
          created_at: string
          daily_deposit_limit: number
          daily_withdrawal_limit: number
          id: string
          kyc_level: Database["public"]["Enums"]["kyc_level"]
          monthly_deposit_limit: number
          monthly_withdrawal_limit: number
          requires_documents: Database["public"]["Enums"]["kyc_document_type"][]
          total_balance_limit: number
          updated_at: string
          yearly_withdrawal_limit: number
        }
        Insert: {
          created_at?: string
          daily_deposit_limit?: number
          daily_withdrawal_limit?: number
          id?: string
          kyc_level: Database["public"]["Enums"]["kyc_level"]
          monthly_deposit_limit?: number
          monthly_withdrawal_limit?: number
          requires_documents?: Database["public"]["Enums"]["kyc_document_type"][]
          total_balance_limit?: number
          updated_at?: string
          yearly_withdrawal_limit?: number
        }
        Update: {
          created_at?: string
          daily_deposit_limit?: number
          daily_withdrawal_limit?: number
          id?: string
          kyc_level?: Database["public"]["Enums"]["kyc_level"]
          monthly_deposit_limit?: number
          monthly_withdrawal_limit?: number
          requires_documents?: Database["public"]["Enums"]["kyc_document_type"][]
          total_balance_limit?: number
          updated_at?: string
          yearly_withdrawal_limit?: number
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          created_at: string
          current_level: Database["public"]["Enums"]["kyc_level"]
          id: string
          rejection_reason: string | null
          requested_level: Database["public"]["Enums"]["kyc_level"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["kyc_status_type"]
          submitted_at: string
          submitted_documents: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          created_at?: string
          current_level?: Database["public"]["Enums"]["kyc_level"]
          id?: string
          rejection_reason?: string | null
          requested_level: Database["public"]["Enums"]["kyc_level"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status_type"]
          submitted_at?: string
          submitted_documents?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          created_at?: string
          current_level?: Database["public"]["Enums"]["kyc_level"]
          id?: string
          rejection_reason?: string | null
          requested_level?: Database["public"]["Enums"]["kyc_level"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status_type"]
          submitted_at?: string
          submitted_documents?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leagues: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          sort_order: number | null
          sport_id: string
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
          sport_id: string
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
          sport_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leagues_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      live_matches: {
        Row: {
          away_score: number | null
          away_team: string
          away_team_logo: string | null
          created_at: string | null
          home_score: number | null
          home_team: string
          home_team_logo: string | null
          id: string
          is_featured: boolean | null
          league: string | null
          match_date: string | null
          match_minute: number | null
          match_time: string | null
          period: string | null
          sport_type: string
          status: string | null
          updated_at: string | null
          viewers_count: number | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          away_team_logo?: string | null
          created_at?: string | null
          home_score?: number | null
          home_team: string
          home_team_logo?: string | null
          id?: string
          is_featured?: boolean | null
          league?: string | null
          match_date?: string | null
          match_minute?: number | null
          match_time?: string | null
          period?: string | null
          sport_type?: string
          status?: string | null
          updated_at?: string | null
          viewers_count?: number | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          away_team_logo?: string | null
          created_at?: string | null
          home_score?: number | null
          home_team?: string
          home_team_logo?: string | null
          id?: string
          is_featured?: boolean | null
          league?: string | null
          match_date?: string | null
          match_minute?: number | null
          match_time?: string | null
          period?: string | null
          sport_type?: string
          status?: string | null
          updated_at?: string | null
          viewers_count?: number | null
        }
        Relationships: []
      }
      live_odds: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          market_name: string
          market_type: string
          match_id: string
          odds_value: number
          selection: string
          selection_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          market_name: string
          market_type: string
          match_id: string
          odds_value: number
          selection: string
          selection_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          market_name?: string
          market_type?: string
          match_id?: string
          odds_value?: number
          selection?: string
          selection_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_odds_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "live_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          email: string
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          os: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_score: number | null
          away_team: string
          away_team_logo: string | null
          created_at: string | null
          external_match_id: string | null
          home_score: number | null
          home_team: string
          home_team_logo: string | null
          id: string
          is_featured: boolean | null
          league_id: string
          match_date: string
          provider: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          away_team_logo?: string | null
          created_at?: string | null
          external_match_id?: string | null
          home_score?: number | null
          home_team: string
          home_team_logo?: string | null
          id?: string
          is_featured?: boolean | null
          league_id: string
          match_date: string
          provider?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          away_team_logo?: string | null
          created_at?: string | null
          external_match_id?: string | null
          home_score?: number | null
          home_team?: string
          home_team_logo?: string | null
          id?: string
          is_featured?: boolean | null
          league_id?: string
          match_date?: string
          provider?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          admin_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_read: boolean | null
          message: string
          target_user_id: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message: string
          target_user_id?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message?: string
          target_user_id?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      odds: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          market_name: string
          market_type: string
          match_id: string
          odds_value: number
          selection: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          market_name: string
          market_type: string
          match_id: string
          odds_value: number
          selection: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          market_name?: string
          market_type?: string
          match_id?: string
          odds_value?: number
          selection?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "odds_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_info: Json
          created_at: string
          id: string
          is_active: boolean
          is_verified: boolean
          method_type: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_info: Json
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          method_type: string
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_info?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          method_type?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_providers: {
        Row: {
          api_endpoint: string | null
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_sandbox: boolean | null
          max_amount: number | null
          min_amount: number | null
          name: string
          processing_fee_fixed: number | null
          processing_fee_percentage: number | null
          provider_type: string
          slug: string
          supported_currencies: string[] | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_sandbox?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          name: string
          processing_fee_fixed?: number | null
          processing_fee_percentage?: number | null
          provider_type: string
          slug: string
          supported_currencies?: string[] | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_sandbox?: boolean | null
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          processing_fee_fixed?: number | null
          processing_fee_percentage?: number | null
          provider_type?: string
          slug?: string
          supported_currencies?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_webhooks: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          payload: Json
          payment_id: string | null
          processed: boolean | null
          processed_at: string | null
          provider_slug: string
          retry_count: number | null
          signature: string | null
          webhook_type: string
          withdrawal_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload: Json
          payment_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          provider_slug: string
          retry_count?: number | null
          signature?: string | null
          webhook_type: string
          withdrawal_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json
          payment_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          provider_slug?: string
          retry_count?: number | null
          signature?: string | null
          webhook_type?: string
          withdrawal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhooks_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          fraud_check_status: string | null
          id: string
          idempotency_key: string | null
          payment_data: Json | null
          payment_method: string
          processed_at: string | null
          provider_id: string | null
          provider_reference: string | null
          provider_status: string | null
          risk_flags: string[] | null
          risk_score: number | null
          status: string | null
          three_ds_status: string | null
          three_ds_url: string | null
          updated_at: string | null
          user_id: string
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          fraud_check_status?: string | null
          id?: string
          idempotency_key?: string | null
          payment_data?: Json | null
          payment_method: string
          processed_at?: string | null
          provider_id?: string | null
          provider_reference?: string | null
          provider_status?: string | null
          risk_flags?: string[] | null
          risk_score?: number | null
          status?: string | null
          three_ds_status?: string | null
          three_ds_url?: string | null
          updated_at?: string | null
          user_id: string
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          fraud_check_status?: string | null
          id?: string
          idempotency_key?: string | null
          payment_data?: Json | null
          payment_method?: string
          processed_at?: string | null
          provider_id?: string | null
          provider_reference?: string | null
          provider_status?: string | null
          risk_flags?: string[] | null
          risk_score?: number | null
          status?: string | null
          three_ds_status?: string | null
          three_ds_url?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          phone_verified: boolean | null
          postal_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          bonus_amount: number | null
          bonus_percentage: number | null
          category: string
          created_at: string | null
          current_participants: number | null
          description: string | null
          detailed_description: string | null
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          max_bonus: number | null
          max_participants: number | null
          min_deposit: number | null
          promo_code: string | null
          start_date: string
          terms_conditions: string | null
          title: string
          updated_at: string | null
          wagering_requirement: number | null
        }
        Insert: {
          bonus_amount?: number | null
          bonus_percentage?: number | null
          category: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          detailed_description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_bonus?: number | null
          max_participants?: number | null
          min_deposit?: number | null
          promo_code?: string | null
          start_date: string
          terms_conditions?: string | null
          title: string
          updated_at?: string | null
          wagering_requirement?: number | null
        }
        Update: {
          bonus_amount?: number | null
          bonus_percentage?: number | null
          category?: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          detailed_description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_bonus?: number | null
          max_participants?: number | null
          min_deposit?: number | null
          promo_code?: string | null
          start_date?: string
          terms_conditions?: string | null
          title?: string
          updated_at?: string | null
          wagering_requirement?: number | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission: Database["public"]["Enums"]["admin_permission"]
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission: Database["public"]["Enums"]["admin_permission"]
          role: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["admin_permission"]
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          keywords: string | null
          language_code: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_slug: string
          robots: string | null
          schema_markup: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string | null
          language_code?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_slug: string
          robots?: string | null
          schema_markup?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string | null
          language_code?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_slug?: string
          robots?: string | null
          schema_markup?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      slot_game_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          session_end: string | null
          session_start: string
          slot_game_id: string
          total_bet: number
          total_spins: number
          total_win: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          session_end?: string | null
          session_start?: string
          slot_game_id: string
          total_bet?: number
          total_spins?: number
          total_win?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          session_end?: string | null
          session_start?: string
          slot_game_id?: string
          total_bet?: number
          total_spins?: number
          total_win?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_game_sessions_slot_game_id_fkey"
            columns: ["slot_game_id"]
            isOneToOne: false
            referencedRelation: "slot_games"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_game_spins: {
        Row: {
          balance_after: number
          balance_before: number
          bet_amount: number
          created_at: string
          id: string
          multiplier: number | null
          result: Json
          session_id: string
          slot_game_id: string
          spin_timestamp: string
          user_id: string
          win_amount: number
          winning_lines: Json | null
        }
        Insert: {
          balance_after: number
          balance_before: number
          bet_amount: number
          created_at?: string
          id?: string
          multiplier?: number | null
          result: Json
          session_id: string
          slot_game_id: string
          spin_timestamp?: string
          user_id: string
          win_amount?: number
          winning_lines?: Json | null
        }
        Update: {
          balance_after?: number
          balance_before?: number
          bet_amount?: number
          created_at?: string
          id?: string
          multiplier?: number | null
          result?: Json
          session_id?: string
          slot_game_id?: string
          spin_timestamp?: string
          user_id?: string
          win_amount?: number
          winning_lines?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "slot_game_spins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "slot_game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_game_spins_slot_game_id_fkey"
            columns: ["slot_game_id"]
            isOneToOne: false
            referencedRelation: "slot_games"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_games: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          max_bet: number
          min_bet: number
          name: string
          paylines: number
          paytable: Json
          provider: string
          reels: number
          rows: number
          rtp: number
          slug: string
          symbols: Json
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_bet?: number
          min_bet?: number
          name: string
          paylines?: number
          paytable: Json
          provider: string
          reels?: number
          rows?: number
          rtp?: number
          slug: string
          symbols: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          max_bet?: number
          min_bet?: number
          name?: string
          paylines?: number
          paytable?: Json
          provider?: string
          reels?: number
          rows?: number
          rtp?: number
          slug?: string
          symbols?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sports: {
        Row: {
          created_at: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_fees: {
        Row: {
          created_at: string
          currency: string
          fee_type: string
          fee_value: number
          fixed_fee: number | null
          id: string
          is_active: boolean | null
          max_fee: number | null
          min_fee: number | null
          provider_id: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          fee_type: string
          fee_value: number
          fixed_fee?: number | null
          id?: string
          is_active?: boolean | null
          max_fee?: number | null
          min_fee?: number | null
          provider_id?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          fee_type?: string
          fee_value?: number
          fixed_fee?: number | null
          id?: string
          is_active?: boolean | null
          max_fee?: number | null
          min_fee?: number | null
          provider_id?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_fees_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          external_transaction_id: string | null
          id: string
          payment_method: string | null
          payment_provider: string | null
          processed_at: string | null
          reference_id: string | null
          reference_type: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_transaction_id?: string | null
          id?: string
          payment_method?: string | null
          payment_provider?: string | null
          processed_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_transaction_id?: string | null
          id?: string
          payment_method?: string | null
          payment_provider?: string | null
          processed_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          id: string
          key: string
          language_code: string
          namespace: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          language_code: string
          namespace?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          language_code?: string
          namespace?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_behavior_logs: {
        Row: {
          action_type: string
          amount: number | null
          created_at: string | null
          currency: string | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          risk_flags: string[] | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          risk_flags?: string[] | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          risk_flags?: string[] | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_bonuses: {
        Row: {
          awarded_at: string | null
          bonus_amount: number
          campaign_id: string
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          used_amount: number | null
          user_id: string
          wagering_completed: number | null
          wagering_requirement: number | null
        }
        Insert: {
          awarded_at?: string | null
          bonus_amount: number
          campaign_id: string
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          used_amount?: number | null
          user_id: string
          wagering_completed?: number | null
          wagering_requirement?: number | null
        }
        Update: {
          awarded_at?: string | null
          bonus_amount?: number
          campaign_id?: string
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          used_amount?: number | null
          user_id?: string
          wagering_completed?: number | null
          wagering_requirement?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bonuses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "bonus_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bonuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_device_fingerprints: {
        Row: {
          country_code: string | null
          fingerprint_hash: string
          first_seen_at: string | null
          id: string
          ip_address: unknown | null
          is_trusted: boolean | null
          language: string | null
          last_seen_at: string | null
          screen_resolution: string | null
          timezone: string | null
          usage_count: number | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          country_code?: string | null
          fingerprint_hash: string
          first_seen_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_trusted?: boolean | null
          language?: string | null
          last_seen_at?: string | null
          screen_resolution?: string | null
          timezone?: string | null
          usage_count?: number | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          country_code?: string | null
          fingerprint_hash?: string
          first_seen_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_trusted?: boolean | null
          language?: string | null
          last_seen_at?: string | null
          screen_resolution?: string | null
          timezone?: string | null
          usage_count?: number | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_device_fingerprints_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "casino_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ltv: {
        Row: {
          days_since_last_activity: number | null
          first_deposit_at: string | null
          ggr: number | null
          id: string
          is_dormant: boolean | null
          last_activity_at: string | null
          net_deposits: number | null
          total_bets: number | null
          total_deposits: number | null
          total_wins: number | null
          total_withdrawals: number | null
          updated_at: string
          user_id: string | null
          vip_level: string | null
        }
        Insert: {
          days_since_last_activity?: number | null
          first_deposit_at?: string | null
          ggr?: number | null
          id?: string
          is_dormant?: boolean | null
          last_activity_at?: string | null
          net_deposits?: number | null
          total_bets?: number | null
          total_deposits?: number | null
          total_wins?: number | null
          total_withdrawals?: number | null
          updated_at?: string
          user_id?: string | null
          vip_level?: string | null
        }
        Update: {
          days_since_last_activity?: number | null
          first_deposit_at?: string | null
          ggr?: number | null
          id?: string
          is_dormant?: boolean | null
          last_activity_at?: string | null
          net_deposits?: number | null
          total_bets?: number | null
          total_deposits?: number | null
          total_wins?: number | null
          total_withdrawals?: number | null
          updated_at?: string
          user_id?: string | null
          vip_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_ltv_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_promotions: {
        Row: {
          activated_at: string | null
          bonus_amount: number | null
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          participated_at: string | null
          promotion_id: string
          status: string
          updated_at: string | null
          user_id: string
          wagering_completed: number | null
        }
        Insert: {
          activated_at?: string | null
          bonus_amount?: number | null
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          participated_at?: string | null
          promotion_id: string
          status?: string
          updated_at?: string | null
          user_id: string
          wagering_completed?: number | null
        }
        Update: {
          activated_at?: string | null
          bonus_amount?: number | null
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          participated_at?: string | null
          promotion_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          wagering_completed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_promotions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_risk_profiles: {
        Row: {
          assessment_history: Json | null
          automated_actions: Json | null
          behavioral_risk_score: number | null
          created_at: string | null
          device_risk_score: number | null
          geo_risk_score: number | null
          id: string
          kyc_risk_score: number | null
          last_assessment_at: string | null
          manual_overrides: Json | null
          overall_risk_score: number | null
          payment_risk_score: number | null
          risk_level: string | null
          updated_at: string | null
          user_id: string
          velocity_risk_score: number | null
        }
        Insert: {
          assessment_history?: Json | null
          automated_actions?: Json | null
          behavioral_risk_score?: number | null
          created_at?: string | null
          device_risk_score?: number | null
          geo_risk_score?: number | null
          id?: string
          kyc_risk_score?: number | null
          last_assessment_at?: string | null
          manual_overrides?: Json | null
          overall_risk_score?: number | null
          payment_risk_score?: number | null
          risk_level?: string | null
          updated_at?: string | null
          user_id: string
          velocity_risk_score?: number | null
        }
        Update: {
          assessment_history?: Json | null
          automated_actions?: Json | null
          behavioral_risk_score?: number | null
          created_at?: string | null
          device_risk_score?: number | null
          geo_risk_score?: number | null
          id?: string
          kyc_risk_score?: number | null
          last_assessment_at?: string | null
          manual_overrides?: Json | null
          overall_risk_score?: number | null
          payment_risk_score?: number | null
          risk_level?: string | null
          updated_at?: string | null
          user_id?: string
          velocity_risk_score?: number | null
        }
        Relationships: []
      }
      user_segment_memberships: {
        Row: {
          id: string
          joined_at: string | null
          segment_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          segment_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          segment_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_segment_memberships_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "user_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_segment_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_segments: {
        Row: {
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          conditions: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          login_at: string | null
          logout_at: string | null
          session_token: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          login_at?: string | null
          logout_at?: string | null
          session_token: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          login_at?: string | null
          logout_at?: string | null
          session_token?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          balance: number | null
          bonus_balance: number | null
          country: string | null
          created_at: string | null
          currency: string | null
          date_of_birth: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          kyc_level: Database["public"]["Enums"]["kyc_level"]
          kyc_rejection_reason: string | null
          kyc_status: string | null
          kyc_verified_at: string | null
          last_name: string | null
          phone: string | null
          phone_verified: boolean | null
          status: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          auth_user_id: string
          balance?: number | null
          bonus_balance?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          kyc_level?: Database["public"]["Enums"]["kyc_level"]
          kyc_rejection_reason?: string | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          auth_user_id?: string
          balance?: number | null
          bonus_balance?: number | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          kyc_level?: Database["public"]["Enums"]["kyc_level"]
          kyc_rejection_reason?: string | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      withdrawal_limits: {
        Row: {
          created_at: string
          daily_limit: number
          id: string
          max_withdrawal: number
          min_withdrawal: number
          monthly_limit: number
          updated_at: string
          user_id: string
          weekly_limit: number
        }
        Insert: {
          created_at?: string
          daily_limit?: number
          id?: string
          max_withdrawal?: number
          min_withdrawal?: number
          monthly_limit?: number
          updated_at?: string
          user_id: string
          weekly_limit?: number
        }
        Update: {
          created_at?: string
          daily_limit?: number
          id?: string
          max_withdrawal?: number
          min_withdrawal?: number
          monthly_limit?: number
          updated_at?: string
          user_id?: string
          weekly_limit?: number
        }
        Relationships: []
      }
      withdrawal_rules: {
        Row: {
          action: string
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          priority: number
          rule_type: string
          updated_at: string
        }
        Insert: {
          action: string
          conditions: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          rule_type: string
          updated_at?: string
        }
        Update: {
          action?: string
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          approved_at: string | null
          completed_at: string | null
          created_at: string
          currency: string
          fee_amount: number
          id: string
          ip_address: unknown | null
          metadata: Json | null
          net_amount: number
          payment_method_id: string | null
          processed_at: string | null
          provider_reference: string | null
          provider_response: Json | null
          rejection_reason: string | null
          requested_at: string
          requires_kyc: boolean
          requires_manual_review: boolean
          reviewed_at: string | null
          reviewer_id: string | null
          risk_flags: string[] | null
          risk_score: number
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          fee_amount?: number
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          net_amount: number
          payment_method_id?: string | null
          processed_at?: string | null
          provider_reference?: string | null
          provider_response?: Json | null
          rejection_reason?: string | null
          requested_at?: string
          requires_kyc?: boolean
          requires_manual_review?: boolean
          reviewed_at?: string | null
          reviewer_id?: string | null
          risk_flags?: string[] | null
          risk_score?: number
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          fee_amount?: number
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          net_amount?: number
          payment_method_id?: string | null
          processed_at?: string | null
          provider_reference?: string | null
          provider_response?: Json | null
          rejection_reason?: string | null
          requested_at?: string
          requires_kyc?: boolean
          requires_manual_review?: boolean
          reviewed_at?: string | null
          reviewer_id?: string | null
          risk_flags?: string[] | null
          risk_score?: number
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_daily_metrics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      calculate_payment_risk_score: {
        Args: {
          _amount: number
          _currency: string
          _device_fingerprint?: string
          _ip_address?: unknown
          _user_id: string
        }
        Returns: number
      }
      check_admin_permission: {
        Args: {
          _admin_id: string
          _permission: Database["public"]["Enums"]["admin_permission"]
        }
        Returns: boolean
      }
      check_kyc_withdrawal_limit: {
        Args: { _amount: number; _user_id: string }
        Returns: Json
      }
      cleanup_expired_captcha_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_permissions: {
        Args: { _admin_id: string }
        Returns: Database["public"]["Enums"]["admin_permission"][]
      }
      get_current_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_dashboard_kpis: {
        Args: { days_back?: number }
        Returns: {
          active_sessions: number
          active_users_30d: number
          avg_deposit_amount: number
          ggr_30d: number
          new_users_today: number
          ngr_30d: number
          total_deposits_30d: number
          total_users: number
          total_withdrawals_30d: number
        }[]
      }
      get_required_kyc_documents: {
        Args:
          | { _target_level: Database["public"]["Enums"]["kyc_level"] }
          | { _target_level: string }
        Returns: Database["public"]["Enums"]["kyc_document_type"][]
      }
      get_withdrawal_stats: {
        Args: { date_filter: string }
        Returns: {
          high_risk_count: number
          total_approved_amount_today: number
          total_approved_today: number
          total_pending: number
          total_pending_amount: number
        }[]
      }
      has_admin_permission: {
        Args: { _admin_id: string; _permission: string }
        Returns: boolean
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: { _admin_id: string }
        Returns: boolean
      }
      update_user_ltv: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      admin_permission:
        | "user_management"
        | "user_ban"
        | "user_kyc"
        | "finance_approval"
        | "deposit_approval"
        | "withdrawal_approval"
        | "bonus_create"
        | "bonus_manage"
        | "bonus_delete"
        | "game_management"
        | "game_publish"
        | "game_unpublish"
        | "category_management"
        | "report_access"
        | "financial_reports"
        | "user_reports"
        | "game_reports"
        | "admin_management"
        | "system_settings"
        | "audit_logs"
      admin_role: "super_admin" | "finance" | "crm" | "support" | "moderator"
      kyc_document_type:
        | "identity_card"
        | "passport"
        | "driving_license"
        | "utility_bill"
        | "bank_statement"
        | "address_proof"
        | "selfie_with_id"
      kyc_level: "level_0" | "level_1" | "level_2" | "level_3"
      kyc_status_type:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "incomplete"
      withdrawal_status:
        | "pending"
        | "approved"
        | "processing"
        | "completed"
        | "rejected"
        | "cancelled"
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
      admin_permission: [
        "user_management",
        "user_ban",
        "user_kyc",
        "finance_approval",
        "deposit_approval",
        "withdrawal_approval",
        "bonus_create",
        "bonus_manage",
        "bonus_delete",
        "game_management",
        "game_publish",
        "game_unpublish",
        "category_management",
        "report_access",
        "financial_reports",
        "user_reports",
        "game_reports",
        "admin_management",
        "system_settings",
        "audit_logs",
      ],
      admin_role: ["super_admin", "finance", "crm", "support", "moderator"],
      kyc_document_type: [
        "identity_card",
        "passport",
        "driving_license",
        "utility_bill",
        "bank_statement",
        "address_proof",
        "selfie_with_id",
      ],
      kyc_level: ["level_0", "level_1", "level_2", "level_3"],
      kyc_status_type: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "incomplete",
      ],
      withdrawal_status: [
        "pending",
        "approved",
        "processing",
        "completed",
        "rejected",
        "cancelled",
      ],
    },
  },
} as const
