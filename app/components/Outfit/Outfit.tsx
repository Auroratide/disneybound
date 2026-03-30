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
                  style={{ backgroundColor: color.hex }}
                />
                <p className="font-medium text-center">{color.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Mickey: above on mobile (col-reverse puts this on top), right on desktop */}
      <div className="shrink-0 relative w-72 h-65 -mb-16 sm:mb-0 sm:w-96 sm:h-80 sm:-ml-32 z-10 rotate-15">
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
          className="object-contain -rotate-15 drop-shadow-lg scale-120"
        />
      </div>
    </div>
  );
}
