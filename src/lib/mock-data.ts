
import { Rapper, Battle, Punchline, SearchResult } from './types';

export const MOCK_RAPPERS: Rapper[] = [
  { id: '1', name: 'Rum Nitty', avatarUrl: 'https://picsum.photos/seed/nitty/200/200' },
  { id: '2', name: 'Geechi Gotti', avatarUrl: 'https://picsum.photos/seed/geechi/200/200' },
  { id: '3', name: 'Loaded Lux', avatarUrl: 'https://picsum.photos/seed/lux/200/200' },
  { id: '4', name: 'Hollow Da Don', avatarUrl: 'https://picsum.photos/seed/hollow/200/200' },
  { id: '5', name: 'Iron Solomon', avatarUrl: 'https://picsum.photos/seed/iron/200/200' },
];

export const MOCK_BATTLES: Battle[] = [
  { 
    id: 'b1', 
    title: 'Rum Nitty vs Iron Solomon', 
    league: 'URLTV', 
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    thumbnailUrl: 'https://picsum.photos/seed/battle1/400/225' 
  },
  { 
    id: 'b2', 
    title: 'Geechi Gotti vs Loaded Lux', 
    league: 'Caffeine', 
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    thumbnailUrl: 'https://picsum.photos/seed/battle2/400/225' 
  },
];

export const MOCK_RESULTS: SearchResult[] = [
  {
    id: 'p1',
    battleId: 'b1',
    rapperId: '1',
    line: "I'm a different animal, the way I box Solomon is like a gorilla in a different ring!",
    context: [
      "You think you're smart with the bars and the metaphors?",
      "I'm a different animal, the way I box Solomon is like a gorilla in a different ring!",
      "That's a cage match for those who don't get the zoo scheme."
    ],
    timestamp: 345,
    score: 0.98,
    rapper: MOCK_RAPPERS[0],
    battle: MOCK_BATTLES[0]
  },
  {
    id: 'p2',
    battleId: 'b2',
    rapperId: '2',
    line: "I don't need a luxury car to show you I'm Loaded!",
    context: [
      "Every time I come around, you talking about your status.",
      "I don't need a luxury car to show you I'm Loaded!",
      "I'm from the block where the real legends get molded."
    ],
    timestamp: 122,
    score: 0.85,
    rapper: MOCK_RAPPERS[1],
    battle: MOCK_BATTLES[1]
  }
];
