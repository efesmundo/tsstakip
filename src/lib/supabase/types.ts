export type UserRole = "admin" | "member";
export type ServicePriority = "urgent" | "high" | "normal" | "low";
export type ServiceStatus =
  | "pending"
  | "in_progress"
  | "awaiting_approval"
  | "approved"
  | "completed"
  | "canceled"
  | "rejected";
export type TeamType = "technical_team" | "subcontractor";
export type FeeType = "free" | "paid" | "warranty";
export type PaymentStatus = "pending" | "paid" | "partial";
export type PhotoType = "start" | "end" | "during";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: UserRole;
          is_active?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      subcontractors: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_name?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subcontractors"]["Insert"]>;
        Relationships: [];
      };
      product_groups: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_groups"]["Insert"]>;
        Relationships: [];
      };
      service_types: {
        Row: {
          id: string;
          name: string;
          product_group_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          product_group_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_types"]["Insert"]>;
        Relationships: [];
      };
      priority_settings: {
        Row: {
          priority: ServicePriority;
          label: string;
          is_active: boolean;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          priority: ServicePriority;
          label: string;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["priority_settings"]["Insert"]
        >;
        Relationships: [];
      };
      photo_rules: {
        Row: {
          id: string;
          require_start_photo: boolean;
          require_end_photo: boolean;
          camera_only: boolean;
          gallery_upload_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          require_start_photo?: boolean;
          require_end_photo?: boolean;
          camera_only?: boolean;
          gallery_upload_enabled?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["photo_rules"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          service_number: string;
          customer_name: string;
          customer_phone: string;
          address: string;
          district: string | null;
          site_id: string;
          project_name: string | null;
          product_group_id: string | null;
          service_type_id: string | null;
          member_id: string | null;
          priority: ServicePriority;
          scheduled_at: string | null;
          description: string | null;
          status: ServiceStatus;
          team_type: TeamType;
          subcontractor_id: string | null;
          subcontractor_contact: string | null;
          subcontractor_phone: string | null;
          fee_type: FeeType;
          amount: number | null;
          currency: string;
          payment_status: PaymentStatus | null;
          warranty_code: string | null;
          warranty_expires_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          customer_approval_sent_at: string | null;
          customer_approved_at: string | null;
          customer_rejected_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_number?: string;
          customer_name: string;
          customer_phone: string;
          address: string;
          district?: string | null;
          site_id: string;
          project_name?: string | null;
          product_group_id?: string | null;
          service_type_id?: string | null;
          member_id?: string | null;
          priority?: ServicePriority;
          scheduled_at?: string | null;
          description?: string | null;
          status?: ServiceStatus;
          team_type?: TeamType;
          subcontractor_id?: string | null;
          subcontractor_contact?: string | null;
          subcontractor_phone?: string | null;
          fee_type?: FeeType;
          amount?: number | null;
          currency?: string;
          payment_status?: PaymentStatus | null;
          warranty_code?: string | null;
          warranty_expires_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          customer_approval_sent_at?: string | null;
          customer_approved_at?: string | null;
          customer_rejected_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      service_photos: {
        Row: {
          id: string;
          service_id: string;
          photo_type: PhotoType;
          storage_path: string;
          uploaded_by: string | null;
          taken_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          photo_type: PhotoType;
          storage_path: string;
          uploaded_by?: string | null;
          taken_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_photos"]["Insert"]>;
        Relationships: [];
      };
      api_tokens: {
        Row: {
          id: string;
          name: string;
          token_hash: string;
          token_preview: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          token_hash: string;
          token_preview: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["api_tokens"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      service_priority: ServicePriority;
      service_status: ServiceStatus;
      team_type: TeamType;
      fee_type: FeeType;
      payment_status: PaymentStatus;
      photo_type: PhotoType;
    };
    CompositeTypes: Record<string, never>;
  };
};
