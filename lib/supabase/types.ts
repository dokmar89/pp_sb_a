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
      admin_actions_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_login_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown
          success: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address: unknown
          success: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          success?: boolean
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login_at: string | null
          name: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login_at?: string | null
          name: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login_at?: string | null
          name?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string
          contact_person: string
          created_at: string
          dic: string
          email: string
          ico: string
          id: string
          name: string
          phone: string
          status: string
          user_id: string | null
          walletBalance: number
        }
        Insert: {
          address: string
          contact_person: string
          created_at?: string
          dic: string
          email: string
          ico: string
          id?: string
          name: string
          phone: string
          status?: string
          user_id?: string | null
          walletBalance?: number
        }
        Update: {
          address?: string
          contact_person?: string
          created_at?: string
          dic?: string
          email?: string
          ico?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          user_id?: string | null
          walletBalance?: number
        }
        Relationships: []
      }
      customizations: {
        Row: {
          button_style: string
          created_at: string
          failure_action: string
          failure_redirect: string | null
          font: string
          id: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          shop_id: string
          updated_at: string
          verification_methods: string[]
        }
        Insert: {
          button_style: string
          created_at?: string
          failure_action: string
          failure_redirect?: string | null
          font: string
          id?: string
          logo_url?: string | null
          primary_color: string
          secondary_color: string
          shop_id: string
          updated_at?: string
          verification_methods: string[]
        }
        Update: {
          button_style?: string
          created_at?: string
          failure_action?: string
          failure_redirect?: string | null
          font?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          shop_id?: string
          updated_at?: string
          verification_methods?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "customizations_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      errors: {
        Row: {
          created_at: string
          error_details: Json | null
          error_message: string
          error_type: string
          id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          shop_id: string | null
          source: string
          status: string
          verification_id: string | null
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          error_message: string
          error_type: string
          id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          shop_id?: string | null
          source: string
          status?: string
          verification_id?: string | null
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          error_message?: string
          error_type?: string
          id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          shop_id?: string | null
          source?: string
          status?: string
          verification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "errors_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "errors_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          method: string
          verification_hash: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          method: string
          verification_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          method?: string
          verification_hash?: string
        }
        Relationships: []
      }
      settings_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          setting_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          setting_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          setting_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_audit_log_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "system_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          api_key: string
          company_id: string
          created_at: string
          id: string
          integration_type: string
          name: string
          pricing_plan: string
          sector: string
          status: string
          url: string
          verification_methods: string[]
        }
        Insert: {
          api_key: string
          company_id: string
          created_at?: string
          id?: string
          integration_type: string
          name: string
          pricing_plan: string
          sector: string
          status?: string
          url: string
          verification_methods: string[]
        }
        Update: {
          api_key?: string
          company_id?: string
          created_at?: string
          id?: string
          integration_type?: string
          name?: string
          pricing_plan?: string
          sector?: string
          status?: string
          url?: string
          verification_methods?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "shops_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_staff: boolean
          message: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff?: boolean
          message: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_staff?: boolean
          message?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          priority: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      verification_results: {
        Row: {
          created_at: string
          id: string
          identifier: string
          metadata: Json | null
          save_method: Database["public"]["Enums"]["verification_save_method"]
          valid_until: string
          verification_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          metadata?: Json | null
          save_method: Database["public"]["Enums"]["verification_save_method"]
          valid_until: string
          verification_id: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          metadata?: Json | null
          save_method?: Database["public"]["Enums"]["verification_save_method"]
          valid_until?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_results_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          completed_at: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          method: string
          price: number
          result: string
          session_id: string
          shop_id: string
          status: string
        }
        Insert: {
          completed_at: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          method: string
          price: number
          result: string
          session_id: string
          shop_id: string
          status?: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          method?: string
          price?: number
          result?: string
          session_id?: string
          shop_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "verifications_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          description: string
          id: string
          invoice_number: string | null
          status: string
          type: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          description: string
          id?: string
          invoice_number?: string | null
          status?: string
          type: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          invoice_number?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credit:
        | {
            Args: {
              p_company_id: string
              p_amount: number
            }
            Returns: undefined
          }
        | {
            Args: {
              p_company_id: string
              p_amount: number
            }
            Returns: undefined
          }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_top_companies_this_month: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_name: string
          verification_count: number
          success_rate: string
        }[]
      }
      update_wallet_balance: {
        Args: {
          p_client_id: string
          p_amount: number
          p_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      verification_method:
        | "bankid"
        | "mojeid"
        | "ocr"
        | "facescan"
        | "repeated"
        | "qr"
      verification_save_method:
        | "phone"
        | "email"
        | "google"
        | "apple"
        | "cookie"
      verification_status: "pending" | "success" | "failure"
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
