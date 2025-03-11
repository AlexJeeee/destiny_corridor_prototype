// src/systems/HealthSystem.js
export class HealthSystem {
  constructor() {
    this.entities = new Map();
    this.effectTypes = new Set([
      'strength',
      'weakness',
      'burn',
      'freeze',
      'poison',
      'blessing'
    ]);
  }

  registerEntity(entityId, stats) {
    this.entities.set(entityId, {
      health: stats.maxHealth,
      maxHealth: stats.maxHealth,
      shield: 0,
      effects: [],
      ...stats
    });
  }

  getStats(entityId) {
    return this.entities.get(entityId);
  }

  modifyHealth(entityId, amount, type = 'damage') {
    const entity = this.entities.get(entityId);
    if (!entity) return 0;

    let actualAmount = amount;
    const changes = { health: 0, shield: 0 };

    if (type === 'damage') {
      // Handle shield first
      if (entity.shield > 0) {
        const shieldDamage = Math.min(entity.shield, actualAmount);
        entity.shield -= shieldDamage;
        actualAmount -= shieldDamage;
        changes.shield = -shieldDamage;
      }

      // Apply remaining damage to health
      if (actualAmount > 0) {
        const oldHealth = entity.health;
        entity.health = Math.max(0, entity.health - actualAmount);
        changes.health = entity.health - oldHealth;
      }
    } else if (type === 'heal') {
      const oldHealth = entity.health;
      entity.health = Math.min(entity.maxHealth, entity.health + actualAmount);
      changes.health = entity.health - oldHealth;
    }

    return changes;
  }

  addShield(entityId, amount) {
    const entity = this.entities.get(entityId);
    if (!entity) return 0;

    const oldShield = entity.shield;
    entity.shield += amount;
    return entity.shield - oldShield;
  }

  addEffect(entityId, effect) {
    if (!this.effectTypes.has(effect.type)) {
      throw new Error(`Invalid effect type: ${effect.type}`);
    }

    const entity = this.entities.get(entityId);
    if (!entity) return false;

    // Remove existing effect of the same type
    this.removeEffect(entityId, effect.type);

    entity.effects.push({
      ...effect,
      startTime: Date.now(),
      id: `${effect.type}_${Date.now()}`
    });

    return true;
  }

  removeEffect(entityId, effectType) {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    const initialLength = entity.effects.length;
    entity.effects = entity.effects.filter(e => e.type !== effectType);
    return entity.effects.length !== initialLength;
  }

  updateEffects(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) return [];

    const expiredEffects = [];
    entity.effects = entity.effects.filter(effect => {
      const isExpired = effect.duration > 0 && 
        (Date.now() - effect.startTime) >= effect.duration * 1000;
      
      if (isExpired) {
        expiredEffects.push(effect);
      }
      return !isExpired;
    });

    return expiredEffects;
  }

  applyEffects(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) return [];

    const appliedEffects = [];

    entity.effects.forEach(effect => {
      switch (effect.type) {
        case 'burn':
          const burnDamage = this.modifyHealth(entityId, effect.value, 'damage');
          appliedEffects.push({ ...effect, result: burnDamage });
          break;
        case 'poison':
          const poisonDamage = this.modifyHealth(entityId, effect.value, 'damage');
          appliedEffects.push({ ...effect, result: poisonDamage });
          break;
        case 'heal':
          const healing = this.modifyHealth(entityId, effect.value, 'heal');
          appliedEffects.push({ ...effect, result: healing });
          break;
      }
    });

    return appliedEffects;
  }
}