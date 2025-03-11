// src/systems/BattleSystem.js
import { 
  getTerrainById, 
  getTerrainEffectValue, 
  calculateTerrainDamageModifier,
  calculateTerrainRangeModifier,
  calculateTerrainCooldownModifier
} from '../data/terrains';

export class BattleSystem {
  constructor(cardSystem) {
    this.cardSystem = cardSystem;
    this.entities = new Map();
    this.currentTurn = null;
    this.turnOrder = [];
    this.eventListeners = new Set();
    this.terrainMap = new Map(); // 存储位置到地形的映射
  }

  registerEntity(id, entityData) {
    const entity = {
      id,
      health: entityData.maxHealth,
      maxHealth: entityData.maxHealth,
      shield: 0,
      defense: 0,
      attack: 1,
      effects: [],
      movementPath: [], // 记录移动轨迹
      ...entityData
    };
    
    this.entities.set(id, entity);
    return entity;
  }

  getEntity(id) {
    return this.entities.get(id);
  }

  // 设置地形
  setTerrain(x, y, terrainId) {
    this.terrainMap.set(`${x},${y}`, terrainId);
    this.notifyListeners('terrain:set', { position: { x, y }, terrainId });
  }

  // 获取地形
  getTerrain(x, y) {
    return this.terrainMap.get(`${x},${y}`) || 'plain';
  }

  // 应用地形效果
  applyTerrainEffect(entityId, x, y, trigger = 'onEnter') {
    const entity = this.getEntity(entityId);
    if (!entity) return { success: false, error: 'Entity not found' };

    const terrainId = this.getTerrain(x, y);
    const terrainEffect = getTerrainEffectValue(terrainId, trigger);
    
    if (!terrainEffect) return { success: true, effects: [] };
    
    const effects = [];
    
    // 处理伤害效果
    if (terrainEffect.damage) {
      const damage = terrainEffect.damage;
      this.applyDamage(entityId, damage);
      effects.push({ type: 'damage', value: damage });
    }
    
    // 处理防御效果
    if (terrainEffect.defense) {
      const defense = terrainEffect.defense;
      this.applyDefense(entityId, defense);
      effects.push({ type: 'defense', value: defense });
    }
    
    // 处理能量效果
    if (terrainEffect.energy) {
      const energy = terrainEffect.energy;
      entity.energy = Math.min(entity.maxEnergy, (entity.energy || 0) + energy);
      effects.push({ type: 'energy', value: energy });
    }
    
    // 处理状态效果
    if (terrainEffect.status) {
      const status = terrainEffect.status;
      this.applyStatusEffect(entityId, status.type, status.value, status.duration);
      effects.push({ type: 'status', value: status });
    }
    
    this.notifyListeners('terrain:effect', {
      entityId,
      position: { x, y },
      terrainId,
      trigger,
      effects
    });
    
    return { success: true, effects };
  }

  applyShield(targetId, amount) {
    const target = this.getEntity(targetId);
    if (!target) return { success: false, error: 'Target not found' };

    const oldShield = target.shield;
    target.shield = (target.shield || 0) + amount;
    
    this.notifyListeners('shield:applied', {
      targetId,
      amount,
      oldValue: oldShield,
      newValue: target.shield
    });

    return { success: true, shield: target.shield };
  }

  applyDefense(targetId, amount) {
    const target = this.getEntity(targetId);
    if (!target) return { success: false, error: 'Target not found' };

    const oldDefense = target.defense;
    target.defense = (target.defense || 0) + amount;
    
    this.notifyListeners('defense:applied', {
      targetId,
      amount,
      oldValue: oldDefense,
      newValue: target.defense
    });

    return { success: true, defense: target.defense };
  }

  // 应用伤害
  applyDamage(targetId, amount) {
    const target = this.getEntity(targetId);
    if (!target) return { success: false, error: 'Target not found' };
    
    let remainingDamage = amount;
    
    // 先减少护盾
    if (target.shield > 0) {
      if (target.shield >= remainingDamage) {
        target.shield -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= target.shield;
        target.shield = 0;
      }
    }
    
    // 再减少防御
    if (remainingDamage > 0 && target.defense > 0) {
      if (target.defense >= remainingDamage) {
        target.defense -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= target.defense;
        target.defense = 0;
      }
    }
    
    // 最后减少生命值
    if (remainingDamage > 0) {
      target.health = Math.max(0, target.health - remainingDamage);
    }
    
    this.notifyListeners('damage:applied', {
      targetId,
      amount,
      remainingHealth: target.health
    });
    
    return { success: true, damage: amount, remainingHealth: target.health };
  }

  // 应用状态效果
  applyStatusEffect(targetId, effectType, value, duration) {
    const target = this.getEntity(targetId);
    if (!target) return { success: false, error: 'Target not found' };
    
    // 检查是否已有相同类型的效果
    const existingEffectIndex = target.effects.findIndex(e => e.type === effectType);
    
    if (existingEffectIndex >= 0) {
      // 更新现有效果
      const existingEffect = target.effects[existingEffectIndex];
      existingEffect.value = Math.max(existingEffect.value, value);
      existingEffect.duration = Math.max(existingEffect.duration, duration);
    } else {
      // 添加新效果
      target.effects.push({
        type: effectType,
        value,
        duration
      });
    }
    
    this.notifyListeners('status:applied', {
      targetId,
      effectType,
      value,
      duration
    });
    
    return { success: true, effect: { type: effectType, value, duration } };
  }

  // 修改后的卡牌使用方法，考虑地形效果
  playCard(sourceId, cardId, targetId, targetPosition) {
    const source = this.getEntity(sourceId);
    const target = this.getEntity(targetId);
    const card = this.cardSystem.getCardById(cardId);

    if (!source || !target || !card) {
      return { success: false, error: 'Invalid source, target, or card' };
    }
    
    // 获取目标位置的地形
    const terrainId = targetPosition ? this.getTerrain(targetPosition.x, targetPosition.y) : 'plain';
    
    // 根据地形修改卡牌效果
    const modifiedCard = this.applyTerrainToCard(card, terrainId);
    
    // 应用移动轨迹加成
    if (source.movementPath && source.movementPath.length > 0) {
      modifiedCard = this.applyMovementBonus(modifiedCard, source.movementPath);
    }

    const result = this.cardSystem.applyCardEffect(modifiedCard, target, source);
    
    if (result.success) {
      // 消耗能量
      source.energy -= modifiedCard.energyCost;
      
      this.notifyListeners('card:played', {
        sourceId,
        targetId,
        cardId,
        terrainId,
        effects: result.effects
      });
    }

    return result;
  }

  // 根据地形修改卡牌效果
  applyTerrainToCard(card, terrainId) {
    if (!card || !terrainId) return card;
    
    // 创建卡牌的副本以避免修改原始卡牌
    const modifiedCard = { ...card };
    
    // 修改伤害
    if (modifiedCard.damage) {
      modifiedCard.damage = calculateTerrainDamageModifier(
        terrainId, 
        modifiedCard.element || 'neutral', 
        modifiedCard.damage
      );
    }
    
    // 修改范围
    if (modifiedCard.range) {
      modifiedCard.range = calculateTerrainRangeModifier(
        terrainId,
        modifiedCard.element || 'neutral',
        modifiedCard.range
      );
    }
    
    // 修改冷却
    if (modifiedCard.cooldown) {
      modifiedCard.cooldown = calculateTerrainCooldownModifier(
        terrainId,
        modifiedCard.element || 'neutral',
        modifiedCard.cooldown
      );
    }
    
    return modifiedCard;
  }

  // 应用移动轨迹加成
  applyMovementBonus(card, movementPath) {
    if (!card || !movementPath || movementPath.length === 0) return card;
    
    // 创建卡牌的副本
    const modifiedCard = { ...card };
    
    // 根据移动轨迹长度应用加成
    const pathLength = movementPath.length;
    
    // 不同类型的卡牌有不同的移动加成规则
    switch (modifiedCard.type) {
      case 'attack':
        // 攻击卡：移动后伤害提升
        if (modifiedCard.damage && pathLength > 0) {
          const bonus = Math.min(0.45, pathLength * 0.15); // 最多+45%
          modifiedCard.damage = Math.floor(modifiedCard.damage * (1 + bonus));
          modifiedCard.movementBonus = Math.floor(bonus * 100);
        }
        break;
        
      case 'defense':
        // 防御卡：静止时效果提升
        if (modifiedCard.shield && pathLength === 0) {
          modifiedCard.shield = Math.floor(modifiedCard.shield * 1.5); // +50%
          modifiedCard.movementBonus = 50;
        }
        break;
        
      case 'heal':
        // 治疗卡：特定移动模式触发额外效果
        // 这里简化为：移动3格以上获得额外治疗
        if (modifiedCard.healing && pathLength >= 3) {
          modifiedCard.healing = Math.floor(modifiedCard.healing * 1.3); // +30%
          modifiedCard.movementBonus = 30;
        }
        break;
    }
    
    return modifiedCard;
  }

  startTurn(entityId) {
    const entity = this.getEntity(entityId);
    if (!entity) return { success: false, error: 'Entity not found' };

    this.currentTurn = entityId;
    
    // 重置防御值
    entity.defense = 0;
    
    // 处理地形的回合开始效果
    if (entity.position) {
      this.applyTerrainEffect(
        entityId, 
        entity.position.x, 
        entity.position.y, 
        'onTurnStart'
      );
    }
    
    // 处理状态效果
    this.processEffects(entityId);
    
    this.notifyListeners('turn:started', { entityId });
    return { success: true };
  }

  endTurn(entityId) {
    if (this.currentTurn !== entityId) {
      return { success: false, error: 'Not this entity\'s turn' };
    }

    const nextIndex = (this.turnOrder.indexOf(entityId) + 1) % this.turnOrder.length;
    const nextEntityId = this.turnOrder[nextIndex];
    
    // 处理地形的回合结束效果
    const entity = this.getEntity(entityId);
    if (entity && entity.position) {
      this.applyTerrainEffect(
        entityId, 
        entity.position.x, 
        entity.position.y, 
        'onTurnEnd'
      );
    }
    
    // 清空移动轨迹
    if (entity) {
      entity.movementPath = [];
    }
    
    this.notifyListeners('turn:ended', { entityId });
    this.startTurn(nextEntityId);
    
    return { success: true };
  }

  // 记录移动轨迹
  recordMovement(entityId, fromPosition, toPosition) {
    const entity = this.getEntity(entityId);
    if (!entity) return;
    
    // 添加新位置到移动轨迹
    entity.movementPath = entity.movementPath || [];
    entity.movementPath.push(toPosition);
    
    // 如果轨迹超过5个点，只保留最近的5个
    if (entity.movementPath.length > 5) {
      entity.movementPath = entity.movementPath.slice(entity.movementPath.length - 5);
    }
    
    // 应用进入新地形的效果
    this.applyTerrainEffect(entityId, toPosition.x, toPosition.y, 'onEnter');
    
    this.notifyListeners('entity:moved', {
      entityId,
      from: fromPosition,
      to: toPosition,
      path: entity.movementPath
    });
  }

  processEffects(entityId) {
    const entity = this.getEntity(entityId);
    if (!entity) return;

    const expiredEffects = [];
    const activeEffects = entity.effects.filter(effect => {
      // 处理效果
      if (effect.type === 'burn') {
        this.applyDamage(entityId, effect.value);
      } else if (effect.type === 'poison') {
        this.applyDamage(entityId, effect.value);
      } else if (effect.type === 'regeneration') {
        entity.health = Math.min(entity.maxHealth, entity.health + effect.value);
      }
      
      // 减少持续时间
      if (effect.duration > 0) {
        effect.duration--;
        if (effect.duration === 0) {
          expiredEffects.push(effect);
          return false;
        }
      }
      return true;
    });

    entity.effects = activeEffects;
    
    this.notifyListeners('effects:processed', {
      entityId,
      expired: expiredEffects,
      active: activeEffects
    });
  }

  addEventListener(callback) {
    this.eventListeners.add(callback);
  }

  removeEventListener(callback) {
    this.eventListeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.eventListeners.forEach(callback => callback(event, data));
  }
}