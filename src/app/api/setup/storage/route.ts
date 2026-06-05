import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: Array<{
      bucket: string;
      ok: boolean;
      message?: string;
    }> = [];

    async function ensureBucket(
      name: string,
      options: {
        public: boolean;
        allowedMimeTypes?: string[];
        fileSizeLimit?: string;
      }
    ) {
      const { data: existingBuckets, error: listError } =
        await supabase.storage.listBuckets();

      if (listError) {
        results.push({
          bucket: name,
          ok: false,
          message: `Erro ao listar buckets: ${listError.message}`,
        });
        return;
      }

      const alreadyExists = existingBuckets?.some((b) => b.name === name);

      if (alreadyExists) {
        results.push({
          bucket: name,
          ok: true,
          message: "Bucket já existia",
        });
        return;
      }

      const { error } = await supabase.storage.createBucket(name, {
        public: options.public,
        allowedMimeTypes: options.allowedMimeTypes,
        fileSizeLimit: options.fileSizeLimit,
      });

      if (error) {
        results.push({
          bucket: name,
          ok: false,
          message: error.message,
        });
        return;
      }

      results.push({
        bucket: name,
        ok: true,
        message: "Bucket criado com sucesso",
      });
    }

    await ensureBucket("resibook-assets", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
      fileSizeLimit: "10MB",
    });

    await ensureBucket("resibook-docs", {
      public: false,
      allowedMimeTypes: [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4",
        "audio/webm",
      ],
      fileSizeLimit: "50MB",
    });

    return NextResponse.json({
      ok: true,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro inesperado ao criar buckets" },
      { status: 500 }
    );
  }
}