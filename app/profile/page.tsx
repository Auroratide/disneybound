import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/auth";
import { PageContainer } from "@/app/components/PageContainer/PageContainer";
import { ImgZoomRegistrar } from "@/app/components/ImgZoomRegistrar/ImgZoomRegistrar";
import { EditProfileForm } from "./EditProfileForm";
import { MyOutfitsGrid } from "./MyOutfitsGrid";
import { getUserOutfits } from "@/app/data/user-outfits";

export default async function AccountPage() {
  const { user: authUser, pb } = await getServerAuth();
  if (!authUser) redirect("/");

  const avatarUrl = authUser.avatar ? pb.files.getURL(authUser, authUser.avatar) : null;

  let outfits = [];
  try {
    outfits = await getUserOutfits(pb, authUser.id);
  } catch {
    // PocketBase may be unavailable — show empty grid rather than error.
  }

  return (
    <main>
      <ImgZoomRegistrar />
      <PageContainer className="py-10 flex flex-col gap-6">
        <section className="bg-white rounded-xl border border-primary/20 p-6">
          <EditProfileForm user={authUser} avatarUrl={avatarUrl} />
        </section>
        <MyOutfitsGrid outfits={outfits} />
      </PageContainer>
    </main>
  );
}
