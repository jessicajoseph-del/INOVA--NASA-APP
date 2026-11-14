import React from 'react';
import { MapLayoutGeometry } from '../utils/pathGeometry';
import { TaskNode } from '../types';

interface FiberOpticRoadProps {
  geometry: MapLayoutGeometry;
  tasks: TaskNode[];
  surgingSegment: number | null;
  reducedMotion: boolean;
}

export const FiberOpticRoad: React.FC<FiberOpticRoadProps> = ({
  geometry,
  tasks,
  surgingSegment,
  reducedMotion,
}) => {
  const { viewBoxWidth, viewBoxHeight, segments, fullPathD } = geometry;

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="absolute inset-0 h-full w-full pointer-events-none select-none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Light Gray Road Gradient for Uncompleted Path */}
        <linearGradient id="lightGrayRoad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#D1D5DB" />
        </linearGradient>

        {/* Luminous Blue, Light Blue, Green, White & Yellow Shooting Fiber Gradient */}
        <linearGradient id="shootingFiberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="25%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#4ADE80" />
          <stop offset="75%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>

        <linearGradient id="surgeBlastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="28%" stopColor="#FEF08A" />
          <stop offset="56%" stopColor="#4ADE80" />
          <stop offset="80%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        <filter id="oatSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="fiberStrongGlow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="7.5" result="blur1" />
          <feGaussianBlur stdDeviation="2.5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="photonBlaze" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Layer 1: Light Gray Base Road */}
      {fullPathD && (
        <g>
          {/* Outer subtle light-gray edge rim */}
          <path
            d={fullPathD}
            fill="none"
            stroke="rgba(203, 213, 225, 0.28)"
            strokeWidth={40}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Deep ink recessed border */}
          <path
            d={fullPathD}
            fill="none"
            stroke="#091B3F"
            strokeWidth={34}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Light Gray Core Roadbed */}
          <path
            d={fullPathD}
            fill="none"
            stroke="url(#lightGrayRoad)"
            strokeWidth={24}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.92}
          />
        </g>
      )}

      {/* Layer 2: Per-Segment States (Light Gray when Uncompleted vs Shooting Fiber when Completed) */}
      {segments.map((seg) => {
        const sourceTask = tasks[seg.index];
        const isCompletedSegment = sourceTask?.status === 'completed';
        const isFrontierSegment = sourceTask?.status === 'unlocked';
        const isSurging = surgingSegment === seg.index;

        return (
          <g key={`fiber-seg-${seg.index}`}>
            {/* Uncompleted segments: Crisp Light Gray Road with subtle center lane dashes */}
            {!isCompletedSegment && !isSurging && (
              <>
                <path
                  d={seg.d}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth={isFrontierSegment ? 4.5 : 3}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={isFrontierSegment ? '18 22' : '12 28'}
                  strokeLinecap="round"
                  className={isFrontierSegment ? 'animate-fiber-oat-flow' : ''}
                  opacity={isFrontierSegment ? 0.85 : 0.55}
                />
              </>
            )}

            {/* Completed segments: Bright Colored Shooting Fiber Current */}
            {(isCompletedSegment || isSurging) && (
              <>
                {/* Dark optical channel inset over oat road so vivid colors blaze sharply */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke="#071636"
                  strokeWidth={20}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  opacity={0.86}
                />

                {/* Wide multi-colored plasma glow */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke={isSurging ? 'url(#surgeBlastGrad)' : 'url(#shootingFiberGrad)'}
                  strokeWidth={isSurging ? 26 : 18}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  opacity={isSurging ? 0.92 : 0.68}
                  filter="url(#fiberStrongGlow)"
                />

                {/* Core multi-color fiber waveguide */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke="url(#shootingFiberGrad)"
                  strokeWidth={6}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  opacity={0.98}
                />

                {/* High-speed shooting luminous blue laser dashes */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth={4.6}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="36 26"
                  strokeLinecap="round"
                  className="animate-fiber-turbo"
                  opacity={0.98}
                />

                {/* High-speed shooting luminous light blue streaks */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke="#7DD3FC"
                  strokeWidth={3.8}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="24 38"
                  strokeLinecap="round"
                  className="animate-fiber-fast"
                  opacity={0.96}
                />

                {/* High-speed shooting luminous yellow pulses */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke="#FDE047"
                  strokeWidth={3.4}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="22 46"
                  strokeLinecap="round"
                  className="animate-fiber-gold-fast"
                  opacity={0.96}
                />

                {/* High-speed shooting luminous green pulses */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth={3.4}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="20 48"
                  strokeLinecap="round"
                  className="animate-fiber-fast"
                  opacity={0.95}
                />

                {/* High-speed shooting luminous white core bolts */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={2.6}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="28 50"
                  strokeLinecap="round"
                  className="animate-fiber-turbo"
                  opacity={0.98}
                />

                {/* Rapid luminous shooting photon comets (blue, light blue, green, white, yellow) */}
                {!reducedMotion && (
                  <>
                    <circle r={isSurging ? 7.5 : 5.5} fill="#3B82F6" filter="url(#photonBlaze)">
                      <animateMotion
                        dur={isSurging ? '0.38s' : '0.78s'}
                        repeatCount="indefinite"
                        path={seg.d}
                      />
                    </circle>
                    <circle r={5.2} fill="#FDE047" filter="url(#photonBlaze)">
                      <animateMotion
                        dur={isSurging ? '0.38s' : '0.78s'}
                        begin="-0.39s"
                        repeatCount="indefinite"
                        path={seg.d}
                      />
                    </circle>
                    <circle r={4.8} fill="#7DD3FC" filter="url(#photonBlaze)">
                      <animateMotion
                        dur="0.96s"
                        begin="-0.18s"
                        repeatCount="indefinite"
                        path={seg.d}
                      />
                    </circle>
                    <circle r={4.8} fill="#4ADE80" filter="url(#photonBlaze)">
                      <animateMotion
                        dur="0.88s"
                        begin="-0.52s"
                        repeatCount="indefinite"
                        path={seg.d}
                      />
                    </circle>
                    <circle r={4.4} fill="#FFFFFF" filter="url(#photonBlaze)">
                      <animateMotion
                        dur="0.96s"
                        begin="-0.72s"
                        repeatCount="indefinite"
                        path={seg.d}
                      />
                    </circle>
                  </>
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
};
