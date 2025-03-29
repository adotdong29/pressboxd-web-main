"use server";

import { encodedRedirect } from "@/utils/utils";
import { serverClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = serverClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = serverClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/app");
};

export const onboardingAction = async (formData: FormData) => {
  try {
    const supabase = serverClient();
    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as string;
    
    if (!username || !bio) {
      return encodedRedirect("error", "/app/onboarding", "Username and bio are required");
    }
    
    // Check if user exists
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return redirect("/sign-in");
    }

    console.log("User authenticated:", user.id);

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      return encodedRedirect("error", "/app/onboarding", "Username is already taken");
    }
    
    let profileImageUrl = null;

    // Only try to upload if an image was provided
    if (image && image !== "") {
      try {
        // Create a unique filename based on user ID and timestamp
        const filename = `${user.id}_${Date.now()}`;
        
        console.log("Attempting to upload image to avatars bucket with filename:", filename);
        
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(filename, image, {
            upsert: true
          });

        if (error) {
          console.error("Storage error:", error);
        } else {
          console.log("Image uploaded successfully");
          
          // Get the public URL
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filename);
          
          profileImageUrl = publicUrlData?.publicUrl || null;
          console.log("Profile image URL:", profileImageUrl);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    
    console.log("Creating user profile with data:", {
      id: user.id,
      username,
      bio,
      profile_url: profileImageUrl,
      onboarded: true
    });
    
    // Insert user profile
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        username,
        bio,
        profile_url: profileImageUrl,
        onboarded: true
      });

    if (profileError) {
      console.error("Profile error:", profileError);
      return encodedRedirect("error", "/app/onboarding", profileError.message);
    }

    console.log("User profile created successfully");
    return redirect("/app");
  } catch (err) {
    console.error("Onboarding error:", err);
    return encodedRedirect("error", "/app/onboarding", "An unexpected error occurred");
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = serverClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/app/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = serverClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/app/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect("error", "/app/reset-password", "Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect("error", "/app/reset-password", "Password update failed");
  }

  return encodedRedirect("success", "/app/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = serverClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};