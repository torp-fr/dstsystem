// Avatar collection for operators
export const AVATAR_COLLECTIONS = {
  badass: [
    { id: 'badass-1', name: 'Badass Pilot', emoji: '🕵️', url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=badass-1&style=flat&mood=tough' },
    { id: 'badass-2', name: 'Badass Agent', emoji: '🕶️', url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=badass-2&style=flat&mood=tough' },
    { id: 'badass-3', name: 'Badass Officer', emoji: '👮', url: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=badass-3&style=flat&mood=tough' },
  ],
  realistic: [
    { id: 'realistic-1', name: 'Professional M', emoji: '👨‍💼', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=realistic-1' },
    { id: 'realistic-2', name: 'Professional F', emoji: '👩‍💼', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=realistic-2' },
    { id: 'realistic-3', name: 'Business M', emoji: '🧑‍💻', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=realistic-3' },
    { id: 'realistic-4', name: 'Expert', emoji: '👨‍🏫', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=realistic-4' },
  ],
  characters: [
    { id: 'char-1', name: 'Archer', emoji: '🏹', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=char-1' },
    { id: 'char-2', name: 'Knight', emoji: '⚔️', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=char-2' },
    { id: 'char-3', name: 'Warrior', emoji: '🗡️', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=char-3' },
    { id: 'char-4', name: 'Ranger', emoji: '🎯', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=char-4' },
    { id: 'char-5', name: 'Scout', emoji: '🔭', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=char-5' },
    { id: 'char-6', name: 'Tactician', emoji: '🎲', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=char-6' },
  ],
};

export const ALL_AVATARS = [
  ...AVATAR_COLLECTIONS.badass,
  ...AVATAR_COLLECTIONS.realistic,
  ...AVATAR_COLLECTIONS.characters,
];

export const getAvatarById = (id: string) => ALL_AVATARS.find(a => a.id === id);
export const getAvatarsByCollection = (collection: keyof typeof AVATAR_COLLECTIONS) => AVATAR_COLLECTIONS[collection];
