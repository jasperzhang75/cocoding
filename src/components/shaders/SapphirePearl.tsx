import { Shader, MeshGradient } from 'shaders/react'

/* installed by `npx shaders install 4744455` (shaders.com, Jasper's "Sapphire
   Pearl", 2026-10-22). Local edit, as in HelloWorld: the root takes a
   className / style and the ready / unavailable callbacks — `npx shaders
   update` flags this file as edited; run it with --force and re-apply. */
export default function SapphirePearl({
  className,
  style,
  onReady,
  onUnavailable,
}: {
  className?: string;
  style?: React.CSSProperties;
  onReady?: () => void;
  onUnavailable?: () => void;
}) {
  return (
    <Shader className={className} style={style} onReady={onReady} onUnavailable={onUnavailable}>
      <MeshGradient
        colorSpace="oklch"
        count={3}
        smoothness={3.41}
        stops={[{ color: "#000045", position: 0 }, { color: "#4b82fa80", position: 0.6329 }, { color: "#dfdfeb", position: 1 }]}
        swirl={-0.11}
        variation={1} />
    </Shader>
  )
}
