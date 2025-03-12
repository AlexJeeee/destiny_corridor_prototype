import { hexDistance } from '../../../utils/hexUtils';

/**
 * 敌人AI系统 - 负责处理敌人的行为逻辑
 */
class EnemyAISystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  // 执行敌人回合
  performEnemyTurn() {
    console.log('执行敌人回合 - 简化版');
    
    const state = this.gameManager.getState();
    
    // 检查游戏状态
    if (!state || !state.enemies || !state.player) {
      console.error('游戏状态无效，无法执行敌人回合');
      return;
    }
    
    // 先移除已死亡的敌人
    const aliveEnemies = state.enemies.filter(enemy => enemy && enemy.health > 0);
    
    // 如果有敌人死亡，更新状态并触发事件
    if (aliveEnemies.length < state.enemies.length) {
      const deadCount = state.enemies.length - aliveEnemies.length;
      console.log(`${deadCount}个敌人被击败`);
      
      // 触发敌人死亡事件
      this.gameManager.triggerGameEvent({
        type: 'enemy_defeated',
        count: deadCount
      });
      
      // 更新敌人状态
      this.gameManager.setState({ enemies: aliveEnemies });
      
      // 如果没有敌人了，直接结束回合
      if (aliveEnemies.length === 0) {
        console.log('没有敌人，直接结束回合');
        this.gameManager.endEnemyTurn();
        return;
      }
    }
    
    // 获取所有敌人
    const enemies = [...aliveEnemies];
    console.log(`敌人数量: ${enemies.length}`);
    
    if (enemies.length === 0) {
      console.log('没有敌人，直接结束回合');
      this.gameManager.endEnemyTurn();
      return;
    }
    
    // 简化版：直接更新敌人位置，不使用复杂的递归和setTimeout
    const updatedEnemies = enemies.map(enemy => {
      // 如果敌人已经死亡，跳过
      if (!enemy || enemy.health <= 0) {
        return enemy;
      }
      
      // 检查敌人位置
      if (!enemy.position || typeof enemy.position.x !== 'number' || typeof enemy.position.y !== 'number') {
        console.error('敌人位置无效:', enemy);
        return enemy;
      }
      
      console.log(`处理敌人 ${enemy.id} 在位置 (${enemy.position.x}, ${enemy.position.y})`);
      console.log(`玩家位置: (${state.player.position.x}, ${state.player.position.y})`);
      
      // 计算与玩家的距离
      const distanceToPlayer = hexDistance(
        enemy.position,
        state.player.position
      );
      
      console.log(`敌人距离玩家: ${distanceToPlayer}`);
      
      // 创建敌人的副本
      const updatedEnemy = { ...enemy };
      
      if (distanceToPlayer <= 1) {
        // 敌人攻击玩家
        const damage = 5; // 基础伤害
        console.log(`敌人攻击玩家，造成${damage}点伤害`);
        
        // 应用伤害
        this.gameManager.combatSystem.applyDamage(state.player, damage);
        
        // 触发攻击事件
        this.gameManager.triggerGameEvent({
          type: 'enemy_attack',
          enemy: updatedEnemy,
          damage,
          position: enemy.position
        });
      } else {
        // 敌人向玩家移动
        const dx = state.player.position.x - enemy.position.x;
        const dy = state.player.position.y - enemy.position.y;
        
        console.log(`方向计算: dx=${dx}, dy=${dy}`);
        
        // 计算移动方向
        const moveX = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
        const moveY = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;
        
        console.log(`移动方向: moveX=${moveX}, moveY=${moveY}`);
        
        // 计算新位置
        const newPosition = {
          x: enemy.position.x + moveX,
          y: enemy.position.y + moveY
        };
        
        console.log(`敌人尝试移动到 (${newPosition.x}, ${newPosition.y})`);
        
        // 检查目标位置是否已被占用
        const isOccupied = enemies.some(e => 
          e !== enemy && e.position && e.position.x === newPosition.x && e.position.y === newPosition.y
        ) || (
          state.player.position.x === newPosition.x && 
          state.player.position.y === newPosition.y
        );
        
        if (!isOccupied) {
          // 保存旧位置
          const oldPosition = { ...enemy.position };
          
          // 直接更新敌人位置
          updatedEnemy.position = { ...newPosition };
          console.log(`敌人位置已更新为 (${newPosition.x}, ${newPosition.y})`);
          
          // 触发移动事件
          this.gameManager.triggerGameEvent({
            type: 'enemy_move',
            enemy: updatedEnemy,
            position: newPosition,
            oldPosition: oldPosition,
            from: oldPosition,
            to: newPosition
          });
        } else {
          console.log('目标位置已被占用，无法移动');
        }
      }
      
      return updatedEnemy;
    });
    
    // 更新敌人状态
    this.gameManager.setState({ enemies: updatedEnemies });
    
    // 延迟后结束敌人回合
    setTimeout(() => {
      this.gameManager.endEnemyTurn();
    }, 1000);
  }
}

export default EnemyAISystem; 