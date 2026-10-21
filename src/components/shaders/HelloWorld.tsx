import {
  Shader,
  CursorRipples,
  Glass,
  MeshGradient,
  Text,
} from 'shaders/react'

/* installed by `npx shaders install 4744333` (shaders.com, Jasper's "hello
   world", 2026-10-21). Local edit: the root takes a className / style and
   the ready / unavailable callbacks, so a page can size the canvas and
   keep a stand-in under it — `npx shaders update` will flag this file as
   edited; re-apply the four props after an update. */
export default function HelloWorld({
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
    <Shader toneMapping="aces" className={className} style={style} onReady={onReady} onUnavailable={onUnavailable}>
      <MeshGradient
        count={6}
        drift={1}
        seed={36}
        smoothness={4.83}
        speed={8.6}
        stops={[{ color: "#0f121f", position: 0.1517 }, { color: "#080880", position: 0.5488 }, { color: "#007fff", position: 1 }]}
        swirl={0.31}
        variation={0.42} />
      <Text
        center={{
          x: 0.5,
          y: 0.81
        }}
        fontFamily="Geist"
        fontSize={0.26}
        fontWeight={500}
        letterSpacing={-0.045}
        text="hello world"
        visible={false} />
      <CursorRipples
        visible={false} />
      <Glass
        aberration={0.25}
        center={{
          x: 0.5,
          y: 0.45
        }}
        highlight={0.6}
        highlightColor="#7b0fff"
        highlightSoftness={0.63}
        lightAngle={223}
        refraction={1.5}
        scale={1.3561}
        shape={{
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          type: "metaballs3D",
          balls: 4,
          blend: 0.12,
          speed: 1,
          spread: 0.2,
          ballRadius: 0.16
        }}
        shapeType="metaballs3D"
        visible={false} />
    </Shader>
  )
}
