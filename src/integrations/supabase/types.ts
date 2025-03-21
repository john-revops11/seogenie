export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_requests: {
        Row: {
          cost: number
          created_at: string | null
          endpoint: string
          expires_at: string
          id: string
          request_data: Json
          request_hash: string
          response_data: Json
          user_id: string | null
        }
        Insert: {
          cost?: number
          created_at?: string | null
          endpoint: string
          expires_at: string
          id?: string
          request_data: Json
          request_hash: string
          response_data: Json
          user_id?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          endpoint?: string
          expires_at?: string
          id?: string
          request_data?: Json
          request_hash?: string
          response_data?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_name: string
          created_at: string | null
          estimated_cost: number
          id: string
          request_count: number
          updated_at: string | null
          usage_date: string
          user_id: string | null
        }
        Insert: {
          api_name: string
          created_at?: string | null
          estimated_cost?: number
          id?: string
          request_count?: number
          updated_at?: string | null
          usage_date: string
          user_id?: string | null
        }
        Update: {
          api_name?: string
          created_at?: string | null
          estimated_cost?: number
          id?: string
          request_count?: number
          updated_at?: string | null
          usage_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_history: {
        Row: {
          ai_model: string | null
          ai_provider: string | null
          content: string
          content_type: string
          created_at: string
          id: string
          keywords: string[]
          meta_description: string | null
          outline: string[] | null
          rag_enabled: boolean | null
          title: string
          topic: string | null
          user_id: string | null
        }
        Insert: {
          ai_model?: string | null
          ai_provider?: string | null
          content: string
          content_type: string
          created_at?: string
          id?: string
          keywords: string[]
          meta_description?: string | null
          outline?: string[] | null
          rag_enabled?: boolean | null
          title: string
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          ai_model?: string | null
          ai_provider?: string | null
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          keywords?: string[]
          meta_description?: string | null
          outline?: string[] | null
          rag_enabled?: boolean | null
          title?: string
          topic?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_table_exists: {
        Args: {
          table_name: string
        }
        Returns: boolean
      }
      get_cached_api_response: {
        Args: {
          p_request_hash: string
          p_user_id: string
        }
        Returns: Json
      }
      get_dataforseo_usage: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total_cost: number
          request_count: number
        }[]
      }
      get_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      store_api_request: {
        Args: {
          p_user_id: string
          p_endpoint: string
          p_request_data: Json
          p_response_data: Json
          p_expires_at: string
          p_request_hash: string
          p_cost: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
