/**
 * cards.js
 * Data file for card definitions
 */

// Card collection
export const cards = [
  // Basic cards
  {
    id: 'basicStrike',
    name: '普通攻击',
    description: '基础攻击卡牌',
    energyCost: 1,
    type: 'attack',
    attribute: 'earth',
    rarity: '普通',
    normalEffect: {
      type: 'damage',
      description: '对目标造成5点伤害',
      value: 5,
    },
    reversedEffect: {
      type: 'damage',
      description: '对所有相邻敌人造成3点伤害',
      value: 3,
      area: 1,
    },
  },
  {
    id: 'basicBlock',
    name: '防御',
    description: '基础防御卡牌',
    energyCost: 1,
    type: 'defense',
    attribute: 'neutral',
    rarity: '普通',
    normalEffect: {
      type: 'shield',
      description: '获得5点护盾',
      value: 5,
    },
    reversedEffect: {
      type: 'shield',
      description: '获得3点护盾并抽取1张牌',
      value: 3,
      draw: 1,
    },
  },
  {
    id: 'tacticalMove',
    name: '战术移动',
    description: '基础实用卡牌',
    energyCost: 0,
    type: 'utility',
    attribute: 'neutral',
    rarity: '普通',
    normalEffect: {
      type: 'movement',
      description: '获得2点移动点数',
      value: 2,
    },
    reversedEffect: {
      type: 'draw',
      description: '抽取1张牌',
      value: 1,
    },
  },

  // Fire attribute cards
  {
    id: 'fireStrike',
    name: '火球术',
    description: 'A fiery attack',
    energyCost: 1,
    type: 'attack',
    attribute: 'fire',
    rarity: '稀有',
    normalEffect: {
      type: 'damage',
      description: '对目标造成4点伤害并施加2点燃烧',
      value: 4,
      statusType: 'burn',
      statusValue: 2,
      statusDuration: 2,
    },
    reversedEffect: {
      type: 'area',
      description: '对所有相邻敌人造成3点伤害',
      value: 3,
      area: 3,
      targetType: 'enemy',
    },
  },
  {
    id: 'fireball',
    name: '火球术',
    description: '发射一个火球攻击敌人',
    energyCost: 2,
    type: 'attack',
    attribute: 'fire',
    rarity: '普通',
    normalEffect: {
      type: 'damage',
      description: '对目标造成8点伤害',
      value: 8,
    },
    reversedEffect: {
      type: 'area',
      description: '对所有相邻敌人造成5点伤害',
      value: 5,
      area: 1,
      targetType: 'enemy',
    },
  },

  // Ice attribute cards
  {
    id: 'frostBolt',
    name: '冰霜箭',
    description: 'A chilling attack',
    energyCost: 1,
    type: 'attack',
    attribute: 'ice',
    rarity: '稀有',
    normalEffect: {
      type: 'damage',
      description: '对目标造成3点伤害并施加1点减速',
      value: 3,
      statusType: 'slow',
      statusValue: 1,
      statusDuration: 2,
    },
    reversedEffect: {
      type: 'shield',
      description: '获得4点护盾',
      value: 4,
    },
  },
  {
    id: 'iceWall',
    name: '冰墙',
    description: '一个神奇的冰墙',
    energyCost: 2,
    type: 'defense',
    attribute: 'ice',
    rarity: 'rare',
    normalEffect: {
      type: 'shield',
      description: '获得8点护盾',
      value: 8,
    },
    reversedEffect: {
      type: 'status',
      description: '获得5点护盾并施加1点减速到所有相邻敌人',
      value: 5,
      statusType: 'slow',
      statusValue: 1,
      statusDuration: 2,
      area: 1,
    },
  },

  // Earth attribute cards
  {
    id: 'earthSpike',
    name: '地刺',
    description: '一个强大的地面攻击',
    energyCost: 1,
    type: 'attack',
    attribute: 'earth',
    rarity: '稀有',
    normalEffect: {
      type: 'damage',
      description: '对目标造成6点伤害',
      value: 6,
    },
    reversedEffect: {
      type: 'shield',
      description: '获得3点护盾并对目标造成2点伤害',
      value: 3,
      damage: 2,
    },
  },
  {
    id: 'stoneWall',
    name: '石墙',
    description: '一个坚固的防御屏障',
    energyCost: 2,
    type: 'defense',
    attribute: 'earth',
    rarity: '稀有',
    normalEffect: {
      type: 'shield',
      description: '获得7点护盾并在下一回合获得1点能量',
      value: 7,
      energy: 1,
    },
    reversedEffect: {
      type: 'shield',
      description: '获得5点护盾并抽取1张牌',
      value: 5,
      draw: 1,
    },
  },

  // Wind attribute cards
  {
    id: 'swiftGust',
    name: 'Swift Gust',
    description: 'A quick wind attack',
    energyCost: 1,
    type: 'attack',
    attribute: 'wind',
    rarity: '稀有',
    normalEffect: {
      type: 'damage',
      description: '对目标造成4点伤害并抽取1张牌',
      value: 4,
      draw: 1,
    },
    reversedEffect: {
      type: 'movement',
      description: '获得3点移动点数',
      value: 3,
    },
  },
  {
    id: 'windSlash',
    name: '风刃',
    description: '一个切割的风暴攻击',
    energyCost: 2,
    type: 'attack',
    attribute: 'wind',
    rarity: 'rare',
    normalEffect: {
      type: 'damage',
      description: '对所有相邻敌人造成3点伤害',
      value: 3,
      area: 3,
      targetType: 'enemy',
    },
    reversedEffect: {
      type: 'movement',
      description: '获得2点移动点数并抽取1张牌',
      value: 2,
      draw: 1,
    },
  },

  // Special character cards
  {
    id: 'rage',
    name: '狂怒',
    description: '根据失去的生命值造成伤害',
    energyCost: 2,
    type: 'attack',
    attribute: 'neutral',
    rarity: '特殊',
    normalEffect: {
      type: 'damage',
      description: '根据已损失生命值造成伤害，最多10点',
      value: 10,
    },
    reversedEffect: {
      type: 'draw',
      description: '抽取2张牌并损失2点生命值',
      value: 2,
      healthCost: 2,
    },
  },
  {
    id: 'arcaneMissile',
    name: '奥术飞弹',
    description: '一个法师的标志性咒语',
    energyCost: 1,
    type: 'attack',
    attribute: 'neutral',
    rarity: '特殊',
    normalEffect: {
      type: 'damage',
      description: '对随机敌人造成2点伤害3次',
      value: 2,
      hits: 3,
    },
    reversedEffect: {
      type: 'energy',
      description: '获得2点能量',
      value: 2,
    },
  },
  {
    id: 'shadowStep',
    name: '影步',
    description: '一个盗贼的快速移动',
    energyCost: 0,
    type: 'utility',
    attribute: 'shadow',
    rarity: '特殊',
    normalEffect: {
      type: 'movement',
      description: '获得3点移动点数',
      value: 3,
    },
    reversedEffect: {
      type: 'damage',
      description: '对目标造成3点伤害并获得1点移动点数',
      value: 3,
      movement: 1,
    },
  },
];

/**
 * Get cards by deck type
 * @param {string} deckType - Type of deck to filter for
 * @returns {Array} Array of card objects
 */
export function getCardsByDeckType(deckType) {
  // Filter cards based on deck type
  switch (deckType) {
    case 'strength':
      return cards.filter(card => 
        card.attribute === 'earth' || 
        card.attribute === 'fire' ||
        card.id === 'rage'
      );
    case 'arcane':
      return cards.filter(card => 
        card.attribute === 'fire' || 
        card.attribute === 'ice' ||
        card.id === 'arcane-missile'
      );
    case 'agility':
      return cards.filter(card => 
        card.attribute === 'wind' || 
        card.attribute === 'shadow' ||
        card.id === 'shadow-step'
      );
    default:
      return cards.filter(card => card.rarity !== 'special');
  }
}

/**
 * Get a card by ID
 * @param {string} cardId - ID of the card
 * @returns {Object|null} Card object or null if not found
 */
export function getCardById(cardId) {
  return cards.find(card => card.id === cardId) || null;
}