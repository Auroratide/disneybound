import Image from "next/image";
import type { OutfitColor } from "@/app/data/characters";
import { Card } from "@/components/ui/card";

export function Outfit({ name, imageSrc, imageAlt, cardColor, colors }: {
  name: string;
  imageSrc: string;
  imageAlt: string;
  cardColor: string;
  colors: OutfitColor[];
}) {
  // Three radial-gradient hard circles: left ear, right ear, head
  const mickeyBg = [
    `radial-gradient(circle at 24% 24%, ${cardColor} 19%, transparent 19%)`,
    `radial-gradient(circle at 76% 24%, ${cardColor} 19%, transparent 19%)`,
    `radial-gradient(circle at 50% 53%, ${cardColor} 40%, transparent 40%)`,
  ].join(", ");

  return (
    <Card className="mb-10 overflow-hidden py-0 gap-0 flex-col sm:flex-row">
      <div className="shrink-0 w-full h-56 sm:h-auto sm:w-56 flex items-center justify-center p-5">
        <div className="relative w-full h-full" style={{ background: mickeyBg }}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain object-top"
          />
        </div>
      </div>

      {/* Outfit info */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4">{name}</h2>
        <ul className="space-y-4">
          {colors.map((color) => (
            <li key={color.name} className="flex items-start gap-4">
              <span
                className="mt-1 block w-10 h-10 rounded-lg shrink-0 border border-foreground/10"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <p className="font-medium">{color.name}</p>
                <p className="text-sm text-muted-foreground">{color.usage}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
