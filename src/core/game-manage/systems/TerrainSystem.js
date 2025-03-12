import { TERRAINS } from '../../../data/terrains';

/**
 * 地形系统 - 负责处理地形生成和地形效果
 */
class TerrainSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  // 初始化战场地形
  initializeTerrain() {
    const terrain = {};
    const rows = 5;
    const cols = 7;
    
    // 随机生成地形
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // 随机选择地形类型
        const terrainTypes = Object.keys(TERRAINS).filter(id => id !== 'blocked');
        const randomIndex = Math.floor(Math.random() * terrainTypes.length);
        const terrainType = terrainTypes[randomIndex];
        
        // 设置地形
        terrain[`${x},${y}`] = terrainType;
      }
    }
    
    // 添加一些障碍物
    terrain['2,2'] = 'blocked';
    terrain['4,3'] = 'blocked';
    
    // 确保玩家初始位置是平原
    terrain['0,0'] = 'plain';
    
    this.gameManager.setState({ terrain });
  }

  // 应用地形效果
  applyTerrainEffect(character, trigger) {
    const state = this.gameManager.getState();
    
    // 获取角色所在的地形
    const position = character.position;
    const terrainType = state.terrain[`${position.x},${position.y}`];
    
    if (!terrainType) return;
    
    // 获取地形对象
    const terrain = TERRAINS[terrainType];
    
    if (!terrain) return;
    
    // 查找匹配的效果
    const effects = terrain.effects.filter(effect => effect.trigger === trigger);
    
    // 应用效果
    for (const effect of effects) {
      switch (effect.type) {
        case 'damage':
          this.gameManager.combatSystem.applyDamage(character, effect.value);
          console.log(`${terrainType}地形对${character === state.player ? '玩家' : '敌人'}造成了${effect.value}点伤害`);
          break;
        case 'heal':
          this.gameManager.combatSystem.applyHeal(character, effect.value);
          console.log(`${terrainType}地形为${character === state.player ? '玩家' : '敌人'}恢复了${effect.value}点生命`);
          break;
        case 'energy':
          if (character === state.player) {
            this.gameManager.setState({
              player: {
                ...state.player,
                energy: Math.min(state.player.energy + effect.value, state.player.maxEnergy)
              }
            });
            console.log(`${terrainType}地形为玩家恢复了${effect.value}点能量`);
          }
          break;
        case 'status':
          this.gameManager.statusEffectSystem.applyStatusEffect(character, effect.statusType, effect.value, effect.duration);
          console.log(`${terrainType}地形对${character === state.player ? '玩家' : '敌人'}施加了${effect.statusType}状态`);
          break;
      }
    }
  }
}

export default TerrainSystem; 