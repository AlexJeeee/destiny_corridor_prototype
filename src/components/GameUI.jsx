import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import Card from './Card';
import Character from './Character';

const GameUI = ({ onEndTurn }) => {
  const { state, cardSystem, battleSystem } = useGame();
  const { player, currentEnemies, phase, selectedCard, turnNumber } = state;
  
  // Current turn character
  const currentTurn = battleSystem.getCurrentTurnCharacter();
  const isPlayerTurn = currentTurn && currentTurn.id === player.id;
  
  // Handle card play
  const handleCardPlay = (card) => {
    // Ensure it's player's turn and they have enough energy
    if (!isPlayerTurn || player.energy < card.energyCost) return;
    
    cardSystem.selectCard(card);
  };
  
  // Cancel card selection
  const handleCancelCardSelection = () => {
    cardSystem.cancelCardSelection();
  };
  
  return (
    <div className="game-ui w-full h-full flex flex-col">
      {/* Top bar - turn info and stats */}
      <div className="p-2 bg-gray-800 flex justify-between items-center">
        <div>
          <span className="text-sm mr-4">Floor: {state.currentFloor}/{state.totalFloors}</span>
          <span className="text-sm">Turn: {turnNumber}</span>
        </div>
        
        <div className="text-center font-bold">
          {phase === 'battle' && (
            <span className={isPlayerTurn ? 'text-blue-400' : 'text-red-400'}>
              {isPlayerTurn ? 'Your Turn' : "Enemy's Turn"}
            </span>
          )}
        </div>
        
        <div>
          <span className="text-sm mr-2">Destiny Coins: {state.destinyCoins}</span>
          {phase === 'battle' && isPlayerTurn && (
            <button 
              className="bg-purple-700 hover:bg-purple-600 px-3 py-1 text-sm rounded"
              onClick={onEndTurn}
            >
              End Turn
            </button>
          )}
        </div>
      </div>
      
      {/* Main game area - filled by BattleGrid component */}
      <div className="flex-1 relative">
        {/* Controlled by parent component */}
      </div>
      
      {/* Bottom area - hand cards */}
      <div className="p-2 bg-gray-800 border-t border-gray-700">
        <div className="text-sm mb-1">Hand ({player.hand.length} / {player.maxHandSize})</div>
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-2">
          {player.hand.map((card, index) => (
            <Card 
              key={`hand-card-${index}`}
              card={card}
              isPlayable={isPlayerTurn && player.energy >= card.energyCost}
              onCardPlay={handleCardPlay}
              // Highlight selected card
              className={selectedCard && selectedCard.id === card.id ? 'ring-4 ring-white' : ''}
            />
          ))}
        </div>
      </div>
      
      {/* Selected card action panel */}
      {selectedCard && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 p-4 bg-gray-900 border border-gray-600 rounded-lg">
          <div className="font-bold mb-2">Select target for {selectedCard.name}</div>
          <button 
            className="bg-red-700 hover:bg-red-600 px-3 py-1 text-sm rounded mr-2"
            onClick={handleCancelCardSelection}
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Side panels - Player & Enemy info */}
      <div className="absolute top-24 left-4 w-64">
        <Character character={player} isPlayer={true} isActive={isPlayerTurn} />
      </div>
      
      {currentEnemies.length > 0 && (
        <div className="absolute top-24 right-4 w-64">
          {currentEnemies.map((enemy, index) => (
            <Character 
              key={`enemy-${index}`} 
              character={enemy}
              isActive={currentTurn && currentTurn.id === enemy.id}
              className="mb-2"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameUI;