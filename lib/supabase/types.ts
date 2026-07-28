export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          address: string
          awards: string[]
          booking_notice: string
          cancellation_policy: string
          certifications: string[]
          city: string
          created_at: string
          deposit_policy: string
          description: string
          email: string
          founded_year: string
          id: string
          languages: string[]
          logo: string
          map_url: string
          minimum_guests: string
          name: string
          notifications: Json
          onboarded: boolean
          opening_hours: Json
          owner_id: string
          phone: string
          published: boolean
          published_at: string | null
          service_areas: string[]
          slug: string
          social: Json
          story: string
          subscription: Json
          tagline: string
          team_size: string
          theme: Json
          travel_policy: string
          type: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address?: string
          awards?: string[]
          booking_notice?: string
          cancellation_policy?: string
          certifications?: string[]
          city?: string
          created_at?: string
          deposit_policy?: string
          description?: string
          email?: string
          founded_year?: string
          id?: string
          languages?: string[]
          logo?: string
          map_url?: string
          minimum_guests?: string
          name?: string
          notifications?: Json
          onboarded?: boolean
          opening_hours?: Json
          owner_id: string
          phone?: string
          published?: boolean
          published_at?: string | null
          service_areas?: string[]
          slug: string
          social?: Json
          story?: string
          subscription?: Json
          tagline?: string
          team_size?: string
          theme?: Json
          travel_policy?: string
          type?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          address?: string
          awards?: string[]
          booking_notice?: string
          cancellation_policy?: string
          certifications?: string[]
          city?: string
          created_at?: string
          deposit_policy?: string
          description?: string
          email?: string
          founded_year?: string
          id?: string
          languages?: string[]
          logo?: string
          map_url?: string
          minimum_guests?: string
          name?: string
          notifications?: Json
          onboarded?: boolean
          opening_hours?: Json
          owner_id?: string
          phone?: string
          published?: boolean
          published_at?: string | null
          service_areas?: string[]
          slug?: string
          social?: Json
          story?: string
          subscription?: Json
          tagline?: string
          team_size?: string
          theme?: Json
          travel_policy?: string
          type?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          business_id: string
          id: string
          position: number
          question: string
        }
        Insert: {
          answer?: string
          business_id: string
          id?: string
          position?: number
          question?: string
        }
        Update: {
          answer?: string
          business_id?: string
          id?: string
          position?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          business_id: string
          caption: string
          category: string
          event_type: string
          featured: boolean
          guest_count: string
          id: string
          location: string
          position: number
          url: string
        }
        Insert: {
          business_id: string
          caption?: string
          category?: string
          event_type?: string
          featured?: boolean
          guest_count?: string
          id?: string
          location?: string
          position?: number
          url?: string
        }
        Update: {
          business_id?: string
          caption?: string
          category?: string
          event_type?: string
          featured?: boolean
          guest_count?: string
          id?: string
          location?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget: string
          business_id: string
          customer_name: string
          details: string
          dietary_requirements: string
          email: string
          event_date: string
          event_location: string
          event_time: string
          event_type: string
          guest_count: number
          hear_about_us: string
          id: string
          phone: string
          preferred_contact: string
          preferred_menu: string
          received_at: string
          referrer: string
          service_style: string
          source: string
          status: string
        }
        Insert: {
          budget?: string
          business_id: string
          customer_name?: string
          details?: string
          dietary_requirements?: string
          email?: string
          event_date?: string
          event_location?: string
          event_time?: string
          event_type?: string
          guest_count?: number
          hear_about_us?: string
          id?: string
          phone?: string
          preferred_contact?: string
          preferred_menu?: string
          received_at?: string
          referrer?: string
          service_style?: string
          source?: string
          status?: string
        }
        Update: {
          budget?: string
          business_id?: string
          customer_name?: string
          details?: string
          dietary_requirements?: string
          email?: string
          event_date?: string
          event_location?: string
          event_time?: string
          event_type?: string
          guest_count?: number
          hear_about_us?: string
          id?: string
          phone?: string
          preferred_contact?: string
          preferred_menu?: string
          received_at?: string
          referrer?: string
          service_style?: string
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          business_id: string
          description: string
          id: string
          name: string
          position: number
        }
        Insert: {
          business_id: string
          description?: string
          id?: string
          name?: string
          position?: number
        }
        Update: {
          business_id?: string
          description?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[]
          available: boolean
          business_id: string
          category_id: string | null
          description: string
          dietary: string[]
          featured: boolean
          id: string
          image: string
          ingredients: string
          lead_time: string
          minimum_order: string
          name: string
          position: number
          preparation: string
          price: string
          pricing_unit: string
          seasonal: string
          serving_size: string
          views: number
        }
        Insert: {
          allergens?: string[]
          available?: boolean
          business_id: string
          category_id?: string | null
          description?: string
          dietary?: string[]
          featured?: boolean
          id?: string
          image?: string
          ingredients?: string
          lead_time?: string
          minimum_order?: string
          name?: string
          position?: number
          preparation?: string
          price?: string
          pricing_unit?: string
          seasonal?: string
          serving_size?: string
          views?: number
        }
        Update: {
          allergens?: string[]
          available?: boolean
          business_id?: string
          category_id?: string | null
          description?: string
          dietary?: string[]
          featured?: boolean
          id?: string
          image?: string
          ingredients?: string
          lead_time?: string
          minimum_order?: string
          name?: string
          position?: number
          preparation?: string
          price?: string
          pricing_unit?: string
          seasonal?: string
          serving_size?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      process_steps: {
        Row: {
          business_id: string
          description: string
          duration: string
          id: string
          position: number
          title: string
        }
        Insert: {
          business_id: string
          description?: string
          duration?: string
          id?: string
          position?: number
          title?: string
        }
        Update: {
          business_id?: string
          description?: string
          duration?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_steps_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          capacity: string
          description: string
          highlights: string[]
          id: string
          image: string
          position: number
          price_from: string
          title: string
        }
        Insert: {
          business_id: string
          capacity?: string
          description?: string
          highlights?: string[]
          id?: string
          image?: string
          position?: number
          price_from?: string
          title?: string
        }
        Update: {
          business_id?: string
          capacity?: string
          description?: string
          highlights?: string[]
          id?: string
          image?: string
          position?: number
          price_from?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visit_days: {
        Row: {
          business_id: string
          views: number
          visited_on: string
        }
        Insert: {
          business_id: string
          views?: number
          visited_on: string
        }
        Update: {
          business_id?: string
          views?: number
          visited_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_visit_days_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      stats: {
        Row: {
          business_id: string
          id: string
          label: string
          position: number
          value: string
        }
        Insert: {
          business_id: string
          id?: string
          label?: string
          position?: number
          value?: string
        }
        Update: {
          business_id?: string
          id?: string
          label?: string
          position?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "stats_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string
          business_id: string
          id: string
          image: string
          name: string
          position: number
          role: string
        }
        Insert: {
          bio?: string
          business_id: string
          id?: string
          image?: string
          name?: string
          position?: number
          role?: string
        }
        Update: {
          bio?: string
          business_id?: string
          id?: string
          image?: string
          name?: string
          position?: number
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author: string
          business_id: string
          context: string
          event_date: string
          id: string
          position: number
          quote: string
          rating: number
        }
        Insert: {
          author?: string
          business_id: string
          context?: string
          event_date?: string
          id?: string
          position?: number
          quote?: string
          rating?: number
        }
        Update: {
          author?: string
          business_id?: string
          context?: string
          event_date?: string
          id?: string
          position?: number
          quote?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      website_sections: {
        Row: {
          body: string
          business_id: string
          cta_label: string | null
          eyebrow: string
          id: string
          label: string
          position: number
          secondary_cta_label: string | null
          section_key: string
          title: string
          visible: boolean
        }
        Insert: {
          body?: string
          business_id: string
          cta_label?: string | null
          eyebrow?: string
          id?: string
          label?: string
          position?: number
          secondary_cta_label?: string | null
          section_key: string
          title?: string
          visible?: boolean
        }
        Update: {
          body?: string
          business_id?: string
          cta_label?: string | null
          eyebrow?: string
          id?: string
          label?: string
          position?: number
          secondary_cta_label?: string | null
          section_key?: string
          title?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "website_sections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_site_visit: { Args: { p_business_id: string }; Returns: undefined }
      submit_lead: {
        Args: {
          p_business_id: string
          p_customer_name: string
          p_email: string
          p_phone: string
          p_event_date: string
          p_event_time: string
          p_event_location: string
          p_event_type: string
          p_guest_count: number
          p_budget: string
          p_service_style: string
          p_preferred_menu: string
          p_dietary_requirements: string
          p_details: string
          p_preferred_contact: string
          p_hear_about_us: string
          p_source: string
          p_referrer: string
        }
        Returns: string
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

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"]
