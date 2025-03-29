import { serverClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { onboardingAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImagePicker from "@/components/image-picker";

export default async function Onboarding({ searchParams }: { searchParams: Message }) {
  const supabase = serverClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select()
    .eq("id", user?.id)
    .single();

  if (!user) {
    return redirect("/sign-in");
  }

  if (profile?.onboarded) {
    return redirect("/app");
  }

  return (
    // The form's action attribute triggers the onboardingAction
    <form action={onboardingAction} className="flex-1 flex flex-col min-w-64">
      <h1 className="text-3xl font-medium">Welcome to Pressboxd!</h1>
      <div className="flex flex-col gap-2 mt-8">
        <ImagePicker name="image" />
        <Label htmlFor="username">Username</Label>
        <Input name="username" placeholder="@lebronbrady" required />
        <Label htmlFor="bio">Bio</Label>
        <Textarea name="bio" placeholder="Hi! I'm the GOAT" required />
        <SubmitButton className="mt-5">Finish Onboarding</SubmitButton>
      </div>
    </form>
  );
}
