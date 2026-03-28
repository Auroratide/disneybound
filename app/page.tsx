import { getAllCharacters } from "@/app/data/characters";
import { HomeView } from "@/app/components/HomeView/HomeView";

export default function Home() {
  const characters = getAllCharacters();
  return <HomeView characters={characters} />;
}
