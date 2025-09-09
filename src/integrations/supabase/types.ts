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
          role_type: Database["public"]["Enums"]["admin_role_new"] | null
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
          role_type?: Database["public"]["Enums"]["admin_role_new"] | null
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
          role_type?: Database["public"]["Enums"]["admin_role_new"] | null
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
      fraud_rules: {
        Row: {
          action: string
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          risk_score_impact: number | null
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          action: string
          conditions: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          risk_score_impact?: number | null
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          risk_score_impact?: number | null
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      game_providers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
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
          {
            foreignKeyName: "payment_webhooks_withdrawal_id_fkey"
            columns: ["withdrawal_id"]
            isOneToOne: false
            referencedRelation: "withdrawals"
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
          role: Database["public"]["Enums"]["admin_role_new"]
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission: Database["public"]["Enums"]["admin_permission"]
          role: Database["public"]["Enums"]["admin_role_new"]
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["admin_permission"]
          role?: Database["public"]["Enums"]["admin_role_new"]
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
          kyc_status: string | null
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
          kyc_status?: string | null
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
          kyc_status?: string | null
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          approved_at: string | null
          auto_approved: boolean | null
          bank_details: Json | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          kyc_required: boolean | null
          kyc_status: string | null
          net_amount: number | null
          processed_at: string | null
          processing_fee: number | null
          provider_reference: string | null
          rejected_at: string | null
          review_note: string | null
          reviewer_id: string | null
          risk_flags: string[] | null
          risk_score: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          withdrawal_method: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          auto_approved?: boolean | null
          bank_details?: Json | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          kyc_required?: boolean | null
          kyc_status?: string | null
          net_amount?: number | null
          processed_at?: string | null
          processing_fee?: number | null
          provider_reference?: string | null
          rejected_at?: string | null
          review_note?: string | null
          reviewer_id?: string | null
          risk_flags?: string[] | null
          risk_score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          withdrawal_method: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          auto_approved?: boolean | null
          bank_details?: Json | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          kyc_required?: boolean | null
          kyc_status?: string | null
          net_amount?: number | null
          processed_at?: string | null
          processing_fee?: number | null
          provider_reference?: string | null
          rejected_at?: string | null
          review_note?: string | null
          reviewer_id?: string | null
          risk_flags?: string[] | null
          risk_score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          withdrawal_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_withdrawals_reviewer_id"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_withdrawals_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      cleanup_expired_captcha_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["admin_role"]
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
      admin_role: "super_admin" | "admin" | "finance_admin" | "support_admin"
      admin_role_new:
        | "super_admin"
        | "finance"
        | "crm"
        | "support"
        | "moderator"
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
      admin_role: ["super_admin", "admin", "finance_admin", "support_admin"],
      admin_role_new: ["super_admin", "finance", "crm", "support", "moderator"],
    },
  },
} as const
