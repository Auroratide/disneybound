import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/auth";
import { EditProfileForm } from "./EditProfileForm";

export default async function AccountPage() {
  const { user } = await getServerAuth();
  if (!user) redirect("/");

  return (
    <main className="max-w-lg mx-auto px-6 py-10 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      <EditProfileForm user={user} />
    </main>
  );
}
