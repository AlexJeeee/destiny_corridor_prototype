/**
 * 战斗系统 - 负责处理伤害、治疗和防御等战斗相关功能
 */
class CombatSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  // 对角色造成伤害
  applyDamage(character, amount) {
    console.log(`对角色造成${amount}点伤害`);
    
    if (!character) {
      console.error('无效的角色');
      return;
    }
    
    const state = this.gameManager.getState();
    
    // 计算实际伤害
    const actualDamage = Math.max(0, amount);
    
    if (character === state.player) {
      // 对玩家造成伤害
      const newHealth = Math.max(0, state.player.health - actualDamage);
      
      console.log(`玩家受到${actualDamage}点伤害，生命值从 ${state.player.health} 减少到 ${newHealth}`);
      
      this.gameManager.setState({
        player: {
          ...state.player,
          health: newHealth
        }
      });
      
      // 触发伤害事件
      this.gameManager.triggerGameEvent({
        type: 'player_damaged',
        damage: actualDamage,
        newHealth: newHealth
      });
    } else {
      // 对敌人造成伤害
      let enemyDied = false;
      
      const updatedEnemies = state.enemies.map(enemy => {
        if (enemy === character) {
          const newHealth = Math.max(0, enemy.health - actualDamage);
          console.log(`敌人受到${actualDamage}点伤害，剩余生命值: ${newHealth}`);
          
          // 检查敌人是否死亡
          if (newHealth <= 0 && enemy.health > 0) {
            enemyDied = true;
            console.log(`敌人 ${enemy.id} 死亡`);
          }
          
          return {
            ...enemy,
            health: newHealth
          };
        }
        return enemy;
      });
      
      // 触发敌人受伤事件
      const damagedEnemy = updatedEnemies.find(enemy => enemy === character);
      if (damagedEnemy) {
        this.gameManager.triggerGameEvent({
          type: 'enemy_damaged',
          enemy: damagedEnemy,
          damage: actualDamage,
          position: damagedEnemy.position
        });
      }

      if (enemyDied) {
        // 触发敌人死亡事件
        this.gameManager.triggerGameEvent({
          type: 'enemy_defeated',
          count: updatedEnemies.filter(enemy => enemy && enemy.health === 0).length,
        });
      }
      
      // 更新敌人状态
      const aliveEnemies = updatedEnemies.filter(enemy => enemy && enemy.health > 0);
      this.gameManager.setState({ enemies: aliveEnemies });
      if (aliveEnemies.length === 0) {
        console.log('所有敌人都已被击败');
        this.gameManager.triggerGameEvent({
          type: 'all_enemies_defeated'
        });
      }
    }
  }

  // 应用防御
  applyDefense(character, amount) {
    const state = this.gameManager.getState();
    
    if (character === state.player) {
      this.gameManager.setState({
        player: {
          ...state.player,
          defense: (state.player.defense || 0) + amount
        }
      });
    } else {
      // 处理敌人获得防御
      const updatedEnemies = state.enemies.map(enemy => {
        if (enemy === character) {
          return {
            ...enemy,
            defense: (enemy.defense || 0) + amount
          };
        }
        return enemy;
      });
      
      this.gameManager.setState({ enemies: updatedEnemies });
    }
  }

  // 治疗角色
  applyHeal(character, amount) {
    const state = this.gameManager.getState();
    
    if (character === state.player) {
      const newHealth = Math.min(state.player.health + amount, state.player.maxHealth);
      this.gameManager.setState({
        player: {
          ...state.player,
          health: newHealth
        }
      });
    } else {
      // 更新敌人生命值
      const updatedEnemies = state.enemies.map(enemy => {
        if (enemy === character) {
          return {
            ...enemy,
            health: Math.min(enemy.health + amount, enemy.maxHealth)
          };
        }
        return enemy;
      });
      
      this.gameManager.setState({ enemies: updatedEnemies });
    }
  }
}

export default CombatSystem; 