import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function POST(req) {
  const data = await req.json();

  const { error } = await supabase.from("offers").insert([
    {
      company_id: data.companyId,
      name: data.namn,
      email: data.email,
      price: data.pris,
      data: data
    }
  ]);

  if (error) {
    return Response.json({ success: false, error });
  }

  return Response.json({ success: true });
}