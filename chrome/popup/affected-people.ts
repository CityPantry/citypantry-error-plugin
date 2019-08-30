import { generateRandomNumber, sample, unique } from '../shared/util';

const groups = [
  {
    suffix: null,
    examples: ['MA', 'Sales', 'CX', 'Marketing', 'Finance', 'Vendor Acquisition', 'Vendor Management'],
    prefixes: [],
  },
  {
    suffix: 'vendor',
    examples: ['Pink Stick', 'Wibble Wobble', 'Wiggle Wiggle', 'ETA', 'Booty Bump', 'Cheeri-No'],
    prefixes: [],
  },
  {
    suffix: 'customer',
    examples: ['Loyota', 'Tradoo', 'WeWontWork', 'Runaway UK Ltd', 'Blokos Lowercase Management'],
    prefixes: ['OM', 'Eaters'],
  },
];

function generateRandomAffectedPerson(): string {
  const exampleGroup = sample(groups);

  return (exampleGroup.prefixes.length ? `${sample(exampleGroup.prefixes)} of ` : '')
    + sample(exampleGroup.examples)
    + (exampleGroup.suffix ? ` (${exampleGroup.suffix})` : '');
}

export function generateRandomAffectedPeople(): string[] {
  const length = generateRandomNumber(1, 3);

  return unique(Array.from({ length }, generateRandomAffectedPerson));
}
