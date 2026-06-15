/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Leidster' | 'Manager' | 'Beheerder';

export type CategoryType = string;

export interface CategoryInfo {
  type: CategoryType;
  label: string;
  iconName: string;
  color: string; // Tailwind class
  bgLight: string; // Tailwind class
}

export type PriorityType = 'Laag' | 'Gemiddeld' | 'Hoog';

export interface LocationInfo {
  id: string;
  name: string; // Locatie naam, e.g., "De Ark Centrum"
  groups: string[]; // Groepen op deze locatie, e.g., ["De Vlindergroep", "De Rupsengroep"]
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string; // Emoji or visual representation
  bio?: string;
  locationId: string; // Scheduled location today
  groupId: string; // Scheduled group today
  points: number; // Gamified personal points
  streakCount?: number;
  lastCompletedDate?: string;
  hearts?: number; // Leaderboard hearts sent by others
  email?: string; // Account email
  password?: string; // Account password
  staffNames?: string; // Optionele individuele namen van leidsters binnen dit (groeps)account
  staffPoints?: Record<string, number>; // Optionele individuele punten per leidster binnen dit groepsaccount
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  priority: PriorityType;
  locationId: string; // De locatie waar deze taak betrekking op heeft
  groupId?: string; // Optionele specifieke groep voor deze taak
  status: 'Open' | 'Claimed' | 'Completed';
  
  // Created audit
  createdByUserId: string;
  createdByName: string;
  createdAt: string;

  // Claim audit
  claimedByUserId?: string;
  claimedByName?: string;
  claimedAt?: string;

  // Completion audit
  completedByUserId?: string;
  completedByName?: string;
  completedAt?: string;
  cheerMessage?: string; // E.g., "Fantastisch gedaan!"
  
  // Google Tasks integration
  googleTaskId?: string;

  // Track file and photo attachments
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // base64 encoded data url
  type: 'image' | 'file';
  createdAt: string;
}

export interface TeamGoal {
  target: number;
  completedToday: number;
}
