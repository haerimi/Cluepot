import { profileLogin } from "@/app/actions/auth";
import ProfileClient from "./_components/ProfileClient";

export default async function ProfilePage() {
  const user = await profileLogin()
  return <ProfileClient user={user} />;
}