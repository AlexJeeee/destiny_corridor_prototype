// Terrain types and their effects
export const TERRAINS = {
  plain: {
    name: '平地',
    description: '普通地形，没有特殊效果',
    movementCost: 1,
    effects: []
  },
  fire: {
    name: '火焰地形',
    description: '进入时受到2点伤害，火系卡牌伤害+20%',
    movementCost: 1,
    effects: [
      {
        type: 'damage',
        value: 2,
        trigger: 'onEnter'
      },
      {
        type: 'elementBoost',
        element: 'fire',
        value: 0.2,
        trigger: 'constant'
      }
    ]
  },
  ice: {
    name: '冰冻地形',
    description: '移动消耗+1，冰系卡牌冷却-1',
    movementCost: 2,
    effects: [
      {
        type: 'cooldownReduction',
        element: 'ice',
        value: 1,
        trigger: 'constant'
      }
    ]
  },
  wind: {
    name: '风系地形',
    description: '移动距离+1，风系卡牌范围+1',
    movementCost: 1,
    effects: [
      {
        type: 'movementBonus',
        value: 1,
        trigger: 'constant'
      },
      {
        type: 'rangeBoost',
        element: 'wind',
        value: 1,
        trigger: 'constant'
      }
    ]
  },
  energy: {
    name: '能量地形',
    description: '每回合获得1点能量，能量卡牌效果+25%',
    movementCost: 1,
    effects: [
      {
        type: 'energy',
        value: 1,
        trigger: 'onTurnStart'
      },
      {
        type: 'energyBoost',
        value: 0.25,
        trigger: 'constant'
      }
    ]
  },
  poison: {
    name: '毒雾地形',
    description: '每回合受到1点伤害，持续2回合',
    movementCost: 1,
    effects: [
      {
        type: 'poison',
        value: 1,
        duration: 2,
        trigger: 'onTurnStart'
      }
    ]
  },
  water: {
    name: '水系地形',
    description: '雷系卡牌伤害+30%，火系卡牌伤害-20%',
    movementCost: 1,
    effects: [
      {
        type: 'elementBoost',
        element: 'lightning',
        value: 0.3,
        trigger: 'constant'
      },
      {
        type: 'elementPenalty',
        element: 'fire',
        value: 0.2,
        trigger: 'constant'
      }
    ]
  },
  earth: {
    name: '土系地形',
    description: '防御+2，移动消耗+1',
    movementCost: 2,
    effects: [
      {
        type: 'defense',
        value: 2,
        trigger: 'constant'
      }
    ]
  },
  blocked: {
    name: '障碍物',
    description: '无法通行',
    movementCost: Infinity,
    effects: []
  }
};

// Get terrain by ID
export const getTerrainById = (id) => {
  return TERRAINS[id] || TERRAINS.plain;
};

// Get terrain effect value 
export const getTerrainEffectValue = (terrainId, effectType) => {
  const terrain = getTerrainById(terrainId);
  if (!terrain) return 0;

  // 检查进入效果
  if (effectType === 'onEnter' && terrain.effects.find(e => e.trigger === 'onEnter')) {
    return terrain.effects.find(e => e.trigger === 'onEnter').value;
  }
  
  // 检查回合开始效果
  if (effectType === 'onTurnStart' && terrain.effects.find(e => e.trigger === 'onTurnStart')) {
    return terrain.effects.find(e => e.trigger === 'onTurnStart').value;
  }
  
  // 检查移动消耗
  if (effectType === 'movementCost') {
    return terrain.movementCost || 1;
  }
  
  // 检查移动加成
  if (effectType === 'movementBonus') {
    return terrain.effects.find(e => e.trigger === 'movementBonus')?.value || 0;
  }

  return 0;
};

// 获取地形对特定卡牌类型的影响
export const getCardInteraction = (terrainId, cardType) => {
  const terrain = getTerrainById(terrainId);
  if (!terrain || !terrain.effects.find(e => e.element === cardType)) {
    return null;
  }
  
  const interaction = terrain.effects.find(e => e.element === cardType);
  return {
    type: interaction.type,
    value: interaction.value,
    multiplier: interaction.multiplier || 1
  };
};

// 计算地形对卡牌伤害的影响
export const calculateTerrainDamageModifier = (terrainId, cardType, baseDamage) => {
  const interaction = getCardInteraction(terrainId, cardType);
  if (!interaction || !interaction.multiplier) {
    return baseDamage;
  }
  
  return Math.floor(baseDamage * interaction.multiplier);
};

// 计算地形对卡牌范围的影响
export const calculateTerrainRangeModifier = (terrainId, cardType, baseRange) => {
  const interaction = getCardInteraction(terrainId, cardType);
  if (!interaction || !interaction.rangeBonus) {
    return baseRange;
  }
  
  return baseRange + interaction.rangeBonus;
};

// 计算地形对卡牌冷却的影响
export const calculateTerrainCooldownModifier = (terrainId, cardType, baseCooldown) => {
  const interaction = getCardInteraction(terrainId, cardType);
  if (!interaction || !interaction.cooldownReduction) {
    return baseCooldown;
  }
  
  return Math.max(0, baseCooldown - interaction.cooldownReduction);
};

// Check if terrain has lingering effect
export const hasLingeringEffect = (terrainId) => {
  const terrain = getTerrainById(terrainId);
  return terrain?.effects.find(e => e.trigger === 'range')?.value > 0;
};