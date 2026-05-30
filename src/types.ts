/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectStatus = 'On Track' | 'At Risk' | 'Planning';
export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  priority: TaskPriority;
  dueDate: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  deadline: string;
  description: string;
  progress: number;
  tasks: Task[];
  team: TeamMember[];
  risks: string[];
}

export interface Automation {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'assignment' | 'report' | 'alert' | 'system';
}

export interface User {
  email: string;
  workspaceName?: string;
}

export type SessionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'ARCHIVED';
export type TriageLabel = 'BUG' | 'FEATURE' | 'QUESTION';

export interface AgentIssueSession {
  id: string;
  title: string;
  project: string;
  triageLabel: TriageLabel;
  status: SessionStatus;
  createdAt: string;
  timeAgo: string;
  severity: 'low' | 'medium' | 'high';
  logs?: string[];
}
