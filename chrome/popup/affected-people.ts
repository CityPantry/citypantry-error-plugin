import { generateRandomNumber, sample, unique } from '../shared/util';

const groups = [
  {
    suffix: null,
    examples: ['MA', 'Sales', 'CX', 'Marketing', 'Finance', 'Vendor Acquisition', 'Vendor Management'],
    prefixes: [],
  },
  {
    suffix: 'vendor',
    examples: ['Hoxton 101', 'Dead From Starvation', 'Ridiculous Poultry', 'VavaVoom', 'Great Brownie', 'Ben\'s Biscuits', 'Benito\'s Shoes', 'Big Pear Hot Dogs', 'POULET', 'Guten Appetit', 'Dim Kitchen', 'Crabana', 'On The Way Cafe', 'Chill And Go', 'Town Lunch', 'Fruit Bake', 'Cupcakes & Stfff', 'Mommy Monkey', 'Lunch Gents', 'Eat Last', 'Farmer K', 'Full Mule', 'JUMP Thai', 'It's Soup', 'B12', 'Mojo Tins', 'Neat Kake', 'The Daily Bread', 'Leona', 'McWild', 'Gruvo', 'Oi! Thai', 'Okay Pokay', 'Mama Jane\'s', 'Paula', 'Squeel', 'Pho Sho', 'Ding Dong', 'Pizza Journeyers', 'Plod', 'Poncho9', 'Nice Guys', 'Waake Up Breakfast', 'Lettuce Times', 'Salad Criminals', 'Silicon Catering', 'BANG', 'Wimpy', 'Speared', 'The Greek Capitalist', 'The French Potato', 'Thunderbirds Are Go', 'YouGrill', 'Finish Your Wrap'],
    prefixes: [],
  },
  {
    suffix: 'customer',
    examples: ['Loyota', 'Tradoo', 'WeWontWork', 'Runaway UK Ltd', 'Blokos Lowercase Management', 'BAA Print Ltd', 'Darling Bank', 'Fiber', 'Century Capital', 'UberEATS', 'Caterwings', 'Seamless', 'Feedr', 'Deliveroo', 'Feastly', 'JustStarve', 'Badon\'t', 'Loser.com', 'Seascanner', 'Tango', 'Castoff Capital', 'Seekabug', 'Spotifry', 'UWU Energy', 'Blue Steer UK', 'Sauce Dabs', 'Grumble', 'Megatough', 'List'],
    prefixes: ['OM', 'Eaters'],
  },
];

function generateRandomAffectedPerson(): string {
  const exampleGroup = sample(groups);

  return (exampleGroup.prefixes.length ? `${sample(exampleGroup.prefixes)} at ` : '')
    + sample(exampleGroup.examples)
    + (exampleGroup.suffix ? ` (${exampleGroup.suffix})` : '');
}

export function generateRandomAffectedPeople(): string[] {
  const length = generateRandomNumber(1, 3);

  return unique(Array.from({ length }, generateRandomAffectedPerson));
}
