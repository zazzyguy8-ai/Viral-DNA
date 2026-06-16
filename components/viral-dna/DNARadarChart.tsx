"use client";

interface Props {
  growth: number;
  consistency: number;
  branding: number;
  audienceClarity: number;
  overall: number;
}

export function DNARadarChart({ growth, consistency, branding, audienceClarity, overall }: Props) {
  const size = 220;
  const center = size / 2;
  const maxRadius = 80;

  const axes = [
    { label: "Growth", value: growth },
    { label: "Consistency", value: consistency },
    { label: "Branding", value: branding },
    { label: "Audience", value: audienceClarity },
    { label: "Overall", value: overall },
  ];

  function getPoint(index: number, radius: number) {
    const angle = (index * 2 * Math.PI) / axes.length - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = axes.map((a, i) => getPoint(i, (a.value / 100) * maxRadius));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {gridLevels.map((level) => {
          const points = axes.map((_, i) => getPoint(i, maxRadius * level));
          const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return (
            <path key={level} d={path} fill="none" stroke="#1e1e28" strokeWidth={1} />
          );
        })}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const outer = getPoint(i, maxRadius);
          return (
            <line
              key={i}
              x1={center} y1={center}
              x2={outer.x} y2={outer.y}
              stroke="#1e1e28" strokeWidth={1}
            />
          );
        })}

        {/* Data fill */}
        <path d={dataPath} fill="#7c5cfc" fillOpacity={0.15} stroke="#7c5cfc" strokeWidth={2} strokeLinejoin="round" />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#7c5cfc" />
        ))}

        {/* Labels */}
        {axes.map((axis, i) => {
          const labelPos = getPoint(i, maxRadius + 22);
          return (
            <text
              key={i}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fill="#888"
              fontFamily="inherit"
            >
              {axis.label}
            </text>
          );
        })}

        {/* Score dots on axes */}
        {axes.map((axis, i) => {
          const scorePos = getPoint(i, maxRadius + 10);
          return (
            <text
              key={`score-${i}`}
              x={scorePos.x}
              y={scorePos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fill="#7c5cfc"
              fontFamily="inherit"
              fontWeight="bold"
            >
              {axis.value}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
