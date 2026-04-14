import { getAllCharacters } from "@/app/data/characters";
import { HomeView } from "@/app/components/HomeView/HomeView";

export const revalidate = 3600;

export default async function Home() {
  const characters = await getAllCharacters();
  return <HomeView characters={characters} />;
}
