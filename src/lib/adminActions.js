import { supabase } from "./supabaseClient";

// Deletes a booking's uploaded files from Storage, then the row itself.
// Used by the admin "Done" button now, and reusable later for the
// scheduled past-bookings cleanup job — same operation either way.
export async function deleteBookingCompletely(booking) {
  const folder = booking.id_photo_url?.split("/")[0];

  if (folder) {
    const { data: files } = await supabase.storage
      .from("booking-uploads")
      .list(folder);

    if (files && files.length > 0) {
      const paths = files.map((file) => `${folder}/${file.name}`);
      await supabase.storage.from("booking-uploads").remove(paths);
    }
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", booking.id);

  return { error: error?.message ?? null };
}

export async function getSignedUrl(path, expiresInSeconds = 3600) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("booking-uploads")
    .createSignedUrl(path, expiresInSeconds);

  if (error) return null;
  return data.signedUrl;
}
