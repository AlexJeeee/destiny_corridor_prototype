import EventBus from './EventBus';
import { cards, getCardsByDeckType } from '../data/cards';
import { TERRAINS } from '../data/terrains';
import { hexDistance } from '../utils/hexUtils';

class GameManager {
  constructor() {
    this.eventBus = new EventBus();
    this.state = {
      player: {
        position: { x: 0, y: 0 },
        health: 100,
        maxHealth: 100,
        energy: 3,
        maxEnergy: 3,
        hand: [],
        deck: [],  // 先设置为空数组
        discardPile: [],
        maxHandSize: 7,
        statusEffects: [],
        shield: 0,
        movementPath: []
      },
      enemies: [
        {
          id: 'enemy-1-' + Math.random().toString(36).substr(2, 9),
          position: { x: 4, y: 2 },
          health: 30,
          maxHealth: 30,
          statusEffects: [],
          shield: 0
        }
      ],
      terrain: {},
      currentTurn: 'player',
      turnCount: 1,
      selectedCard: null,
      targetingMode: false
    };
    
    // 订阅者列表
    this.subscribers = [];
    
    // 初始化战场地形
    this.initializeTerrain();
    
    // 初始化牌组
    this.initializeDeck();
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
    
    this.setState({ terrain });
  }

  // 初始化牌组
  initializeDeck() {
    // 根据角色类型初始化牌组
    const deckType = this.state.player.deckType || 'strength';
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
    this.setState({
      player: {
        ...this.state.player,
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

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.state); // 立即发送当前状态
  }

  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter(cb => cb !== callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  startTurn(character) {
    if (character === this.state.player) {
      // 先更新回合信息和能量
      this.setState({
        currentTurn: 'player',
        turnCount: this.state.turnCount + 1,
        player: {
          ...this.state.player,
          energy: this.state.player.maxEnergy,
          movementPath: [], // 清空移动轨迹
          hand: [] // 清空手牌
        }
      });

      // 抽新的手牌
      this.drawCards(this.state.player.maxHandSize);
      
      // 应用地形效果
      this.applyTerrainEffect(this.state.player, 'onTurnStart');
    } else {
      this.setState({ currentTurn: 'enemy' });
      // 这里可以添加AI逻辑
    }
  }

  drawCards(count) {
    console.log('抽牌开始，当前状态：', 
      this.state?.player?.deck ? this.state.player.deck.length : 'deck未初始化', 
      this.state?.player?.hand ? this.state.player.hand.length : 'hand未初始化');
    
    // 确保player和deck存在
    if (!this.state || !this.state.player) {
      console.error('游戏状态未初始化');
      return [];
    }
    
    // 确保deck是一个数组
    if (!Array.isArray(this.state.player.deck) || this.state.player.deck.length === 0) {
      // 如果deck不是数组或为空，重新初始化它
      const newDeck = getCardsByDeckType('strength').map(card => ({ 
        ...card, 
        id: `${card.id}-${Math.random().toString(36).substr(2, 9)}` // 添加唯一ID
      }));
      console.log('重新初始化牌组，新牌组大小：', newDeck.length);
      
      this.setState({
        player: {
          ...this.state.player,
          deck: newDeck
        }
      });
      
      // 递归调用自己，确保状态更新后再抽牌
      setTimeout(() => this.drawCards(count), 0);
      return [];
    }

    // 确保hand是一个数组
    if (!Array.isArray(this.state.player.hand)) {
      this.setState({
        player: {
          ...this.state.player,
          hand: []
        }
      });
      
      // 递归调用自己，确保状态更新后再抽牌
      setTimeout(() => this.drawCards(count), 0);
      return [];
    }

    const currentDeck = [...this.state.player.deck];
    const currentHand = [...this.state.player.hand];
    const drawnCards = [];
    
    // 计算可以抽几张牌
    const availableSlots = this.state.player.maxHandSize - currentHand.length;
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
    this.setState({
      player: {
        ...this.state.player,
        deck: currentDeck,
        hand: [...currentHand, ...drawnCards]
      }
    });
    
    console.log('抽牌完成，新手牌数量：', currentHand.length + drawnCards.length);
    return drawnCards;
  }

  // 触发游戏事件
  triggerGameEvent(eventData) {
    // 添加唯一事件ID
    const eventWithId = {
      ...eventData,
      id: `${eventData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const event = new CustomEvent('game_event', { detail: eventWithId });
    window.dispatchEvent(event);
    console.log('触发游戏事件:', eventWithId);
  }

  // 移动角色
  moveCharacter(character, newPosition) {
    if (!character || !newPosition) return false;
    
    // 检查目标位置是否被占用
    const isOccupied = this.state.enemies.some(enemy => 
      enemy.position.x === newPosition.x && enemy.position.y === newPosition.y
    ) || (
      this.state.player.position.x === newPosition.x && 
      this.state.player.position.y === newPosition.y
    );
    
    if (isOccupied) {
      console.log('目标位置已被占用');
      return false;
    }
    
    // 记录旧位置
    const oldPosition = { ...character.position };
    
    // 更新角色位置
    if (character === this.state.player) {
      // 更新玩家位置
      const movementPath = this.state.player.movementPath || [];
      
      this.setState({
        player: {
          ...this.state.player,
          position: newPosition,
          movementPath: [...movementPath, newPosition]
        }
      });
      
      // 触发移动事件
      this.triggerGameEvent({
        type: 'player_move',
        position: newPosition,
        oldPosition
      });
      
      // 应用地形效果
      this.applyTerrainEffect(this.state.player, 'onEnter');
    } else {
      // 更新敌人位置
      const updatedEnemies = this.state.enemies.map(enemy => {
        // 使用ID或位置来识别敌人
        if (enemy.id === character.id || 
            (enemy.position.x === character.position.x && 
             enemy.position.y === character.position.y)) {
          return {
            ...enemy,
            position: newPosition
          };
        }
        return enemy;
      });
      
      this.setState({ enemies: updatedEnemies });
      
      // 触发移动事件
      this.triggerGameEvent({
        type: 'enemy_move',
        position: newPosition,
        oldPosition
      });
      
      // 应用地形效果
      setTimeout(() => {
        const updatedEnemy = this.state.enemies.find(e => 
          e.position.x === newPosition.x && e.position.y === newPosition.y
        );
        if (updatedEnemy) {
          this.applyTerrainEffect(updatedEnemy, 'onEnter');
        }
      }, 0);
    }
    
    return true;
  }

  // 应用地形效果
  applyTerrainEffect(character, trigger) {
    // 获取角色所在的地形
    const position = character.position;
    const terrainType = this.state.terrain[`${position.x},${position.y}`];
    
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
          this.applyDamage(character, effect.value);
          console.log(`${terrainType}地形对${character === this.state.player ? '玩家' : '敌人'}造成了${effect.value}点伤害`);
          break;
        case 'heal':
          this.applyHeal(character, effect.value);
          console.log(`${terrainType}地形为${character === this.state.player ? '玩家' : '敌人'}恢复了${effect.value}点生命`);
          break;
        case 'energy':
          if (character === this.state.player) {
            this.setState({
              player: {
                ...this.state.player,
                energy: Math.min(this.state.player.energy + effect.value, this.state.player.maxEnergy)
              }
            });
            console.log(`${terrainType}地形为玩家恢复了${effect.value}点能量`);
          }
          break;
        case 'status':
          this.applyStatusEffect(character, effect.statusType, effect.value, effect.duration);
          console.log(`${terrainType}地形对${character === this.state.player ? '玩家' : '敌人'}施加了${effect.statusType}状态`);
          break;
      }
    }
  }

  // 对角色造成伤害
  applyDamage(character, amount) {
    console.log(`对角色造成${amount}点伤害`);
    
    if (!character) {
      console.error('无效的角色');
      return;
    }
    
    // 计算实际伤害
    const actualDamage = Math.max(0, amount);
    
    if (character === this.state.player) {
      // 对玩家造成伤害
      const newHealth = Math.max(0, this.state.player.health - actualDamage);
      
      this.setState({
        player: {
          ...this.state.player,
          health: newHealth
        }
      });
      
      console.log(`玩家受到${actualDamage}点伤害，剩余生命值: ${newHealth}`);
    } else {
      // 对敌人造成伤害
      const updatedEnemies = this.state.enemies.map(enemy => {
        if (enemy === character) {
          const newHealth = Math.max(0, enemy.health - actualDamage);
          console.log(`敌人受到${actualDamage}点伤害，剩余生命值: ${newHealth}`);
          
          return {
            ...enemy,
            health: newHealth
          };
        }
        return enemy;
      });
      
      // 检查敌人是否死亡
      const deadEnemies = updatedEnemies.filter(enemy => enemy.health <= 0);
      if (deadEnemies.length > 0) {
        console.log(`${deadEnemies.length}个敌人死亡`);
      }
      
      this.setState({ enemies: updatedEnemies });
    }
  }

  // 应用防御
  applyDefense(character, amount) {
    if (character === this.state.player) {
      this.setState({
        player: {
          ...this.state.player,
          defense: this.state.player.defense + amount
        }
      });
    } else {
      // 处理敌人获得防御
      const updatedEnemies = this.state.enemies.map(enemy => {
        if (enemy === character) {
          return {
            ...enemy,
            defense: (enemy.defense || 0) + amount
          };
        }
        return enemy;
      });
      
      this.setState({ enemies: updatedEnemies });
    }
  }

  // 应用状态效果
  applyStatusEffect(character, effectType, value, duration) {
    if (character === this.state.player) {
      const effects = [...this.state.player.statusEffects];
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
      
      this.setState({
        player: {
          ...this.state.player,
          statusEffects: effects
        }
      });
    } else {
      // 处理敌人获得状态效果
      const updatedEnemies = this.state.enemies.map(enemy => {
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
      
      this.setState({ enemies: updatedEnemies });
    }
  }

  applyCardEffect(card, source, target) {
    console.log('应用卡牌效果:', card, source, target);
    
    if (!card) {
      return { success: false, error: '无效的卡牌' };
    }
    
    if (!source) {
      return { success: false, error: '无效的来源' };
    }
    
    // 检查能量是否足够
    if (source === this.state.player && this.state.player.energy < card.energyCost) {
      return { success: false, error: '能量不足' };
    }
    
    // 消耗能量
    if (source === this.state.player) {
      this.setState({
        player: {
          ...this.state.player,
          energy: this.state.player.energy - card.energyCost
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
        const terrain = this.state.terrain[`${source.position.x},${source.position.y}`];
        if (terrain === 'fire' && card.attribute === 'fire') {
          damage *= 1.2; // 火焰地形增加火系卡牌伤害
        }
        
        // 应用伤害
        this.applyDamage(target, damage);
        effects.push({ type: 'damage', value: damage });
        
        // 触发卡牌效果事件
        this.triggerGameEvent({
          type: 'card_effect',
          cardName: card.name,
          effect: `造成${damage}点伤害`,
          position: target.position
        });
        break;
        
      case 'defense':
      case 'shield':
        // 防御卡通常应用于自己
        const shieldAmount = card.shield || card.normalEffect?.value || 5;
        this.applyDefense(source, shieldAmount);
        effects.push({ type: 'shield', value: shieldAmount });
        
        // 触发卡牌效果事件
        this.triggerGameEvent({
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
        this.applyHeal(healTarget, healAmount);
        effects.push({ type: 'heal', value: healAmount });
        
        // 触发卡牌效果事件
        this.triggerGameEvent({
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
              this.applyDamage(target, card.normalEffect.value);
              effects.push({ type: 'damage', value: card.normalEffect.value });
              
              // 触发卡牌效果事件
              this.triggerGameEvent({
                type: 'card_effect',
                cardName: card.name,
                effect: `造成${card.normalEffect.value}点伤害`,
                position: target.position
              });
              break;
              
            case 'shield':
              this.applyDefense(source, card.normalEffect.value);
              effects.push({ type: 'shield', value: card.normalEffect.value });
              
              // 触发卡牌效果事件
              this.triggerGameEvent({
                type: 'card_effect',
                cardName: card.name,
                effect: `获得${card.normalEffect.value}点护盾`,
                position: source.position
              });
              break;
              
            case 'heal':
              const healTarget = target || source;
              this.applyHeal(healTarget, card.normalEffect.value);
              effects.push({ type: 'heal', value: card.normalEffect.value });
              
              // 触发卡牌效果事件
              this.triggerGameEvent({
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

  // 结束回合
  endTurn() {
    if (this.state.currentTurn === 'player') {
      // 结束玩家回合
      const updatedPlayer = {
        ...this.state.player,
        hand: [] // 清空手牌
      };

      this.setState({
        currentTurn: 'enemy',
        player: updatedPlayer
      });
      
      // 确保状态更新后再执行敌人回合
      setTimeout(() => {
        console.log('执行敌人回合...');
        this.performEnemyTurn();
      }, 100);
    }
  }

  // 执行敌人回合
  performEnemyTurn() {
    console.log('执行敌人回合');
    
    // 检查游戏状态
    if (!this.state || !this.state.enemies || !this.state.player) {
      console.error('游戏状态无效，无法执行敌人回合');
      return;
    }
    
    // 获取所有敌人
    const enemies = [...this.state.enemies];
    console.log(`敌人数量: ${enemies.length}`);
    
    let playerDamaged = false;
    
    // 对每个敌人执行AI
    for (const enemy of enemies) {
      // 如果敌人已经死亡，跳过
      if (!enemy || enemy.health <= 0) {
        console.log('敌人已死亡，跳过');
        continue;
      }
      
      // 检查敌人位置
      if (!enemy.position || typeof enemy.position.x !== 'number' || typeof enemy.position.y !== 'number') {
        console.error('敌人位置无效:', enemy.position);
        continue;
      }
      
      console.log(`处理敌人 ${enemy.id} 在位置 (${enemy.position.x}, ${enemy.position.y})`);
      
      // 计算与玩家的距离
      const distanceToPlayer = hexDistance(
        enemy.position,
        this.state.player.position
      );
      
      console.log(`敌人距离玩家: ${distanceToPlayer}`);
      
      if (distanceToPlayer <= 1) {
        // 敌人攻击玩家
        const damage = 5; // 基础伤害
        console.log(`敌人攻击玩家，造成${damage}点伤害`);
        
        this.applyDamage(this.state.player, damage);
        playerDamaged = true;
        
        // 触发攻击事件
        this.triggerGameEvent({
          type: 'enemy_attack',
          damage,
          position: enemy.position
        });
      } else {
        // 敌人向玩家移动
        const dx = this.state.player.position.x - enemy.position.x;
        const dy = this.state.player.position.y - enemy.position.y;
        
        // 计算移动方向
        const moveX = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
        const moveY = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;
        
        // 移动敌人
        const newPosition = {
          x: enemy.position.x + moveX,
          y: enemy.position.y + moveY
        };
        
        console.log(`敌人尝试移动到 (${newPosition.x}, ${newPosition.y})`);
        
        // 尝试移动
        const moveResult = this.moveCharacter(enemy, newPosition);
        console.log(`移动结果: ${moveResult ? '成功' : '失败'}`);
      }
    }
    
    // 移除已死亡的敌人
    const aliveEnemies = enemies.filter(enemy => enemy && enemy.health > 0);
    
    // 如果有敌人死亡，更新状态
    if (aliveEnemies.length < enemies.length) {
      console.log(`${enemies.length - aliveEnemies.length}个敌人被击败`);
      this.triggerGameEvent({
        type: 'enemy_defeated',
        count: enemies.length - aliveEnemies.length
      });
    }
    
    // 更新敌人状态
    this.setState({ enemies: aliveEnemies });
    
    // 如果玩家受到伤害，显示消息
    if (playerDamaged) {
      console.log('玩家受到了伤害');
    }
    
    // 延迟后回到玩家回合
    setTimeout(() => {
      // 检查玩家是否死亡
      if (this.state.player.health <= 0) {
        console.log('玩家死亡，游戏结束');
        this.triggerGameEvent({
          type: 'player_defeated'
        });
        return;
      }
      
      console.log('敌人回合结束，回到玩家回合');
      
      this.setState({
        currentTurn: 'player',
        turnCount: this.state.turnCount + 1,
        player: {
          ...this.state.player,
          energy: this.state.player.maxEnergy
        }
      });
      
      // 抽新的手牌
      this.drawCards(this.state.player.maxHandSize);
      
      // 应用地形效果
      this.applyTerrainEffect(this.state.player, 'onTurnStart');
    }, 1000);
  }

  // 治疗角色
  applyHeal(character, amount) {
    if (character === this.state.player) {
      const newHealth = Math.min(this.state.player.health + amount, this.state.player.maxHealth);
      this.setState({
        player: {
          ...this.state.player,
          health: newHealth
        }
      });
    } else {
      // 更新敌人生命值
      const updatedEnemies = this.state.enemies.map(enemy => {
        if (enemy === character) {
          return {
            ...enemy,
            health: Math.min(enemy.health + amount, enemy.maxHealth)
          };
        }
        return enemy;
      });
      
      this.setState({ enemies: updatedEnemies });
    }
  }
}

export default GameManager;