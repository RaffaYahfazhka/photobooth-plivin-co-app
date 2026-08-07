import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a base64 photo to Supabase Storage and save the record to the photos table.
 */
export const savePhoto = async (base64DataUrl: string, layout: string) => {
  try {
    // Convert base64 to blob
    const res = await fetch(base64DataUrl);
    const blob = await res.blob();

    const fileName = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const filePath = `captures/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, blob, { contentType: "image/png" });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

    // Save to database
    const { error: dbError } = await supabase
      .from("photos")
      .insert({ image_url: urlData.publicUrl, layout });

    if (dbError) {
      console.error("DB insert error:", dbError);
    }
  } catch (err) {
    console.error("Save photo failed:", err);
  }
};
