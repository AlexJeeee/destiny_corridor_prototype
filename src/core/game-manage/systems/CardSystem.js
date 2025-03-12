import { cards, getCardsByDeckType } from '../../../data/cards';
import { hexDistance } from '../../../utils/hexUtils';

/**
 * 卡牌系统 - 负责处理卡牌初始化、抽牌和卡牌效果
 */
class CardSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  // 初始化牌组
  initializeDeck() {
    const state = this.gameManager.getState();
    
    // 根据角色类型初始化牌组
    const deckType = state.player.deckType || 'strength';
    console.log(`初始化牌组，类型: ${deckType}`);
    
    // 获取对应类型的卡牌
    const deckCards = getCardsByDeckType(deckType);
    
    if (!deckCards || deckCards.length === 0) {
      console.error(`无法找到类型为 ${deckType} 的卡牌`);
      return;
    }
    
    // 为每张卡牌添加唯一ID
    const deck = deckCards.map(card => ({
      ...card,
      id: `${card.id}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    // 洗牌
    const shuffledDeck = this.shuffleArray([...deck]);
    
    // 更新状态
    this.gameManager.setState({
      player: {
        ...state.player,
        deck: shuffledDeck,
        discardPile: []
      }
    });
    
    console.log(`牌组初始化完成，共 ${shuffledDeck.length} 张卡牌`);
    
    // 初始抽牌
    setTimeout(() => {
      this.drawCards(5);
    }, 0);
  }

  // 洗牌算法
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // 抽牌
  drawCards(count) {
    const state = this.gameManager.getState();
    
    console.log('抽牌开始，当前状态：', 
      state?.player?.deck ? state.player.deck.length : 'deck未初始化', 
      state?.player?.hand ? state.player.hand.length : 'hand未初始化');
    
    // 确保player和deck存在
    if (!state || !state.player) {
      console.error('游戏状态未初始化');
      return [];
    }
    
    // 确保deck是一个数组
    if (!Array.isArray(state.player.deck) || state.player.deck.length === 0) {
      // 如果deck不是数组或为空，重新初始化它
      const newDeck = getCardsByDeckType('strength').map(card => ({ 
        ...card, 
        id: `${card.id}-${Math.random().toString(36).substr(2, 9)}` // 添加唯一ID
      }));
      console.log('重新初始化牌组，新牌组大小：', newDeck.length);
      
      this.gameManager.setState({
        player: {
          ...state.player,
          deck: newDeck
        }
      });
      
      // 递归调用自己，确保状态更新后再抽牌
      setTimeout(() => this.drawCards(count), 0);
      return [];
    }

    // 确保hand是一个数组
    if (!Array.isArray(state.player.hand)) {
      this.gameManager.setState({
        player: {
          ...state.player,
          hand: []
        }
      });
      
      // 递归调用自己，确保状态更新后再抽牌
      setTimeout(() => this.drawCards(count), 0);
      return [];
    }

    const currentDeck = [...state.player.deck];
    const currentHand = [...state.player.hand];
    const drawnCards = [];
    
    // 计算可以抽几张牌
    const availableSlots = state.player.maxHandSize - currentHand.length;
    const actualDrawCount = Math.min(count, availableSlots);
    
    console.log('可抽牌数：', actualDrawCount, '可用槽位：', availableSlots);
    
    if (actualDrawCount <= 0) {
      console.log('手牌已满，无法抽更多牌');
      return [];
    }
    
    // 如果牌组不够，重新生成牌组
    if (currentDeck.length < actualDrawCount) {
      console.log('牌组不足，添加新牌');
      const newCards = getCardsByDeckType('strength').map(card => ({ 
        ...card, 
        id: `${card.id}-${Math.random().toString(36).substr(2, 9)}` // 添加唯一ID
      }));
      currentDeck.push(...newCards);
    }
    
    // 抽牌
    for (let i = 0; i < actualDrawCount && currentDeck.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * currentDeck.length);
      const drawnCard = currentDeck.splice(randomIndex, 1)[0];
      // 确保每张牌有唯一ID
      if (!drawnCard.id.includes('-')) {
        drawnCard.id = `${drawnCard.id}-${Math.random().toString(36).substr(2, 9)}`;
      }
      drawnCards.push({ ...drawnCard }); // 复制卡牌
    }
    
    console.log('抽到的牌：', drawnCards.length, '剩余牌组：', currentDeck.length);

    // 更新状态
    this.gameManager.setState({
      player: {
        ...state.player,
        deck: currentDeck,
        hand: [...currentHand, ...drawnCards]
      }
    });
    
    console.log('抽牌完成，新手牌数量：', currentHand.length + drawnCards.length);
    return drawnCards;
  }

  // 应用卡牌效果
  applyCardEffect(card, source, target) {
    console.log('应用卡牌效果:', card, source, target);
    
    if (!card) {
      return { success: false, error: '无效的卡牌' };
    }
    
    if (!source) {
      return { success: false, error: '无效的来源' };
    }
    
    const state = this.gameManager.getState();
    
    // 检查能量是否足够
    if (source === state.player && state.player.energy < card.energyCost) {
      return { success: false, error: '能量不足' };
    }
    
    // 消耗能量
    if (source === state.player) {
      this.gameManager.setState({
        player: {
          ...state.player,
          energy: state.player.energy - card.energyCost
        }
      });
    }

    const effects = [];
    
    // 处理不同类型的卡牌
    switch (card.type) {
      case 'attack':
        // 需要目标
        if (!target) {
          return { success: false, error: '需要选择目标' };
        }
        
        // 检查距离是否在范围内
        if (card.range) {
          const distance = hexDistance(source.position, target.position);
          console.log('距离检查:', distance, card.range);
          if (distance > card.range) {
            return { success: false, error: '目标超出范围' };
          }
        }
        
        // 计算伤害
        let damage = card.damage || card.normalEffect?.value || 5;
        
        // 应用地形效果
        const terrain = state.terrain[`${source.position.x},${source.position.y}`];
        if (terrain === 'fire' && card.attribute === 'fire') {
          damage *= 1.2; // 火焰地形增加火系卡牌伤害
        }
        
        // 应用伤害
        this.gameManager.combatSystem.applyDamage(target, damage);
        effects.push({ type: 'damage', value: damage });
        
        // 触发卡牌效果事件
        this.gameManager.triggerGameEvent({
          type: 'card_effect',
          cardName: card.name,
          effect: `造成${damage}点伤害`,
          position: target.position
        });
        
        // 触发敌人受伤事件，用于战斗日志
        if (source === state.player && target !== state.player) {
          this.gameManager.triggerGameEvent({
            type: 'enemy_damaged',
            enemy: target,
            damage: damage,
            position: target.position
          });
        }
        break;
        
      case 'defense':
      case 'shield':
        // 防御卡通常应用于自己
        const shieldAmount = card.shield || card.normalEffect?.value || 5;
        this.gameManager.combatSystem.applyDefense(source, shieldAmount);
        effects.push({ type: 'shield', value: shieldAmount });
        
        // 触发卡牌效果事件
        this.gameManager.triggerGameEvent({
          type: 'card_effect',
          cardName: card.name,
          effect: `获得${shieldAmount}点护盾`,
          position: source.position
        });
        break;
        
      case 'heal':
        // 治疗卡可以应用于自己或队友
        const healTarget = target || source;
        const healAmount = card.heal || card.normalEffect?.value || 5;
        this.gameManager.combatSystem.applyHeal(healTarget, healAmount);
        effects.push({ type: 'heal', value: healAmount });
        
        // 触发卡牌效果事件
        this.gameManager.triggerGameEvent({
          type: 'card_effect',
          cardName: card.name,
          effect: `恢复${healAmount}点生命`,
          position: healTarget.position
        });
        break;
        
      default:
        // 其他类型的卡牌
        if (card.normalEffect) {
          switch (card.normalEffect.type) {
            case 'damage':
              if (!target) {
                return { success: false, error: '需要选择目标' };
              }
              this.gameManager.combatSystem.applyDamage(target, card.normalEffect.value);
              effects.push({ type: 'damage', value: card.normalEffect.value });
              
              // 触发卡牌效果事件
              this.gameManager.triggerGameEvent({
                type: 'card_effect',
                cardName: card.name,
                effect: `造成${card.normalEffect.value}点伤害`,
                position: target.position
              });
              break;
              
            case 'shield':
              this.gameManager.combatSystem.applyDefense(source, card.normalEffect.value);
              effects.push({ type: 'shield', value: card.normalEffect.value });
              
              // 触发卡牌效果事件
              this.gameManager.triggerGameEvent({
                type: 'card_effect',
                cardName: card.name,
                effect: `获得${card.normalEffect.value}点护盾`,
                position: source.position
              });
              break;
              
            case 'heal':
              const healTarget = target || source;
              this.gameManager.combatSystem.applyHeal(healTarget, card.normalEffect.value);
              effects.push({ type: 'heal', value: card.normalEffect.value });
              
              // 触发卡牌效果事件
              this.gameManager.triggerGameEvent({
                type: 'card_effect',
                cardName: card.name,
                effect: `恢复${card.normalEffect.value}点生命`,
                position: healTarget.position
              });
              break;
              
            default:
              console.log('未处理的效果类型:', card.normalEffect.type);
          }
        }
    }

    return { success: true, effects };
  }
}

export default CardSystem; 