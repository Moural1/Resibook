import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = {
  key: string;
  title: string;
  bucket: string;
  file_path: string;
  public_url?: string | null;
  file_type?: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    if (!body.key || !body.title || !body.bucket || !body.file_path) {
      return NextResponse.json(
        { error: "key, title, bucket e file_path são obrigatórios" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload = {
      key: body.key,
      title: body.title,
      bucket: body.bucket,
      file_path: body.file_path,
      public_url: body.public_url || null,
      file_type: body.file_type || null,
    };

    const { error } = await supabase.from("app_assets").upsert([payload]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, asset: payload });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "erro inesperado" },
      { status: 500 }
    );
  }
}