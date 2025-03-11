/**
 * oracles.js
 * Data file for oracle events and blessings
 */

// Oracle collection
export const oracles = [
  // War God Oracles
  {
    name: '血腥神谕',
    description: '战神的神谕，增加攻击力',
    deity: 'wargod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: '战斗狂怒',
        description: '你的攻击增加15%伤害',
        effect: 'attackBoost',
        value: 15
      },
      {
        name: '血怒',
        description: '当你受到伤害时，每5点伤害获得1点能量',
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
      '单次受到超过10点伤害时触发血怒，增加20%伤害，持续1回合'
    ]
  },
  {
    name: '钢铁神谕',
    description: '战神的神谕，增加防御力',
    deity: 'wargod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: '铁皮',
        description: '战斗开始时获得5点护盾',
        effect: 'startShield',
        value: 5
      },
      {
        name: '反击',
        description: '当你阻挡伤害时，对攻击者造成2点伤害',
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
    name: '智慧神谕',
    description: '智慧神谕，增加洞察力',
    deity: 'wisdomgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: '深邃洞察',
        description: '战斗开始时抽取1张牌',
        effect: 'cardDraw',
        value: 1
      },
      {
        name: '战略思维',
        description: '每第三张牌消耗1点能量',
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
    name: '元素神谕',
    description: '元素神谕，增加元素伤害',
    deity: 'wisdomgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: '元素亲和',
        description: '元素牌增加20%伤害',
        effect: 'elementalBoost',
        value: 20
      },
      {
        name: '能量喷泉',
        description: '每回合开始时获得1点能量',
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
    name: '幸运神谕',
    description: '幸运神谕，增加幸运值',
    deity: 'luckgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: '幸运打击',
        description: '20%几率造成双倍伤害',
        effect: 'critChance',
        value: 20
      },
      {
        name: '命运之轮',
        description: '战斗开始时获得1个命运硬币',
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
      '你的命运之轮有更高的几率出现稀有结果'
    ]
  },
  {
    name: '混乱神谕',
    description: '混乱神谕，增加不确定性',
    deity: 'luckgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: '混乱能量',
        description: '每张牌后有30%几率获得1点能量',
        effect: 'randomEnergy',
        value: 30
      },
      {
        name: '不可预测的命运',
        description: '当你抽牌时，有25%几率抽取额外1张牌',
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
      '卡牌效果有10%几率被增强'
    ]
  },

  // Death God Oracles
  {
    name: '牺牲神谕',
    description: '死亡神谕，增加交换能力',
    deity: 'deathgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: '生命吸取',
        description: '你可以花费2点生命值获得1点能量',
        effect: 'healthToEnergy',
        value: 2
      },
      {
        name: '血魔法',
        description: '你的攻击牌增加30%伤害，但每张牌消耗1点生命值',
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
      '当生命值低于30%时，你的攻击增加50%伤害'
    ]
  },
  {
    name: '阴影神谕',
    description: '阴影神谕，增加阴影能力',
    deity: 'deathgod',
    minFloor: 1,
    maxFloor: 5,
    blessings: [
      {
        name: '阴影形态',
        description: '每次战斗中第一次攻击你时，造成50%伤害',
        effect: 'shadowForm',
        value: 50
      },
      {
        name: '灵魂吸取',
        description: '当你击败敌人时，恢复2点生命值',
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