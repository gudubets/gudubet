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
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
          role: string
          role_type: Database["public"]["Enums"]["admin_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
          role?: string
          role_type?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
          role?: string
          role_type?: Database["public"]["Enums"]["admin_role"] | null
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_captcha_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["admin_role"]
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
      admin_role: "super_admin" | "admin" | "finance_admin" | "support_admin"
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
      admin_role: ["super_admin", "admin", "finance_admin", "support_admin"],
    },
  },
} as const
