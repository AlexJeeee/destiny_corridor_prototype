// src/systems/CardSystem.js
export class CardSystem {
  constructor() {
    this.cards = new Map();
    this.eventListeners = new Set();
  }

  registerCard(id, cardData) {
    this.cards.set(id, {
      id,
      ...cardData,
      isFlipped: false
    });
  }

  getCardById(id) {
    // 尝试直接获取卡牌
    let card = this.cards.get(id);
    
    // 如果没有找到，尝试去掉随机后缀再查找
    if (!card && id.includes('-')) {
      const baseId = id.split('-')[0];
      card = this.cards.get(baseId);
    }
    
    return card;
  }

  applyCardEffect(card, target, source) {
    if (!card || !target) return { success: false, error: 'Invalid card or target' };

    const effects = [];
    
    // Calculate base damage if it's an attack card
    if (card.type === 'attack' && card.baseDamage) {
      let damage = card.baseDamage;
      
      // Apply source's attack multiplier
      if (source?.attack) {
        damage *= source.attack;
      }
      
      // Apply target's defense reduction
      if (target.defense) {
        damage = Math.max(0, damage - target.defense);
      }
      
      // Handle shield first
      if (target.shield > 0) {
        const shieldDamage = Math.min(target.shield, damage);
        target.shield -= shieldDamage;
        damage -= shieldDamage;
        effects.push({ type: 'shield_break', value: shieldDamage });
      }
      
      // Apply remaining damage to health
      if (damage > 0) {
        target.health = Math.max(0, target.health - damage);
        effects.push({ type: 'damage', value: damage });
      }
    }

    // Apply shield if it's a defense card
    if (card.type === 'defense' && card.shield) {
      target.shield = (target.shield || 0) + card.shield;
      effects.push({ type: 'shield', value: card.shield });
    }

    // Handle special effects
    if (card.effects) {
      card.effects.forEach(effect => {
        effects.push(this.applyEffect(effect, target));
      });
    }

    return { success: true, effects };
  }

  drawCard(player, amount = 1) {
    const drawnCards = [];
    
    for (let i = 0; i < amount; i++) {
      if (player.deck.length > 0) {
        const cardId = player.deck.pop();
        player.hand.push(cardId);
        drawnCards.push(cardId);
      }
    }

    this.notifyListeners('cards:drawn', { player, cards: drawnCards });
    return drawnCards;
  }

  flipCard(cardId, player) {
    const card = this.getCardById(cardId);
    if (!card) return { success: false, error: 'Card not found' };

    card.isFlipped = !card.isFlipped;
    
    if (card.isFlipped && card.flipEffect) {
      const effect = this.applyEffect(card.flipEffect, player);
      return { success: true, effect };
    }

    return { success: true };
  }

  applyEffect(effect, target) {
    switch (effect.type) {
      case 'heal':
        const healAmount = Math.min(
          effect.value,
          target.maxHealth - target.health
        );
        target.health += healAmount;
        return { type: 'heal', value: healAmount };

      case 'strength':
        target.attack = (target.attack || 1) * (1 + effect.value);
        return { type: 'buff', stat: 'attack', value: effect.value };

      case 'defense_up':
        target.defense = (target.defense || 0) + effect.value;
        return { type: 'buff', stat: 'defense', value: effect.value };

      default:
        return { type: effect.type, value: effect.value };
    }
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