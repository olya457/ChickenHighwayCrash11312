import { ImageSourcePropType } from 'react-native';
export type ChickenId = 'classic' | 'highway' | 'racer' | 'cowboy' | 'boss';
export type HighwayId = 'classic' | 'city' | 'night' | 'desert' | 'mountain';
export type BoostId = 'shield' | 'slow' | 'rush';
export type ChallengeId = 'long' | 'hero' | 'moving' | 'perfect' | 'master';
export type Skin<T extends string> = {
  id: T;
  name: string;
  description: string;
  image: ImageSourcePropType;
  price?: number;
  unlock?: string;
};
export const art = {
  background: require('../assets/background-highway-canyon.png'),
  logo: require('../assets/chicken-highway-logo.png'),
  onboarding: [
    require('../assets/onboarding-meet-chicken.png'),
    require('../assets/onboarding-traffic.png'),
    require('../assets/onboarding-earn-customize.png'),
  ],
};
export const chickens: Skin<ChickenId>[] = [
  {
    id: 'classic',
    name: 'Classic Chicken',
    description: 'The original. No frills, just guts.',
    image: require('../assets/chicken-classic.png'),
    price: 0,
  },
  {
    id: 'highway',
    name: 'Highway Chicken',
    description: 'Safety first. Courage always.',
    image: require('../assets/chicken-highway.png'),
    price: 500,
  },
  {
    id: 'racer',
    name: 'Racer Chicken',
    description: 'Born to cross. Built for speed.',
    image: require('../assets/chicken-racer.png'),
    unlock: 'Complete Traffic Master',
  },
  {
    id: 'cowboy',
    name: 'Cowboy Chicken',
    description: 'There’s a new bird in town.',
    image: require('../assets/chicken-cowboy.png'),
    unlock: 'Complete Highway Hero',
  },
  {
    id: 'boss',
    name: 'Chicken Boss',
    description: 'Every highway answers to you.',
    image: require('../assets/chicken-boss.png'),
    unlock: 'Complete all five challenges',
  },
];
export const highways: Skin<HighwayId>[] = [
  {
    id: 'classic',
    name: 'Classic Highway',
    description: 'Good old asphalt. Timeless.',
    image: require('../assets/highway-classic.png'),
    price: 0,
  },
  {
    id: 'city',
    name: 'City Highway',
    description: 'Urban jungle. Watch for cabs.',
    image: require('../assets/highway-city.png'),
    price: 3000,
  },
  {
    id: 'night',
    name: 'Night Highway',
    description: 'Neon lights. Endless nights.',
    image: require('../assets/highway-night.png'),
    price: 5000,
  },
  {
    id: 'desert',
    name: 'Desert Highway',
    description: 'Hot asphalt. Cool nerves.',
    image: require('../assets/highway-desert.png'),
    price: 5000,
  },
  {
    id: 'mountain',
    name: 'Mountain Highway',
    description: 'High altitude. Higher stakes.',
    image: require('../assets/highway-mountain.png'),
    unlock: 'Complete all five challenges',
  },
];
export const boosts: {
  id: BoostId;
  name: string;
  description: string;
  price: number;
  image: ImageSourcePropType;
  color: string;
}[] = [
  {
    id: 'shield',
    name: 'Chicken Shield',
    description: 'Absorbs one crash. Shell-shocked but alive.',
    price: 700,
    image: require('../assets/boost-chicken-shield.png'),
    color: '#55adf5',
  },
  {
    id: 'slow',
    name: 'Traffic Slow',
    description: 'Slows all traffic for 8 seconds.',
    price: 600,
    image: require('../assets/boost-traffic-slow.png'),
    color: '#ab4ee8',
  },
  {
    id: 'rush',
    name: 'Egg Rush',
    description: 'Earn +50% Eggies for the whole run.',
    price: 800,
    image: require('../assets/boost-egg-rush.png'),
    color: '#f2bd18',
  },
];
export const challenges: {
  id: ChallengeId;
  name: string;
  description: string;
  target: number;
  reward: number;
  unlock?: string;
}[] = [
  {
    id: 'long',
    name: 'Long Haul',
    description: 'Complete 15 rows in one run.',
    target: 15,
    reward: 1000,
  },
  {
    id: 'hero',
    name: 'Highway Hero',
    description: 'Complete 25 rows without a collision.',
    target: 25,
    reward: 5000,
    unlock: 'Cowboy Chicken',
  },
  {
    id: 'moving',
    name: 'Keep Moving',
    description: 'Pass 10 rows with no pause longer than 2 seconds.',
    target: 10,
    reward: 2000,
  },
  {
    id: 'perfect',
    name: 'Perfect Run',
    description: 'Complete 15 rows without a collision.',
    target: 15,
    reward: 2500,
  },
  {
    id: 'master',
    name: 'Traffic Master',
    description: 'Complete 20 rows without a collision.',
    target: 20,
    reward: 3500,
    unlock: 'Racer Chicken',
  },
];
export const vehicles = [
  {
    width: 84,
    speed: 64,
    images: [
      require('../assets/car-red-compact-left.png'),
      require('../assets/car-red-compact-right.png'),
    ],
  },
  {
    width: 96,
    speed: 86,
    images: [
      require('../assets/car-yellow-taxi-left.png'),
      require('../assets/car-yellow-taxi-right.png'),
    ],
  },
  {
    width: 102,
    speed: 76,
    images: [
      require('../assets/car-green-van-left.png'),
      require('../assets/car-green-van-right.png'),
    ],
  },
  {
    width: 91,
    speed: 135,
    images: [
      require('../assets/car-blue-sports-left.png'),
      require('../assets/car-blue-sports-right.png'),
    ],
  },
  {
    width: 138,
    speed: 52,
    images: [
      require('../assets/car-orange-truck-left.png'),
      require('../assets/car-orange-truck-right.png'),
    ],
  },
];
