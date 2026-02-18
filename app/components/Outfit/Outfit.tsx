import Image from "next/image";
import type { OutfitColor } from "@/app/data/characters";
import { Card, CardContent } from "@/components/ui/card";

export function Outfit({ name, imageSrc, imageAlt, colors }: {
  name: string;
  imageSrc: string;
  imageAlt: string;
  colors: OutfitColor[];
}) {
  return (
    <Card className="mb-10">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">{name}</h2>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={256}
          height={256}
          className="rounded-xl mb-6"
        />
        <ul className="space-y-4">
          {colors.map((color) => (
            <li key={color.name} className="flex items-start gap-4">
              <span
                className="mt-1 block w-12 h-12 rounded-lg shrink-0 border border-foreground/10"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <p className="font-medium">{color.name}</p>
                <p className="text-sm text-muted-foreground">{color.usage}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
