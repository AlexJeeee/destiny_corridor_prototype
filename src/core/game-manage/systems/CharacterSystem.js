import { hexDistance } from '../../../utils/hexUtils';

/**
 * 角色系统 - 负责处理角色移动、位置验证等功能
 */
class CharacterSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  // 移动角色
  moveCharacter(character, newPosition) {
    if (!character || !newPosition) {
      console.error('无效的角色或位置');
      return false;
    }
    
    console.log('移动角色:', JSON.stringify(character, null, 2));
    console.log('目标位置:', JSON.stringify(newPosition, null, 2));
    
    const state = this.gameManager.getState();
    
    // 检查目标位置是否被占用
    const isOccupied = state.enemies.some(enemy => 
      enemy !== character && // 不要将自己视为占用
      enemy.position && 
      enemy.position.x === newPosition.x && 
      enemy.position.y === newPosition.y
    ) || (
      state.player !== character && // 不要将自己视为占用
      state.player.position &&
      state.player.position.x === newPosition.x && 
      state.player.position.y === newPosition.y
    );
    
    if (isOccupied) {
      console.log('目标位置已被占用');
      return false;
    }
    
    // 记录旧位置
    const oldPosition = character.position ? { ...character.position } : null;
    
    // 更新角色位置
    if (character === state.player) {
      // 更新玩家位置
      const movementPath = state.player.movementPath || [];
      
      this.gameManager.setState({
        player: {
          ...state.player,
          position: newPosition,
          movementPath: [...movementPath, newPosition]
        }
      });
      
      // 触发移动事件
      this.gameManager.triggerGameEvent({
        type: 'player_move',
        position: newPosition,
        oldPosition
      });
      
      // 应用地形效果
      this.gameManager.terrainSystem.applyTerrainEffect(this.gameManager.getState().player, 'onEnter');
    } else {
      // 敌人移动
      console.log('处理敌人移动');
      
      // 检查是否是敌人
      const isEnemy = state.enemies.some(e => e.id === character.id);
      if (!isEnemy) {
        console.error('移动的角色不是敌人:', character);
        return false;
      }
      
      // 直接创建新的敌人数组
      const updatedEnemies = state.enemies.map(enemy => {
        if (enemy.id === character.id) {
          console.log(`找到要移动的敌人 ${enemy.id}`);
          return {
            ...enemy,
            position: { ...newPosition }
          };
        }
        return enemy;
      });
      
      console.log('更新前的敌人:', JSON.stringify(state.enemies, null, 2));
      console.log('更新后的敌人:', JSON.stringify(updatedEnemies, null, 2));
      
      // 更新状态
      this.gameManager.setState({ enemies: updatedEnemies });
      
      // 触发移动事件
      this.gameManager.triggerGameEvent({
        type: 'enemy_move',
        position: newPosition,
        oldPosition
      });
      
      // 应用地形效果
      setTimeout(() => {
        const updatedEnemy = this.gameManager.getState().enemies.find(e => 
          e.id === character.id
        );
        if (updatedEnemy) {
          this.gameManager.terrainSystem.applyTerrainEffect(updatedEnemy, 'onEnter');
        }
      }, 0);
    }
    
    return true;
  }

  // 验证敌人位置
  validateEnemyPositions() {
    const state = this.gameManager.getState();
    
    if (!state.enemies || state.enemies.length === 0) {
      console.log('没有敌人需要验证');
      return;
    }
    
    // 检查敌人位置
    const validatedEnemies = state.enemies.map((enemy, index) => {
      if (!enemy.position) {
        console.error(`敌人${index}没有位置信息，设置默认位置`);
        return {
          ...enemy,
          position: { x: 4 + index, y: 2 }
        };
      }
      
      if (typeof enemy.position.x !== 'number' || typeof enemy.position.y !== 'number') {
        console.error(`敌人${index}位置信息无效，设置默认位置`);
        return {
          ...enemy,
          position: { x: 4 + index, y: 2 }
        };
      }
      
      return enemy;
    });
    
    // 更新敌人位置
    this.gameManager.setState({ enemies: validatedEnemies });
    
    console.log('敌人位置验证完成:', validatedEnemies);
  }
}

export default CharacterSystem; 