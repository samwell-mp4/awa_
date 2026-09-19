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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ambient_videos: {
        Row: {
          created_at: string
          id: string
          name: string
          name_en: string | null
          name_es: string | null
          order_index: number
          poster_url: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          name_en?: string | null
          name_es?: string | null
          order_index?: number
          poster_url?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_en?: string | null
          name_es?: string | null
          order_index?: number
          poster_url?: string | null
          video_url?: string
        }
        Relationships: []
      }
      daily_mission: {
        Row: {
          correct_index: number
          created_at: string
          id: string
          is_active: boolean
          options: Json
          options_en: Json | null
          options_es: Json | null
          points: number
          question: string
          question_en: string | null
          question_es: string | null
          updated_at: string
        }
        Insert: {
          correct_index?: number
          created_at?: string
          id?: string
          is_active?: boolean
          options?: Json
          options_en?: Json | null
          options_es?: Json | null
          points?: number
          question: string
          question_en?: string | null
          question_es?: string | null
          updated_at?: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          id?: string
          is_active?: boolean
          options?: Json
          options_en?: Json | null
          options_es?: Json | null
          points?: number
          question?: string
          question_en?: string | null
          question_es?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_video: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          description_es: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean
          thumbnail_url: string | null
          title: string
          title_en: string | null
          title_es: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title: string
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title?: string
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      dictionary: {
        Row: {
          audio_url: string | null
          category: string
          created_at: string
          example: string | null
          example_en: string | null
          example_es: string | null
          id: string
          language: string
          pronunciation: string | null
          term_indigenous: string
          term_pt: string
          term_pt_en: string | null
          term_pt_es: string | null
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          category?: string
          created_at?: string
          example?: string | null
          example_en?: string | null
          example_es?: string | null
          id?: string
          language?: string
          pronunciation?: string | null
          term_indigenous: string
          term_pt: string
          term_pt_en?: string | null
          term_pt_es?: string | null
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          category?: string
          created_at?: string
          example?: string | null
          example_en?: string | null
          example_es?: string | null
          id?: string
          language?: string
          pronunciation?: string | null
          term_indigenous?: string
          term_pt?: string
          term_pt_en?: string | null
          term_pt_es?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dictionary_entries: {
        Row: {
          audio_url: string | null
          category: string
          created_at: string
          direction: string
          example: string | null
          id: string
          image_url: string | null
          note: string | null
          source: string
          subcategory: string | null
          term_patxoha: string
          term_pt: string
          updated_at: string
          variant: string | null
          word_type: string | null
        }
        Insert: {
          audio_url?: string | null
          category?: string
          created_at?: string
          direction: string
          example?: string | null
          id?: string
          image_url?: string | null
          note?: string | null
          source?: string
          subcategory?: string | null
          term_patxoha: string
          term_pt: string
          updated_at?: string
          variant?: string | null
          word_type?: string | null
        }
        Update: {
          audio_url?: string | null
          category?: string
          created_at?: string
          direction?: string
          example?: string | null
          id?: string
          image_url?: string | null
          note?: string | null
          source?: string
          subcategory?: string | null
          term_patxoha?: string
          term_pt?: string
          updated_at?: string
          variant?: string | null
          word_type?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      learning_events: {
        Row: {
          action: string
          created_at: string
          id: string
          points: number
          trail: string | null
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          points?: number
          trail?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          points?: number
          trail?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_allowlist: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          note: string | null
          phone: string | null
          plan: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          note?: string | null
          phone?: string | null
          plan?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          note?: string | null
          phone?: string | null
          plan?: string
        }
        Relationships: []
      }
      media_library: {
        Row: {
          ai_description: string | null
          ai_layout_hint: string | null
          ai_palette: string[]
          ai_suggested_pages: string[]
          ai_tags: string[]
          created_at: string
          created_by: string | null
          filename: string | null
          height: number | null
          id: string
          mime_type: string | null
          storage_path: string | null
          url: string
          width: number | null
        }
        Insert: {
          ai_description?: string | null
          ai_layout_hint?: string | null
          ai_palette?: string[]
          ai_suggested_pages?: string[]
          ai_tags?: string[]
          created_at?: string
          created_by?: string | null
          filename?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          storage_path?: string | null
          url: string
          width?: number | null
        }
        Update: {
          ai_description?: string | null
          ai_layout_hint?: string | null
          ai_palette?: string[]
          ai_suggested_pages?: string[]
          ai_tags?: string[]
          created_at?: string
          created_by?: string | null
          filename?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          storage_path?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      paddle_customers: {
        Row: {
          created_at: string
          email: string
          environment: string
          id: string
          paddle_customer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          environment?: string
          id?: string
          paddle_customer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          environment?: string
          id?: string
          paddle_customer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          photo_url: string | null
          points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string
          photo_url?: string | null
          points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          points?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_config: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_config_drafts: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_config_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key: string
          note: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key: string
          note?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key?: string
          note?: string | null
          value?: Json
        }
        Relationships: []
      }
      songs: {
        Row: {
          aldeia: string | null
          ambient_video_id: string | null
          artist: string | null
          artist_en: string | null
          artist_es: string | null
          audio_url: string
          cover_url: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          description_en: string | null
          description_es: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean
          language: string
          lyrics_indigenous: string
          lyrics_pt: string
          lyrics_pt_en: string | null
          lyrics_pt_es: string | null
          order_index: number
          style: Json
          sync_offsets: number[] | null
          title: string
          title_en: string | null
          title_es: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          aldeia?: string | null
          ambient_video_id?: string | null
          artist?: string | null
          artist_en?: string | null
          artist_es?: string | null
          audio_url: string
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          language?: string
          lyrics_indigenous?: string
          lyrics_pt?: string
          lyrics_pt_en?: string | null
          lyrics_pt_es?: string | null
          order_index?: number
          style?: Json
          sync_offsets?: number[] | null
          title: string
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          aldeia?: string | null
          ambient_video_id?: string | null
          artist?: string | null
          artist_en?: string | null
          artist_es?: string | null
          audio_url?: string
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          language?: string
          lyrics_indigenous?: string
          lyrics_pt?: string
          lyrics_pt_en?: string | null
          lyrics_pt_es?: string | null
          order_index?: number
          style?: Json
          sync_offsets?: number[] | null
          title?: string
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_ambient_video_id_fkey"
            columns: ["ambient_video_id"]
            isOneToOne: false
            referencedRelation: "ambient_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          scheduled_change_action: string | null
          scheduled_change_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          scheduled_change_action?: string | null
          scheduled_change_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          scheduled_change_action?: string | null
          scheduled_change_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      trails: {
        Row: {
          created_at: string
          default_progress: number
          description: string | null
          description_en: string | null
          description_es: string | null
          id: string
          image_url: string | null
          name: string
          name_en: string | null
          name_es: string | null
          order_index: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_progress?: number
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_en?: string | null
          name_es?: string | null
          order_index?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_progress?: number
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_en?: string | null
          name_es?: string | null
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      ui_templates: {
        Row: {
          category: string
          config: Json | null
          created_at: string | null
          id: string
          name: string
          preview_url: string | null
        }
        Insert: {
          category: string
          config?: Json | null
          created_at?: string | null
          id?: string
          name: string
          preview_url?: string | null
        }
        Update: {
          category?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          preview_url?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          assistant_name: string | null
          instrucao: string | null
          language: string | null
          lingua_ancestral: string | null
          respostas_em_voz: boolean | null
          updated_at: string | null
          user_id: string
          voice_model: string | null
        }
        Insert: {
          assistant_name?: string | null
          instrucao?: string | null
          language?: string | null
          lingua_ancestral?: string | null
          respostas_em_voz?: boolean | null
          updated_at?: string | null
          user_id: string
          voice_model?: string | null
        }
        Update: {
          assistant_name?: string | null
          instrucao?: string | null
          language?: string | null
          lingua_ancestral?: string | null
          respostas_em_voz?: boolean | null
          updated_at?: string | null
          user_id?: string
          voice_model?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_subscription: {
        Args: { _check_env?: string; _user_id: string }
        Returns: boolean
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_plan_access: {
        Args: { _check_env?: string; _plan: string; _user_id: string }
        Returns: boolean
      }
      has_premium_access: {
        Args: { _check_env?: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_access_allowed: { Args: { _user_id: string }; Returns: boolean }
      is_login_allowed: {
        Args: { _email: string; _phone: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      weekly_top_learners: {
        Args: { _limit?: number }
        Returns: {
          name: string
          photo_url: string
          points: number
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "premium"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user", "premium"],
    },
  },
} as const
