import { supabase } from "@/lib/supabase";

// Hämta alla offers
export const getOffers = async () => {
  return await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });
};

// Uppdatera status + data
export const updateOffer = async (id, data) => {
  return await supabase
    .from("offers")
    .update(data)
    .eq("id", id);
};

// Radera
export const deleteOffer = async (id) => {
  return await supabase.from("offers").delete().eq("id", id);
};