import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return Response.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    // check exist
    const { data: existing } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return Response.json(existing);
    }

    // create
    const { data, error } = await supabase
      .from("customers")
      .insert([{ name, email }])
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}