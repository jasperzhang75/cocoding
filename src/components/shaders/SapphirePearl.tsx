import { Shader, MeshGradient } from 'shaders/react'

/* installed by `npx shaders install 4744455` (shaders.com, Jasper's "Sapphire
   Pearl", 2026-10-22, re-pulled as he tunes it). Local edit, as in
   HelloWorld: the root takes a className / style and the ready /
   unavailable callbacks — `npx shaders update` flags this file as edited;
   run it with --force and re-apply. */
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
        colorSpace="linear"
        count={3}
        seed={26}
        smoothness={3.41}
        speed={1.9}
        stops={[{ color: "#000036", position: 0 }, { color: "#204aa180", position: 0.6329 }, { color: "#00006e", position: 1 }]}
        swirl={-0.11}
        variation={1} />
    </Shader>
  )
}
