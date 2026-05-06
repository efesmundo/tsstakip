import type { Database } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ProductGroup = Database["public"]["Tables"]["product_groups"]["Row"];
export type ServiceType = Database["public"]["Tables"]["service_types"]["Row"];
export type Subcontractor = Database["public"]["Tables"]["subcontractors"]["Row"];
export type PhotoRule = Database["public"]["Tables"]["photo_rules"]["Row"];
export type ServicePhoto = Database["public"]["Tables"]["service_photos"]["Row"];
export type PrioritySetting =
  Database["public"]["Tables"]["priority_settings"]["Row"];

export type ServiceLookup = {
  products: Map<string, ProductGroup>;
  types: Map<string, ServiceType>;
  members: Map<string, Profile>;
  subcontractors: Map<string, Subcontractor>;
};

export function createLookup(input: {
  products?: ProductGroup[] | null;
  types?: ServiceType[] | null;
  members?: Profile[] | null;
  subcontractors?: Subcontractor[] | null;
}): ServiceLookup {
  return {
    products: new Map((input.products ?? []).map((item) => [item.id, item])),
    types: new Map((input.types ?? []).map((item) => [item.id, item])),
    members: new Map((input.members ?? []).map((item) => [item.id, item])),
    subcontractors: new Map(
      (input.subcontractors ?? []).map((item) => [item.id, item]),
    ),
  };
}
