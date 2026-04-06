import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/app/data/characters";

type Props = {
  characters: Character[];
};

export function CharacterGrid({ characters }: Props) {
  if (characters.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 overflow-visible pb-4">
      {characters.map((character) => (
        <li key={character.slug}>
          <Link href={`/characters/${character.slug}`} className="block group">
            <div
              className="overflow-visible rounded-xl border-6 group-hover:shadow-lg group-hover:-translate-y-2 group-hover:scale-[1.03] group-focus-within:-translate-y-2 group-focus-within:scale-[1.03] transition-[translate,scale,box-shadow] duration-150"
              style={{
                borderColor: `color-mix(in oklch, ${character.cardColor} 80%, black)`,
                backgroundColor: character.cardColor,
              }}
            >
              <div
                className="relative h-44 rounded-t-xl overflow-visible"
                style={{ backgroundColor: character.cardColor }}
              >
                <div className="absolute -top-10 inset-x-0 bottom-0">
                  <Image
                    src={character.imageSrc}
                    alt={character.imageAlt}
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="p-4 bg-card rounded-b-xl text-center">
                <h3 className="text-lg font-semibold leading-tight">{character.name}</h3>
                {character.outfitName && <p className="text-sm text-muted-foreground mt-0.5">{character.outfitName}</p>}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
