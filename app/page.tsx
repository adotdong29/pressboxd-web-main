import Image from "next/image";
import PressboxdLogo from "@/assets/pressboxd.png";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Index() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col gap-6 px-4 items-center">
        <Image src={PressboxdLogo} alt="Pressboxd Logo" width={200} />
        <h1 className="text-4xl">
          Introducing <span className="font-extrabold">Pressboxd</span>
        </h1>
        <p className="text-lg text-foreground/60">
          Share your thoughts with every game
        </p>
        <div className="flex gap-2">
          <Button asChild size="lg" variant={"outline"}>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant={"default"}>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
