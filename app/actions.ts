"use server";

import { serverClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// For our purposes, here's a simple encodedRedirect helper that logs and then redirects:
export function encodedRedirect(status: "success" | "error", url: string, message: string) {
  console.log(`Redirecting with status: ${status}, message: ${message}`);
  return redirect(url);
}

export const onboardingAction = async (formData: FormData) => {
  console.log("Starting onboardingAction");

  // Retrieve form values
  const username = formData.get("username")?.toString();
  const bio = formData.get("bio")?.toString();
  // Retrieve the image file (if provided)
  const imageFile = formData.get("image") as File | null;
  console.log("Form data received:", { username, bio, imageFile });

  if (!username || !bio) {
    console.error("Missing username or bio");
    return encodedRedirect("error", "/onboarding", "Username and bio are required");
  }

  const supabase = serverClient();

  // Debug: Log Supabase configuration (ensure the URL is correct)
  console.log("Supabase URL from env:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Debug: List available buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  console.log("Buckets available:", buckets, bucketsError);
  const bucketNames = buckets?.map((b) => b.name) || [];
  if (!bucketNames.includes("avatars")) {
    console.error("Bucket 'avatars' not found in Supabase Storage");
  } else {
    console.log("Bucket 'avatars' found.");
  }

  // Retrieve the currently authenticated user
  const { data: userData, error: getUserError } = await supabase.auth.getUser();
  console.log("User data from getUser:", userData, getUserError);
  const user = userData?.user;
  if (!user) {
    console.error("User not logged in");
    return encodedRedirect("error", "/sign-in", "User not logged in");
  }
  console.log("Authenticated user:", user);

  let imageUrl: string | null = null;

  // If an image file is provided, upload it to the "avatars" bucket
  if (imageFile && imageFile.size > 0) {
    console.log("Image file detected:", imageFile);
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = fileName; // Optionally, you can organize files in subfolders

    // The following line uploads the image file to the "avatars" bucket:
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, imageFile);
    console.log("Image upload response:", uploadError);

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      return encodedRedirect("error", "/onboarding", uploadError.message);
    }

    // Retrieve the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    console.log("Public URL data:", publicUrlData);
    imageUrl = publicUrlData.publicUrl;
  }

  // Prepare profile data for upsert (insert or update)
  const profileData = {
    id: user.id,
    username,
    bio,
    onboarded: true,
    image: imageUrl,
  };
  console.log("Profile data to upsert:", profileData);

  // Upsert the profile data in the "users" table
  const { error: upsertError, data: upsertData } = await supabase
    .from("users")
    .upsert(profileData, { onConflict: "id" });
  console.log("Upsert result:", upsertError, upsertData);

  if (upsertError) {
    console.error("Onboarding upsert error:", upsertError);
    return encodedRedirect("error", "/onboarding", upsertError.message);
  }

  console.log("Onboarding upsert successful. Redirecting to /app");
  return encodedRedirect("success", "/app", "Onboarding complete!");
};
