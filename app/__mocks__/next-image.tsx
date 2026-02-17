export default function Image({ alt }: { alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} />;
}
