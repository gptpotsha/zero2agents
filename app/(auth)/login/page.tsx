import { AuthForm } from "@/components/auth/auth-form";
import { AuthValuePanel } from "@/components/auth/value-panel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Вход" };

export default function LoginPage() {
  return (
    <div className="flex h-full bg-background">
      <AuthValuePanel variant="login" />
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-7 pb-8 pt-4 sm:px-10 lg:items-center lg:py-8">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
