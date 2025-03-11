/**
 * oracles.js
 * Data file for oracle events and blessings
 */

// Oracle collection
export const oracles = [
  // War God Oracles
  {
    name: 'Oracle of Bloodlust',
    description: 'The War God\'s blessing of aggression',
    deity: 'wargod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: 'Battle Fury',
        description: 'Your attacks deal 15% more damage.',
        effect: 'attackBoost',
        value: 15
      },
      {
        name: 'Blood Rage',
        description: 'When you take damage, gain 1 energy for every 5 damage taken.',
        effect: 'damageEnergyConversion',
        value: 5
      }
    ],
    cardPoolModifiers: {
      attack: 30,
      defense: -10,
      utility: -10
    },
    specialRules: [
      'Taking more than 10 damage in a single turn triggers Blood Frenzy, increasing your damage by 20% for 1 turn.'
    ]
  },
  {
    name: 'Oracle of Iron',
    description: 'The War God\'s blessing of defense',
    deity: 'wargod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: 'Iron Skin',
        description: 'Gain 5 shield at the start of combat.',
        effect: 'startShield',
        value: 5
      },
      {
        name: 'Counterattack',
        description: 'When you block damage, deal 2 damage to the attacker.',
        effect: 'counterattack',
        value: 2
      }
    ],
    cardPoolModifiers: {
      attack: 0,
      defense: 30,
      utility: -10
    }
  },

  // Wisdom God Oracles
  {
    name: 'Oracle of Knowledge',
    description: 'The Wisdom God\'s blessing of insight',
    deity: 'wisdomgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: 'Deep Insight',
        description: 'Draw 1 additional card at the start of combat.',
        effect: 'cardDraw',
        value: 1
      },
      {
        name: 'Strategic Mind',
        description: 'Every third card you play costs 1 less energy.',
        effect: 'cardDiscount',
        value: 1
      }
    ],
    cardPoolModifiers: {
      attack: -10,
      defense: 0,
      utility: 30
    }
  },
  {
    name: 'Oracle of Elements',
    description: 'The Wisdom God\'s blessing of elemental power',
    deity: 'wisdomgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: 'Elemental Affinity',
        description: 'Elemental cards deal 20% more damage.',
        effect: 'elementalBoost',
        value: 20
      },
      {
        name: 'Mana Spring',
        description: 'Start each turn with 1 additional energy.',
        effect: 'startingEnergy',
        value: 1
      }
    ],
    cardPoolModifiers: {
      attack: 10,
      defense: 10,
      utility: 10
    }
  },

  // Luck God Oracles
  {
    name: 'Oracle of Fortune',
    description: 'The Luck God\'s blessing of chance',
    deity: 'luckgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: 'Lucky Strike',
        description: '20% chance for attacks to deal double damage.',
        effect: 'critChance',
        value: 20
      },
      {
        name: 'Fortune\'s Favor',
        description: 'Gain 1 Destiny Coin at the start of combat.',
        effect: 'destinyCoins',
        value: 1
      }
    ],
    cardPoolModifiers: {
      attack: 10,
      defense: 0,
      utility: 10
    },
    specialRules: [
      'Your Destiny Wheel has a higher chance for rare outcomes.'
    ]
  },
  {
    name: 'Oracle of Chaos',
    description: 'The Luck God\'s blessing of unpredictability',
    deity: 'luckgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: 'Chaotic Energy',
        description: 'After playing a card, 30% chance to gain 1 energy.',
        effect: 'randomEnergy',
        value: 30
      },
      {
        name: 'Unpredictable Fate',
        description: 'When you draw cards, 25% chance to draw an extra card.',
        effect: 'randomDraw',
        value: 25
      }
    ],
    cardPoolModifiers: {
      attack: 5,
      defense: 5,
      utility: 20
    },
    specialRules: [
      'Card effects have a 10% chance to be enhanced.'
    ]
  },

  // Death God Oracles
  {
    name: 'Oracle of Sacrifice',
    description: 'The Death God\'s blessing of exchange',
    deity: 'deathgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: 'Life Tap',
        description: 'You can spend 2 health to gain 1 energy.',
        effect: 'healthToEnergy',
        value: 2
      },
      {
        name: 'Blood Magic',
        description: 'Your attack cards deal 30% more damage but cost 1 health per play.',
        effect: 'bloodMagic',
        value: 30
      }
    ],
    cardPoolModifiers: {
      attack: 20,
      defense: -10,
      utility: 10
    },
    specialRules: [
      'When at less than 30% health, your attacks deal 50% more damage.'
    ]
  },
  {
    name: 'Oracle of Shadow',
    description: 'The Death God\'s blessing of darkness',
    deity: 'deathgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: 'Shadow Form',
        description: 'First attack against you each combat deals 50% less damage.',
        effect: 'shadowForm',
        value: 50
      },
      {
        name: 'Soul Drain',
        description: 'When you defeat an enemy, heal 2 health.',
        effect: 'drainOnKill',
        value: 2
      }
    ],
    cardPoolModifiers: {
      attack: 10,
      defense: 10,
      utility: 0
    }
  },
];

/**
 * Get oracles appropriate for a specific floor range
 * @param {number} floor - Current floor number
 * @returns {Array} Array of oracle objects suitable for this floor
 */
export function getOraclesByFloor(floor) {
  return oracles.filter(oracle => 
    oracle.minFloor <= floor && oracle.maxFloor >= floor
  );
}

/**
 * Get oracles from a specific deity
 * @param {string} deity - Deity name
 * @param {number} floor - Current floor number (for filtering)
 * @returns {Array} Array of oracle objects from this deity
 */
export function getOraclesByDeity(deity, floor = null) {
  let filteredOracles = oracles.filter(oracle => oracle.deity === deity);
  
  if (floor !== null) {
    filteredOracles = filteredOracles.filter(oracle => 
      oracle.minFloor <= floor && oracle.maxFloor >= floor
    );
  }
  
  return filteredOracles;
}

/**
 * Get a random oracle
 * @param {string} deity - Deity name (optional)
 * @param {number} floor - Current floor number (optional)
 * @returns {Object} Random oracle object
 */
export function getRandomOracle(deity = null, floor = null) {
  let filteredOracles = [...oracles];
  
  // Filter by deity if specified
  if (deity) {
    filteredOracles = filteredOracles.filter(oracle => oracle.deity === deity);
  }
  
  // Filter by floor if specified
  if (floor !== null) {
    filteredOracles = filteredOracles.filter(oracle => 
      oracle.minFloor <= floor && oracle.maxFloor >= floor
    );
  }
  
  if (filteredOracles.length === 0) return null;
  
  // Get random oracle
  const randomIndex = Math.floor(Math.random() * filteredOracles.length);
  return filteredOracles[randomIndex];
}