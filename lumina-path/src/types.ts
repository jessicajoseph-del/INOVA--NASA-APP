export type TaskStatus = 'locked' | 'unlocked' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskNode {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  stars: number; // 0 to 3
  subtasks: Subtask[];
  completedAt?: string;
}

export interface NodePosition {
  x: number;
  y: number;
  tangentIn: { dx: number; dy: number };
  tangentOut: { dx: number; dy: number };
  side: 'left' | 'right' | 'summit';
}

export interface PathSegment {
  index: number; // connects node[index] -> node[index+1]
  d: string;
  from: NodePosition;
  to: NodePosition;
}
