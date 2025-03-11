/**
 * CardSystem.js
 * System for managing card interactions and effects
 */
import { cards, getCardsByDeckType } from '../data/cards';
import { getCharacterById } from '../data/characters';

class CardSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.eventBus = gameManager.eventBus;
  }
  
  /**
   * Generate a starting deck based on character
   * @param {Object} character - Character data
   * @returns {Array} Array of card objects
   */
  generateStartingDeck(character) {
    if (!character) return [];
    
    // Get character's starting deck type
    const deckType = character.startingDeckType;
    
    // Get cards for this deck type
    const deckCards = getCardsByDeckType(deckType);
    
    // Create a simple starting deck
    const basicDeck = [
      // Add character's special cards
      ...character.specialCards,
      // Add some basic cards
      'basic-strike', 'basic-strike',
      'basic-block', 'basic-block',
      'tactical-move',
    ];
    
    // Add some type-specific cards based on deck type
    if (deckType === 'strength') {
      basicDeck.push('earth-spike', 'stone-wall');
    } else if (deckType === 'arcane') {
      basicDeck.push('fire-strike', 'frost-bolt');
    } else if (deckType === 'agility') {
      basicDeck.push('swift-gust', 'wind-slash');
    }
    
    return basicDeck;
  }
  
  /**
   * Draw cards from deck to hand
   * @param {number} count - Number of cards to draw
   * @returns {Array} Array of drawn cards
   */
  drawCards(count = 1) {
    const deck = this.gameManager.state.deck;
    const hand = this.gameManager.state.hand;
    const discardPile = this.gameManager.state.discardPile;
    
    const drawnCards = [];
    
    for (let i = 0; i < count; i++) {
      // If deck is empty, shuffle discard pile into deck
      if (deck.length === 0) {
        const shuffledDiscard = [...discardPile].sort(() => 0.5 - Math.random());
        this.gameManager.state.deck = shuffledDiscard;
        this.gameManager.state.discardPile = [];
        
        this.eventBus.emit('deck:shuffled', {
          deckSize: shuffledDiscard.length
        });
      }
      
      // Draw a card if there are any left
      if (this.gameManager.state.deck.length > 0) {
        const card = this.gameManager.state.deck.pop();
        drawnCards.push(card);
        this.gameManager.state.hand.push(card);
        
        this.eventBus.emit('card:drawn', { card });
      }
    }
    
    return drawnCards;
  }
  
  /**
   * Get a card by ID
   * @param {string} cardId - ID of the card to retrieve
   * @returns {Object} Card data object
   */
  getCardById(cardId) {
    return cards.find(card => card.id === cardId);
  }
  
  /**
   * Play a card
   * @param {string} cardId - ID of the card to play
   * @param {Object} target - Target data (depends on card type)
   * @param {boolean} isReversed - Whether to use reversed effect
   * @returns {boolean} Success or failure
   */
  playCard(cardId, target, isReversed = false) {
    // Get card data
    const card = this.getCardById(cardId);
    if (!card) return false;
    
    // Check if player has enough energy
    const playerEnergy = this.gameManager.state.playerCharacter.energy;
    if (playerEnergy < card.energyCost) return false;
    
    // Get current effect based on orientation
    const effect = isReversed ? card.reversedEffect : card.normalEffect;
    
    // Spend energy
    this.gameManager.state.playerCharacter.energy -= card.energyCost;
    
    // Emit event for card played
    this.eventBus.emit('card:played', {
      card,
      target,
      isReversed,
      effect
    });
    
    return true;
  }
  
  /**
   * Check if card would flip based on terrain
   * @param {string} cardId - ID of the card
   * @param {string} terrainId - ID of the terrain
   * @returns {boolean} Whether card would flip
   */
  wouldCardFlip(cardId, terrainId) {
    const card = this.getCardById(cardId);
    if (!card) return false;
    
    // Get terrain data
    const terrain = this.gameManager.hexGridSystem.getTerrainById(terrainId);
    if (!terrain || !terrain.cardInteractions) return false;
    
    // Check if terrain flips this card attribute
    return terrain.cardInteractions.flip.includes(card.attribute);
  }
  
  /**
   * Calculate damage modifier based on card and terrain
   * @param {string} cardId - ID of the card
   * @param {string} terrainId - ID of the terrain
   * @returns {number} Damage modifier (1.0 = no change)
   */
  getDamageModifier(cardId, terrainId) {
    const card = this.getCardById(cardId);
    if (!card) return 1.0;
    
    // Get terrain data
    const terrain = this.gameManager.hexGridSystem.getTerrainById(terrainId);
    if (!terrain || !terrain.cardInteractions) return 1.0;
    
    // Check if terrain boosts this card attribute
    if (terrain.cardInteractions.boost.includes(card.attribute)) {
      return 1.2; // +20% damage
    }
    
    // Check if terrain nullifies this card attribute
    if (terrain.cardInteractions.nullify.includes(card.attribute)) {
      return 0.8; // -20% damage
    }
    
    return 1.0;
  }
}

export default CardSystem;