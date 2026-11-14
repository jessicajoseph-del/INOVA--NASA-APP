import { NodePosition, PathSegment } from '../types';

export const VIEWBOX_WIDTH = 900;
const TOP_MARGIN = 135;
const BOTTOM_MARGIN = 135;
const STEP_VERTICAL = 195;

export interface MapLayoutGeometry {
  viewBoxWidth: number;
  viewBoxHeight: number;
  taskPositions: NodePosition[];
  milestonePosition: NodePosition;
  segments: PathSegment[];
  fullPathD: string;
}

/**
 * Generates a gentle, smooth top-to-bottom winding path with soft curves
 * and no tight hairpin loops, starting at Stage 1 and flowing down to the Trophy Vault.
 */
export function buildMapGeometry(taskCount: number): MapLayoutGeometry {
  const safeCount = Math.max(1, taskCount);
  const totalSteps = safeCount;
  const viewBoxHeight = TOP_MARGIN + BOTTOM_MARGIN + totalSteps * STEP_VERTICAL;

  const taskPositions: NodePosition[] = [];

  for (let i = 0; i < safeCount; i++) {
    const y = TOP_MARGIN + i * STEP_VERTICAL;
    const isRight = i % 2 === 0;

    taskPositions.push({
      x: isRight ? 565 : 335,
      y,
      tangentIn: { dx: 0, dy: 92 },
      tangentOut: { dx: 0, dy: 92 },
      side: isRight ? 'right' : 'left',
    });
  }

  const milestoneY = viewBoxHeight - BOTTOM_MARGIN;

  const milestonePosition: NodePosition = {
    x: 450,
    y: milestoneY,
    tangentIn: { dx: 0, dy: 92 },
    tangentOut: { dx: 0, dy: 0 },
    side: 'summit',
  };

  const allNodes = [...taskPositions, milestonePosition];
  const segments: PathSegment[] = [];

  for (let i = 0; i < allNodes.length - 1; i++) {
    const from = allNodes[i];
    const to = allNodes[i + 1];

    const cp1x = from.x + from.tangentOut.dx;
    const cp1y = from.y + from.tangentOut.dy;
    const cp2x = to.x - to.tangentIn.dx;
    const cp2y = to.y - to.tangentIn.dy;

    const d = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
    segments.push({
      index: i,
      d,
      from,
      to,
    });
  }

  const fullPathD = segments
    .map((seg, idx) => {
      if (idx === 0) return seg.d;
      return seg.d.replace(/^M\s+[\d.-]+\s+[\d.-]+\s+/, '');
    })
    .join(' ');

  return {
    viewBoxWidth: VIEWBOX_WIDTH,
    viewBoxHeight,
    taskPositions,
    milestonePosition,
    segments,
    fullPathD,
  };
}
