export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      automation_events: {
        Row: {
          created_at: string
          detail: Json
          id: string
          lead_id: string | null
          status: string
          step: string
          vertical_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: Json
          id?: string
          lead_id?: string | null
          status?: string
          step: string
          vertical_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: Json
          id?: string
          lead_id?: string | null
          status?: string
          step?: string
          vertical_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_events_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_entries: {
        Row: {
          category: string
          created_at: string
          embedding: string | null
          id: string
          lead_id: string | null
          quote: string | null
          source: string
          text: string
          updated_at: string
          vertical_id: string
          weight: number
        }
        Insert: {
          category: string
          created_at?: string
          embedding?: string | null
          id?: string
          lead_id?: string | null
          quote?: string | null
          source: string
          text: string
          updated_at?: string
          vertical_id: string
          weight?: number
        }
        Update: {
          category?: string
          created_at?: string
          embedding?: string | null
          id?: string
          lead_id?: string | null
          quote?: string | null
          source?: string
          text?: string
          updated_at?: string
          vertical_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "brain_entries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_entries_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          created_at: string
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          kipps_call_id: string | null
          language: string | null
          lead_id: string
          raw_webhook_payload: Json | null
          recording_url: string | null
          started_at: string | null
          status: string
          transcript: string | null
          vertical_id: string | null
        }
        Insert: {
          created_at?: string
          direction: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          kipps_call_id?: string | null
          language?: string | null
          lead_id: string
          raw_webhook_payload?: Json | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          vertical_id?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          kipps_call_id?: string | null
          language?: string | null
          lead_id?: string
          raw_webhook_payload?: Json | null
          recording_url?: string | null
          started_at?: string | null
          status?: string
          transcript?: string | null
          vertical_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachments: Json
          body: string
          channel: string
          created_at: string
          direction: string
          id: string
          kipps_message_id: string | null
          language: string | null
          lead_id: string
          raw_webhook_payload: Json | null
          sent_at: string | null
          vertical_id: string | null
        }
        Insert: {
          attachments?: Json
          body: string
          channel: string
          created_at?: string
          direction: string
          id?: string
          kipps_message_id?: string | null
          language?: string | null
          lead_id: string
          raw_webhook_payload?: Json | null
          sent_at?: string | null
          vertical_id?: string | null
        }
        Update: {
          attachments?: Json
          body?: string
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          kipps_message_id?: string | null
          language?: string | null
          lead_id?: string
          raw_webhook_payload?: Json | null
          sent_at?: string | null
          vertical_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      escalations: {
        Row: {
          context_bundle: Json
          created_at: string
          id: string
          lead_id: string
          reason: string
          resolved_at: string | null
          status: string
          vertical_id: string | null
        }
        Insert: {
          context_bundle?: Json
          created_at?: string
          id?: string
          lead_id: string
          reason: string
          resolved_at?: string | null
          status?: string
          vertical_id?: string | null
        }
        Update: {
          context_bundle?: Json
          created_at?: string
          id?: string
          lead_id?: string
          reason?: string
          resolved_at?: string | null
          status?: string
          vertical_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_schedule: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          scheduled_for: string
          status: string
          step: string
          vertical_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          scheduled_for: string
          status?: string
          step: string
          vertical_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          scheduled_for?: string
          status?: string
          step?: string
          vertical_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_schedule_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_schedule_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget: string | null
          channel: string
          city: string | null
          created_at: string
          documents: Json
          email: string | null
          id: string
          industry: string | null
          lead_score: number | null
          name: string | null
          phone: string | null
          pipeline_stage: string
          preferred_language: string | null
          raw_inbound_payload: Json | null
          requirements: string | null
          status: string
          updated_at: string
          vertical_id: string | null
        }
        Insert: {
          budget?: string | null
          channel: string
          city?: string | null
          created_at?: string
          documents?: Json
          email?: string | null
          id?: string
          industry?: string | null
          lead_score?: number | null
          name?: string | null
          phone?: string | null
          pipeline_stage?: string
          preferred_language?: string | null
          raw_inbound_payload?: Json | null
          requirements?: string | null
          status?: string
          updated_at?: string
          vertical_id?: string | null
        }
        Update: {
          budget?: string | null
          channel?: string
          city?: string | null
          created_at?: string
          documents?: Json
          email?: string | null
          id?: string
          industry?: string | null
          lead_score?: number | null
          name?: string | null
          phone?: string | null
          pipeline_stage?: string
          preferred_language?: string | null
          raw_inbound_payload?: Json | null
          requirements?: string | null
          status?: string
          updated_at?: string
          vertical_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          angles: Json
          asks: Json
          avoid: Json
          composed_at: string
          id: string
          language: string
          objections: Json
          openers: Json
          source_brain_entry_ids: string[]
          vertical_id: string
          voicemail: string | null
        }
        Insert: {
          angles?: Json
          asks?: Json
          avoid?: Json
          composed_at?: string
          id?: string
          language?: string
          objections?: Json
          openers?: Json
          source_brain_entry_ids?: string[]
          vertical_id: string
          voicemail?: string | null
        }
        Update: {
          angles?: Json
          asks?: Json
          avoid?: Json
          composed_at?: string
          id?: string
          language?: string
          objections?: Json
          openers?: Json
          source_brain_entry_ids?: string[]
          vertical_id?: string
          voicemail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbooks_vertical_id_fkey"
            columns: ["vertical_id"]
            isOneToOne: false
            referencedRelation: "verticals"
            referencedColumns: ["id"]
          },
        ]
      }
      shield_log: {
        Row: {
          created_at: string
          id: string
          input_excerpt: string
          lead_id: string | null
          matched_rule: string
          source: string
          verdict: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_excerpt: string
          lead_id?: string | null
          matched_rule: string
          source: string
          verdict: string
        }
        Update: {
          created_at?: string
          id?: string
          input_excerpt?: string
          lead_id?: string | null
          matched_rule?: string
          source?: string
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "shield_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      verticals: {
        Row: {
          considerations: Json
          created_at: string
          icp: Json
          id: string
          kipps_chatbot_id: string | null
          kipps_voicebot_id: string | null
          lead_channels: Json
          name: string
          status: string
          updated_at: string
          voice_persona: Json
          what_you_sell: string
          who_you_sell_to: string
        }
        Insert: {
          considerations?: Json
          created_at?: string
          icp?: Json
          id?: string
          kipps_chatbot_id?: string | null
          kipps_voicebot_id?: string | null
          lead_channels?: Json
          name: string
          status?: string
          updated_at?: string
          voice_persona?: Json
          what_you_sell: string
          who_you_sell_to: string
        }
        Update: {
          considerations?: Json
          created_at?: string
          icp?: Json
          id?: string
          kipps_chatbot_id?: string | null
          kipps_voicebot_id?: string | null
          lead_channels?: Json
          name?: string
          status?: string
          updated_at?: string
          voice_persona?: Json
          what_you_sell?: string
          who_you_sell_to?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

