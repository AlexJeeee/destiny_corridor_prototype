import React from 'react';
import { cards, getCardById } from '../data/cards';

// Card component displays a playable card with normal and reversed effects
const Card = ({ 
  cardId, 
  isReversed = false, 
  onPlay, 
  onFlip, 
  isSelected = false,
  isPlayable = true,
  size = 'medium',
  previewMode = false
}) => {
  // Get card data from the cards collection
  const baseCardId = cardId.split('-')[0]; // 获取基础卡牌ID，去掉随机后缀
  const cardData = getCardById(baseCardId);
  
  if (!cardData) {
    return <div className="text-red-500">Card not found: {baseCardId}</div>;
  }
  
  // Get current effect based on card orientation
  const currentEffect = isReversed ? cardData.reversedEffect : cardData.normalEffect;
  
  // Define card sizes
  const sizeClasses = {
    small: {
      container: "w-24 h-36",
      title: "text-xs",
      energy: "text-xs w-4 h-4",
      description: "text-xs",
    },
    medium: {
      container: "w-40 h-56",
      title: "text-sm",
      energy: "text-sm w-5 h-5",
      description: "text-xs",
    },
    large: {
      container: "w-48 h-64",
      title: "text-lg",
      energy: "text-base w-6 h-6",
      description: "text-sm",
    }
  };
  
  // Get background color based on card attribute
  const getAttributeColor = (attribute) => {
    switch (attribute) {
      case 'fire': return 'bg-gradient-to-br from-red-600 to-orange-700';
      case 'ice': return 'bg-gradient-to-br from-blue-500 to-cyan-700';
      case 'lightning': return 'bg-gradient-to-br from-purple-600 to-indigo-700';
      case 'earth': return 'bg-gradient-to-br from-amber-700 to-yellow-800';
      case 'wind': return 'bg-gradient-to-br from-emerald-500 to-teal-700';
      case 'shadow': return 'bg-gradient-to-br from-gray-700 to-gray-900';
      case 'light': return 'bg-gradient-to-br from-yellow-200 to-amber-400';
      default: return 'bg-gradient-to-br from-blue-gray-600 to-blue-gray-800';
    }
  };
  
  // Get card type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'attack': return '⚔️';
      case 'defense': return '🛡️';
      case 'utility': return '🧩';
      case 'healing': return '💚';
      default: return '📜';
    }
  };
  
  const handleCardClick = () => {
    if (previewMode) return;
    
    if (onPlay) {
      console.log('Card clicked, calling onPlay with:', cardData);
      onPlay(cardData, isReversed);
    }
  };
  
  const handleFlipClick = (e) => {
    e.stopPropagation();
    if (previewMode) return;
    
    if (onFlip) {
      console.log('Flipping card:', cardData);
      onFlip(cardData);
    }
  };
  
  // Render the card
  return (
    <div
      className={`
        ${sizeClasses[size].container}
        relative rounded-lg overflow-hidden transform transition-all duration-150
        ${isSelected ? 'ring-2 ring-amber-400 scale-105' : ''}
        ${isPlayable && !previewMode ? 'cursor-pointer hover:scale-105' : ''}
        ${!isPlayable && !previewMode ? 'opacity-60' : ''}
        ${isReversed ? 'rotate-180' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Card background */}
      <div className={`absolute inset-0 ${getAttributeColor(cardData.attribute)}`}></div>
      
      {/* Card content - need to handle both orientations */}
      <div className={`absolute inset-0 p-2 flex flex-col ${isReversed ? 'rotate-180' : ''}`}>
        {/* Card header */}
        <div className="flex justify-between items-center mb-1">
          <h3 className={`font-bold ${sizeClasses[size].title} text-white`}>{cardData.name}</h3>
          <div className={`
            ${sizeClasses[size].energy} 
            rounded-full bg-blue-900 text-white 
            flex items-center justify-center font-bold
          `}>
            {cardData.energyCost}
          </div>
        </div>
        
        {/* Card type and attribute */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs bg-black bg-opacity-30 rounded px-1 py-0.5 capitalize">
            {getTypeIcon(cardData.type)} {cardData.type}
          </span>
          <span className="text-xs bg-black bg-opacity-30 rounded px-1 py-0.5 capitalize">
            {cardData.attribute}
          </span>
        </div>
        
        {/* Card effect */}
        <div className="flex-1 mt-1">
          <div className="bg-black bg-opacity-30 rounded p-1">
            <p className={`${sizeClasses[size].description} text-white`}>
              {currentEffect.description}
            </p>
          </div>
        </div>
        
        {/* Card rarity */}
        <div className="mt-1 text-right">
          <span className="text-xs capitalize text-white opacity-70">
            {cardData.rarity}
          </span>
        </div>
        
        {/* Indicator for normal/reversed */}
        <div className="absolute bottom-1 left-1">
          <div className={`w-2 h-2 rounded-full ${isReversed ? 'bg-red-400' : 'bg-green-400'}`}></div>
        </div>
        
        {!previewMode && (
          <div 
            className="absolute top-1 right-1 w-5 h-5 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-70"
            onClick={handleFlipClick}
          >
            <span className="text-xs text-white">↻</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;