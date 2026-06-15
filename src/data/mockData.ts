/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocationInfo, User, Task, CategoryInfo } from '../types';

export const CATEGORIES: Record<string, CategoryInfo> = {
  Cleaning: {
    type: 'Cleaning',
    label: 'Schoonmaken',
    iconName: 'Sparkles',
    color: 'text-brand-olive border-brand-border bg-brand-sage-lighter',
    bgLight: 'bg-brand-sage-light text-brand-olive'
  },
  Organizing: {
    type: 'Organizing',
    label: 'Ordenen & Reorganiseren',
    iconName: 'FolderClosed',
    color: 'text-brand-gray border-brand-border bg-brand-bg',
    bgLight: 'bg-white text-brand-gray'
  },
  Admin: {
    type: 'Admin',
    label: 'Administratie',
    iconName: 'ClipboardList',
    color: 'text-brand-gray-dark border-brand-border bg-white',
    bgLight: 'bg-brand-border text-brand-gray-dark'
  },
  Activity: {
    type: 'Activity',
    label: 'Activiteit Voorbereiden',
    iconName: 'Compass',
    color: 'text-brand-gray border-brand-border bg-brand-peach-light',
    bgLight: 'bg-brand-peach/20 text-brand-gray-dark'
  },
  Communication: {
    type: 'Communication',
    label: 'Communicatie',
    iconName: 'MessageCircle',
    color: 'text-brand-gray-dark border-brand-border bg-blue-50',
    bgLight: 'bg-blue-100 text-brand-gray-dark'
  }
};

export const LOCATIONS: LocationInfo[] = [];

export const MOCK_USERS: User[] = [
  {
    id: 'user-mark',
    name: 'Mark',
    role: 'Beheerder',
    avatar: '👨‍💻',
    bio: 'Systeembeheerder & techniek.',
    locationId: '',
    groupId: '',
    points: 0,
    streakCount: 0,
    email: 'mark@kindercentrum-ark.nl',
    password: 'asdhjkl@3111AA'
  }
];

export const INITIAL_TASKS: Task[] = [];

export const CHEER_MESSAGES = [
  'Super gedaan! De kinderen zullen hier enorm van genieten! 🎈',
  'Geweldige inzet! Samen maken we de Ark elke dag mooier! 🌟',
  'Fantastisch werk! Een opgeruimde groep geeft rust en structuur! ✨',
  'Je bent een topper! Dankzij jou loopt alles gesmeerd! ❤️',
  'Heerlijk gewerkt! Teamwork makes the dream work! 🤝',
  'Superklus geklaard! Even een momentje voor jezelf verdiend! ☕'
];
