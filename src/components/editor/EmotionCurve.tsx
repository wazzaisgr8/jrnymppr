import { useState, useRef, useCallback } from 'react';
import { useMap } from '../../contexts/MapContext';
import { Phase, EmotionPoint } from '../../lib/types';

interface Props {
  phases: Phase[];
  emotionPoints: EmotionPoint[];
  phaseWidth: number;
  laneWidth: number;
}

const LANE_HEIGHT = 110;
const HANDLE_R = 8;
const PADDING_TOP = 18;
const PADDING_BOTTOM = 18;
const CURVE_HEIGHT = LANE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const SENTIMENT_LABELS = [
  'Very Positive', 'Positive', 'Slightly Positive', 'Neutral',
  'Slightly Negative', 'Negative', 'Very Negative',
];

function valueToY(value: number): number {
  return PADDING_TOP + (1 - value) * CURVE_HEIGHT;
}

function getColor(value: number): string {
  if (value >= 0.6) return '#3CBFB0';
  if (value >= 0.4) return '#F5A623';
  return '#E04C4C';
}

function getSentimentLabel(value: number): string {
  const idx = Math.min(Math.floor((1 - value) * 7), 6);
  return SENTIMENT_LABELS[idx];
}

function getEmoji(value: number): string {
  if (value >= 0.82) return '😄';
  if (value >= 0.62) return '🙂';
  if (value >= 0.42) return '😐';
  if (value >= 0.22) return '😟';
  return '😠';
}

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d.push(`C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`);
  }
  return d.join(' ');
}

export default function EmotionCurve({ phases, emotionPoints, phaseWidth }: Props) {
  const { setEmotionValue } = useMap();
  const [dragging, setDragging] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ phaseId: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const totalWidth = phases.length * phaseWidth;

  const getPointsForSVG = () => {
    return phases.map((phase, i) => {
      const ep = emotionPoints.find(e => e.phase_id === phase.id);
      const value = ep?.value ?? 0.5;
      return {
        phaseId: phase.id,
        x: i * phaseWidth + phaseWidth / 2,
        y: valueToY(value),
        value,
      };
    });
  };

  const points = getPointsForSVG();
  const pathD = buildPath(points);

  const neutralY = valueToY(0.5);

  const areaPath = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x} ${neutralY} L ${points[0].x} ${neutralY} Z`
    : '';

  const handleMouseDown = useCallback((phaseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(phaseId);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const value = Math.max(0, Math.min(1, 1 - (y - PADDING_TOP) / CURVE_HEIGHT));
    setEmotionValue(dragging, value);
  }, [dragging, setEmotionValue]);

  const stopDrag = useCallback(() => setDragging(null), []);

  return (
    <div
      className="relative bg-white"
      style={{
        height: LANE_HEIGHT,
        width: totalWidth,
        background: 'linear-gradient(to bottom, rgba(60,191,176,0.04) 0%, rgba(255,255,255,0) 50%, rgba(224,76,76,0.04) 100%)',
      }}
    >
      <svg
        ref={svgRef}
        width={totalWidth}
        height={LANE_HEIGHT}
        className="absolute inset-0 cursor-ns-resize select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <defs>
          <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            {points.map((pt, i) => (
              <stop
                key={i}
                offset={`${(i / Math.max(points.length - 1, 1)) * 100}%`}
                stopColor={getColor(pt.value)}
              />
            ))}
          </linearGradient>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            {points.map((pt, i) => (
              <stop
                key={i}
                offset={`${(i / Math.max(points.length - 1, 1)) * 100}%`}
                stopColor={getColor(pt.value)}
                stopOpacity={0.12}
              />
            ))}
          </linearGradient>
        </defs>

        <line
          x1={0} y1={neutralY} x2={totalWidth} y2={neutralY}
          stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4,4"
        />

        {areaPath && (
          <path d={areaPath} fill="url(#areaGrad)" />
        )}

        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="url(#curveGrad)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map(pt => {
          const isActive = dragging === pt.phaseId;
          const emojiSize = isActive ? 22 : 18;
          return (
            <g
              key={pt.phaseId}
              className="cursor-ns-resize"
              onMouseDown={e => handleMouseDown(pt.phaseId, e)}
              onMouseEnter={() => setTooltip({ phaseId: pt.phaseId, x: pt.x, y: pt.y })}
              onMouseLeave={() => setTooltip(null)}
            >
              <circle
                cx={pt.x} cy={pt.y}
                r={isActive ? HANDLE_R + 5 : HANDLE_R + 2}
                fill="white"
                stroke={getColor(pt.value)}
                strokeWidth={isActive ? 2.5 : 1.5}
                opacity={0.9}
              />
              <text
                x={pt.x}
                y={pt.y + emojiSize * 0.36}
                textAnchor="middle"
                fontSize={emojiSize}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {getEmoji(pt.value)}
              </text>
            </g>
          );
        })}

        {tooltip && points.map(pt => pt.phaseId === tooltip.phaseId ? (
          <g key="tooltip">
            <rect
              x={pt.x - 60} y={pt.y - 28}
              width={120} height={20}
              rx={4}
              fill="#2C2C2C" opacity={0.85}
            />
            <text
              x={pt.x} y={pt.y - 14}
              textAnchor="middle"
              fill="white"
              fontSize={10}
              fontFamily="Inter, sans-serif"
            >
              {getSentimentLabel(pt.value)}
            </text>
          </g>
        ) : null)}
      </svg>
    </div>
  );
}
