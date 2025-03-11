/**
 * characters.js
 * Data file for character definitions
 */

// Character collection
export const characters = [
  {
    id: 'warrior',
    name: '战士',
    maxHealth: 100,
    maxEnergy: 3,
    startingDeckType: 'strength',
    description: '擅长近战和防御的战士',
    abilities: [
      {
        name: '战斗专精',
        description: '每次移动后，下一张攻击牌伤害+2'
      }
    ]
  },
  {
    id: 'mage',
    name: '法师',
    maxHealth: 80,
    maxEnergy: 4,
    startingDeckType: 'fire',
    description: '掌握火焰魔法的法师',
    abilities: [
      {
        name: '元素亲和',
        description: '在元素地形上施放对应元素的法术时，消耗-1'
      }
    ]
  },
  {
    id: 'rogue',
    name: '盗贼',
    maxHealth: 70,
    maxEnergy: 3,
    startingDeckType: 'wind',
    description: '灵活多变的盗贼',
    abilities: [
      {
        name: '影袭',
        description: '每回合第一次移动不消耗行动点'
      }
    ]
  }
];

/**
 * Get a character by ID
 * @param {string} characterId - ID of the character
 * @returns {Object|null} Character object or null if not found
 */
export function getCharacterById(characterId) {
  return characters.find(character => character.id === characterId) || null;
}