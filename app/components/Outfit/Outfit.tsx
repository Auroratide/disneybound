import Image from "next/image";
import type { OutfitColor } from "@/app/data/characters";
import { Card } from "@/components/ui/card";
import * as Icon from "@/app/components/Icon/Icon";

export function Outfit({ name, imageSrc, imageAlt, cardColor, colors }: {
  name: string;
  imageSrc: string;
  imageAlt: string;
  cardColor: string;
  colors: OutfitColor[];
}) {
  return (
    <div className="flex flex-col-reverse items-center mb-12 sm:flex-row sm:items-center">
      {/* Card: full width on mobile, flex-1 on desktop */}
      <Card className="w-full sm:flex-1 py-0 gap-0">
        <div className="p-8 pt-20 sm:pt-8">
          <h2 className="text-2xl font-semibold mb-8 pb-3 border-b-2 border-primary text-center sm:text-left">{name}</h2>
          <ul className="flex flex-nowrap justify-center gap-4 sm:flex-wrap sm:justify-start sm:gap-6">
            {colors.map((color) => (
              <li key={color.name} className="flex flex-col items-center gap-2 flex-1 min-w-0 sm:flex-none">
                <span
                  className="block w-full aspect-square sm:w-28 sm:h-28 sm:aspect-auto rounded-xl border border-foreground/10 shadow-sm"
                  style={{ backgroundColor: `oklch(${color.oklch.l} ${color.oklch.c} ${color.oklch.h})` }}
                />
                <p className="font-medium text-center">{color.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Mickey: above on mobile (col-reverse puts this on top), right on desktop */}
      <div className="shrink-0 relative w-72 h-65 -mb-16 sm:mb-0 sm:w-96 sm:h-80 sm:-ml-32 z-10 rotate-15">
        <Icon.MickeyMouse color={cardColor} className="absolute inset-0 w-full h-full scale-90" />
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-contain -rotate-15 drop-shadow-lg scale-120"
        />
      </div>
    </div>
  );
}
