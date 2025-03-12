/**
 * 状态效果系统 - 负责处理角色状态效果
 */
class StatusEffectSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  // 应用状态效果
  applyStatusEffect(character, effectType, value, duration) {
    const state = this.gameManager.getState();
    
    if (character === state.player) {
      const effects = [...state.player.statusEffects];
      const existingEffectIndex = effects.findIndex(e => e.type === effectType);
      
      if (existingEffectIndex >= 0) {
        // 更新现有效果
        effects[existingEffectIndex] = {
          ...effects[existingEffectIndex],
          value: Math.max(effects[existingEffectIndex].value, value),
          duration: Math.max(effects[existingEffectIndex].duration, duration)
        };
      } else {
        // 添加新效果
        effects.push({ type: effectType, value, duration });
      }
      
      this.gameManager.setState({
        player: {
          ...state.player,
          statusEffects: effects
        }
      });
    } else {
      // 处理敌人获得状态效果
      const updatedEnemies = state.enemies.map(enemy => {
        if (enemy === character) {
          const effects = [...(enemy.statusEffects || [])];
          const existingEffectIndex = effects.findIndex(e => e.type === effectType);
          
          if (existingEffectIndex >= 0) {
            effects[existingEffectIndex] = {
              ...effects[existingEffectIndex],
              value: Math.max(effects[existingEffectIndex].value, value),
              duration: Math.max(effects[existingEffectIndex].duration, duration)
            };
          } else {
            effects.push({ type: effectType, value, duration });
          }
          
          return {
            ...enemy,
            statusEffects: effects
          };
        }
        return enemy;
      });
      
      this.gameManager.setState({ enemies: updatedEnemies });
    }
  }

  // 处理回合开始时的状态效果
  processStatusEffectsOnTurnStart(character) {
    const state = this.gameManager.getState();
    
    if (character === state.player) {
      const effects = [...state.player.statusEffects];
      let updatedEffects = [];
      
      // 处理每个效果
      for (const effect of effects) {
        // 应用效果
        this.applyStatusEffectImpact(character, effect);
        
        // 减少持续时间
        const updatedEffect = {
          ...effect,
          duration: effect.duration - 1
        };
        
        // 如果效果还有持续时间，保留它
        if (updatedEffect.duration > 0) {
          updatedEffects.push(updatedEffect);
        }
      }
      
      // 更新状态
      this.gameManager.setState({
        player: {
          ...state.player,
          statusEffects: updatedEffects
        }
      });
    } else {
      // 处理敌人的状态效果
      const updatedEnemies = state.enemies.map(enemy => {
        if (enemy === character) {
          const effects = [...(enemy.statusEffects || [])];
          let updatedEffects = [];
          
          // 处理每个效果
          for (const effect of effects) {
            // 应用效果
            this.applyStatusEffectImpact(enemy, effect);
            
            // 减少持续时间
            const updatedEffect = {
              ...effect,
              duration: effect.duration - 1
            };
            
            // 如果效果还有持续时间，保留它
            if (updatedEffect.duration > 0) {
              updatedEffects.push(updatedEffect);
            }
          }
          
          return {
            ...enemy,
            statusEffects: updatedEffects
          };
        }
        return enemy;
      });
      
      this.gameManager.setState({ enemies: updatedEnemies });
    }
  }

  // 应用状态效果的实际影响
  applyStatusEffectImpact(character, effect) {
    switch (effect.type) {
      case 'poison':
        // 中毒效果：每回合造成伤害
        this.gameManager.combatSystem.applyDamage(character, effect.value);
        break;
        
      case 'burn':
        // 燃烧效果：每回合造成伤害
        this.gameManager.combatSystem.applyDamage(character, effect.value);
        break;
        
      case 'regeneration':
        // 再生效果：每回合恢复生命
        this.gameManager.combatSystem.applyHeal(character, effect.value);
        break;
        
      // 可以添加更多效果类型
    }
  }
}

export default StatusEffectSystem; 