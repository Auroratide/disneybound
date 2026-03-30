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
  return (
    <div className="flex items-center mb-12">
      {/* Card: only the left section */}
      <Card className="flex-1 py-0 gap-0">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b-2 border-primary">{name}</h2>
          <ul className="flex flex-wrap gap-4">
            {colors.map((color) => (
              <li key={color.name} className="flex flex-col items-center gap-2">
                <span
                  className="block w-20 h-20 rounded-lg border border-foreground/10 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-sm font-medium text-center">{color.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Mickey silhouette + character, flowing off the right edge of the card */}
      <div className="shrink-0 relative w-80 h-72 -ml-24 z-10 rotate-15">
        <svg
          viewBox="0 0 99.692093 82.088516"
          className="absolute inset-0 w-full h-full scale-90"
          style={{ fill: cardColor, stroke: `color-mix(in oklch, ${cardColor} 60%, black)` }}
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <g transform="translate(-55.153749,-96.486627)">
            <path d="m 76.536414,98.230697 a 19.638433,19.638433 0 0 0 -19.638595,19.638593 19.638433,19.638433 0 0 0 19.638595,19.6386 19.638433,19.638433 0 0 0 2.468583,-0.17674 28.33106,28.33106 0 0 0 -2.336292,11.16883 28.33106,28.33106 0 0 0 28.331085,28.33109 28.33106,28.33106 0 0 0 28.33109,-28.33109 28.33106,28.33106 0 0 0 -2.30012,-11.16573 19.638433,19.638433 0 0 0 2.43241,0.17364 19.638433,19.638433 0 0 0 19.6386,-19.63808 19.638433,19.638433 0 0 0 -19.6386,-19.638597 19.638433,19.638433 0 0 0 -19.63859,19.638597 19.638433,19.638433 0 0 0 0.43201,3.86023 28.33106,28.33106 0 0 0 -9.2568,-1.56115 28.33106,28.33106 0 0 0 -9.271266,1.62884 19.638433,19.638433 0 0 0 0.446484,-3.92844 19.638433,19.638433 0 0 0 -19.638594,-19.638593 z" />
          </g>
        </svg>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-contain -rotate-15 drop-shadow-lg scale-110"
        />
      </div>
    </div>
  );
}
