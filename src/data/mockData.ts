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

export const LOCATIONS: LocationInfo[] = [
  {
    id: 'loc-noord',
    name: 'Palestrinastraat 14',
    groups: ['De Vlindergroep', 'De Rupsengroep', 'Boventallig / Algemeen']
  },
  {
    id: 'loc-zuid',
    name: 'Brederostraat 1',
    groups: ['De Bijengroep', 'De Hommelgroep', 'Boventallig / Algemeen']
  },
  {
    id: 'loc-west',
    name: 'Kromstraat 111',
    groups: ['De Lieveheersbeestjes', 'De Kikkergroep', 'Boventallig / Algemeen']
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'user-mark',
    name: 'Mark',
    role: 'Beheerder',
    avatar: '👨‍💻',
    bio: 'Systeembeheerder & techniek.',
    locationId: 'loc-noord',
    groupId: 'Boventallig / Algemeen',
    points: 0,
    streakCount: 0,
    email: 'mark@kindercentrum-ark.nl',
    password: 'asdhjkl@3111AA'
  },
  {
    id: 'user-anouk',
    name: 'Anouk de Jong',
    role: 'Leidster',
    avatar: '👩‍🏫',
    bio: 'Fan van knutselen en zingen!',
    locationId: 'loc-noord',
    groupId: 'De Vlindergroep',
    points: 120,
    streakCount: 3,
    lastCompletedDate: new Date().toISOString(),
    email: 'anouk@ark.nl',
    password: 'ark123'
  },
  {
    id: 'user-sanne',
    name: 'Sanne Bakker',
    role: 'Leidster',
    avatar: '👩‍🦰',
    bio: 'Ik hou van buitenspelen.',
    locationId: 'loc-noord',
    groupId: 'De Rupsengroep',
    points: 85,
    streakCount: 1,
    lastCompletedDate: new Date().toISOString(),
    email: 'sanne@ark.nl',
    password: 'ark123'
  },
  {
    id: 'user-lotte',
    name: 'Lotte Visser',
    role: 'Leidster',
    avatar: '👱‍♀️',
    bio: 'Voorlezer kampioen!',
    locationId: 'loc-zuid',
    groupId: 'De Bijengroep',
    points: 150,
    streakCount: 5,
    lastCompletedDate: new Date().toISOString(),
    email: 'lotte@ark.nl',
    password: 'ark123'
  },
  {
    id: 'user-fatima',
    name: 'Fatima El Amin',
    role: 'Leidster',
    avatar: '👩🏽‍💼',
    bio: 'Creatieve duizendpoot.',
    locationId: 'loc-west',
    groupId: 'De Kikkergroep',
    points: 110,
    streakCount: 2,
    lastCompletedDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    email: 'fatima@ark.nl',
    password: 'ark123'
  },
  {
    id: 'user-merel',
    name: 'Merel Bos (Manager)',
    role: 'Manager',
    avatar: '👩🏻‍💼',
    bio: 'Altijd een luisterend oor.',
    locationId: 'loc-noord',
    groupId: 'Boventallig / Algemeen',
    points: 0,
    streakCount: 0,
    email: 'merel@ark.nl',
    password: 'ark123'
  }
];

export const INITIAL_TASKS: Task[] = [
  // Open tasks
  {
    id: 'task-1',
    title: 'Houten speelgoed desinfecteren',
    description: 'Het houten speelgoed in de bouwhoek moet met een sopje van biologisch afbreekbare reiniger worden afgenomen en gedroogd.',
    category: 'Cleaning',
    priority: 'Hoog',
    locationId: 'loc-noord',
    groupId: 'De Vlindergroep',
    status: 'Open',
    createdByUserId: 'user-mark',
    createdByName: 'Mark',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() // 3 hours ago
  },
  {
    id: 'task-2',
    title: 'Knutselkast sorteren & papier aanvullen',
    description: 'Karton, vliegerpapier en vingerverfflesjes netjes organiseren. Tekort aan rood en blauw papier noteren of aanvullen uit het magazijn.',
    category: 'Organizing',
    priority: 'Gemiddeld',
    locationId: 'loc-noord',
    groupId: 'Boventallig / Algemeen',
    status: 'Open',
    createdByUserId: 'user-anouk',
    createdByName: 'Anouk de Jong',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'task-3',
    title: 'Thema ‘Zomer’ knutselwerkjes voorbereiden',
    description: 'Kartonnen zonnen en visjes uitknippen voor de knutselactiviteit van aankomende maandag.',
    category: 'Activity',
    priority: 'Laag',
    locationId: 'loc-noord',
    groupId: 'De Rupsengroep',
    status: 'Open',
    createdByUserId: 'user-merel',
    createdByName: 'Merel Bos (Manager)',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'task-4',
    title: 'Dagrapportages & observaties invoeren in Kindy',
    description: 'Bijwerken van de wekelijkse observaties voor de kinderen die deze week zijn doorstroomd naar de peutergroep.',
    category: 'Admin',
    priority: 'Gemiddeld',
    locationId: 'loc-zuid',
    groupId: 'Boventallig / Algemeen',
    status: 'Open',
    createdByUserId: 'user-merel',
    createdByName: 'Merel Bos (Manager)',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'task-5',
    title: 'Buitenspeelgoedmand controleren op defecten',
    description: 'Zandbakspeelgoed, fietsjes en ballen controleren. Kapot plastic speelgoed weggooien wegens veiligheid en beheer tippen.',
    category: 'Cleaning',
    priority: 'Gemiddeld',
    locationId: 'loc-west',
    groupId: 'De Lieveheersbeestjes',
    status: 'Open',
    createdByUserId: 'user-fatima',
    createdByName: 'Fatima El Amin',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },

  // Claimed tasks
  {
    id: 'task-6',
    title: 'Voorleeshoek kussens wassen',
    description: 'De grote hoezen van de kussens ritsen en in de wasmachine stoppen op 40 graden. Droger starten indien klaar.',
    category: 'Cleaning',
    priority: 'Laag',
    locationId: 'loc-noord',
    groupId: 'Boventallig / Algemeen',
    status: 'Claimed',
    createdByUserId: 'user-merel',
    createdByName: 'Merel Bos (Manager)',
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    claimedByUserId: 'user-anouk',
    claimedByName: 'Anouk de Jong',
    claimedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },

  // Completed tasks today
  {
    id: 'task-7',
    title: 'Sensorische speelbakken verschonen',
    description: 'Het oude speelzand en rijst weggooien, de plastic bakken grondig reinigen en vullen met verse gedroogde kikkererwten en schepjes.',
    category: 'Activity',
    priority: 'Hoog',
    locationId: 'loc-noord',
    groupId: 'De Rupsengroep',
    status: 'Completed',
    createdByUserId: 'user-merel',
    createdByName: 'Merel Bos (Manager)',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    claimedByUserId: 'user-sanne',
    claimedByName: 'Sanne Bakker',
    claimedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    completedByUserId: 'user-sanne',
    completedByName: 'Sanne Bakker',
    completedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    cheerMessage: 'Geweldige inzet! De peuters houden van de nieuwe sensorische bakken! 🌟'
  },
  {
    id: 'task-8',
    title: 'Intake- en wenverslagen archiveren',
    description: 'De fysieke formulieren en verslagen alfabetisch opbergen in de groepsmappen van 2026.',
    category: 'Admin',
    priority: 'Laag',
    locationId: 'loc-zuid',
    groupId: 'De Hommelgroep',
    status: 'Completed',
    createdByUserId: 'user-merel',
    createdByName: 'Merel Bos (Manager)',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    claimedByUserId: 'user-lotte',
    claimedByName: 'Lotte Visser',
    claimedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    completedByUserId: 'user-lotte',
    completedByName: 'Lotte Visser',
    completedAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    cheerMessage: 'Super gedaan! Alles is weer keurig opgeborgen. 📁'
  }
];

export const CHEER_MESSAGES = [
  'Super gedaan! De kinderen zullen hier enorm van genieten! 🎈',
  'Geweldige inzet! Samen maken we de Ark elke dag mooier! 🌟',
  'Fantastisch werk! Een opgeruimde groep geeft rust en structuur! ✨',
  'Je bent een topper! Dankzij jou loopt alles gesmeerd! ❤️',
  'Heerlijk gewerkt! Teamwork makes the dream work! 🤝',
  'Superklus geklaard! Even een momentje voor jezelf verdiend! ☕'
];
