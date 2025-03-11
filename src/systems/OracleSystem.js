// src/systems/OracleSystem.js
export class OracleSystem {
  constructor() {
    this.blessings = new Map();
    this.activeBlessings = new Map();
  }

  registerBlessing(id, blessing) {
    this.blessings.set(id, {
      id,
      ...blessing,
      requirements: blessing.requirements || []
    });
  }

  initializeBlessings() {
    // Register default blessings
    this.registerBlessing('strength', {
      name: 'Blessing of Strength',
      description: 'Increases attack damage by 2',
      type: 'combat',
      duration: 3,
      effect: {
        type: 'damage_boost',
        value: 2
      },
      icon: '💪'
    });

    this.registerBlessing('protection', {
      name: 'Blessing of Protection',
      description: 'Increases shield gained by 50%',
      type: 'defense',
      duration: 3,
      effect: {
        type: 'shield_boost',
        value: 50
      },
      icon: '🛡️'
    });

    this.registerBlessing('healing', {
      name: 'Blessing of Vitality',
      description: 'Heal 2 HP at the start of each turn',
      type: 'healing',
      duration: 3,
      effect: {
        type: 'heal_over_time',
        value: 2
      },
      icon: '💚'
    });

    this.registerBlessing('swiftness', {
      name: 'Blessing of Swiftness',
      description: 'Gain 1 extra movement range',
      type: 'utility',
      duration: 3,
      effect: {
        type: 'movement_boost',
        value: 1
      },
      icon: '💨'
    });
  }

  getAvailableBlessings(playerStats) {
    return Array.from(this.blessings.values()).filter(blessing =>
      this.checkBlessingRequirements(blessing, playerStats)
    );
  }

  checkBlessingRequirements(blessing, playerStats) {
    return blessing.requirements.every(req => {
      switch (req.type) {
        case 'health_percentage':
          return (playerStats.health / playerStats.maxHealth) * 100 <= req.value;
        case 'energy':
          return playerStats.energy >= req.value;
        case 'card_played':
          return playerStats.cardsPlayed?.includes(req.cardType);
        default:
          return true;
      }
    });
  }

  activateBlessing(entityId, blessingId) {
    const blessing = this.blessings.get(blessingId);
    if (!blessing) return false;

    const entityBlessings = this.activeBlessings.get(entityId) || [];
    
    // Remove existing blessing of the same type
    const filteredBlessings = entityBlessings.filter(b => 
      this.blessings.get(b.id)?.type !== blessing.type
    );

    // Add new blessing
    this.activeBlessings.set(entityId, [
      ...filteredBlessings,
      {
        id: blessingId,
        startTime: Date.now(),
        duration: blessing.duration,
        effect: blessing.effect
      }
    ]);

    return true;
  }

  getActiveBlessings(entityId) {
    return this.activeBlessings.get(entityId) || [];
  }

  updateBlessings(entityId) {
    const blessings = this.activeBlessings.get(entityId);
    if (!blessings) return [];

    const expiredBlessings = [];
    const remainingBlessings = blessings.filter(blessing => {
      const isExpired = (Date.now() - blessing.startTime) >= blessing.duration * 1000;
      if (isExpired) {
        expiredBlessings.push(blessing);
      }
      return !isExpired;
    });

    this.activeBlessings.set(entityId, remainingBlessings);
    return expiredBlessings;
  }

  applyBlessingEffects(entityId, context) {
    const blessings = this.activeBlessings.get(entityId);
    if (!blessings) return;

    blessings.forEach(blessing => {
      const blessingData = this.blessings.get(blessing.id);
      if (!blessingData) return;

      switch (blessing.effect.type) {
        case 'heal_over_time':
          context.healthSystem?.modifyHealth(entityId, blessing.effect.value, 'heal');
          break;
        case 'damage_boost':
          context.combatSystem?.addTemporaryEffect(entityId, {
            type: 'damage_modifier',
            value: blessing.effect.value,
            duration: 1
          });
          break;
        case 'shield_boost':
          context.combatSystem?.addTemporaryEffect(entityId, {
            type: 'shield_modifier',
            value: blessing.effect.value,
            duration: 1
          });
          break;
        case 'movement_boost':
          context.movementSystem?.addTemporaryEffect(entityId, {
            type: 'movement_modifier',
            value: blessing.effect.value,
            duration: 1
          });
          break;
      }
    });
  }
}