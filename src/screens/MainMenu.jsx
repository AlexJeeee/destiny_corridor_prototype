import React, { useState } from 'react';
import { characters } from '../data/characters';
import Card from '../components/Card';

const MainMenu = ({ onCharacterSelect }) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  
  const handleCharacterClick = (characterId) => {
    setSelectedCharacterId(characterId);
  };
  
  const handleStartGame = () => {
    if (selectedCharacterId) {
      const selectedCharacter = characters.find(
        (char) => char.id === selectedCharacterId
      );
      onCharacterSelect(selectedCharacter);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center text-amber-400">
        命运回廊
      </h1>
      
      <div className="mb-12 max-w-2xl text-center">
        <p className="text-lg text-gray-300">
          穿越命运回廊，掌握命运的力量。
          选择你的角色，获得神谕的祝福，战胜越来越强大的敌人，到达终点。
        </p>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6 text-center">
        选择你的角色
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {characters.map((character) => (
          <div 
            key={character.id}
            className={`
              p-6 rounded-lg cursor-pointer transition-all
              ${selectedCharacterId === character.id 
                ? 'bg-amber-900/60 ring-2 ring-amber-400' 
                : 'bg-gray-800/60 hover:bg-gray-700/60'}
            `}
            onClick={() => handleCharacterClick(character.id)}
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                {/* Character avatar would go here */}
                <div className={`text-4xl font-bold ${
                  character.id === 'warrior' ? 'text-red-500' : 
                  character.id === 'mage' ? 'text-blue-500' : 'text-green-500'
                }`}>
                  {character.name.charAt(0)}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
              <p className="text-sm text-center text-gray-400 mb-4">
                {character.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400">生命</span>
                  <span className="text-lg font-semibold text-red-400">{character.maxHealth}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400">能量</span>
                  <span className="text-lg font-semibold text-blue-400">{character.maxEnergy}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-xs text-gray-400 block text-center">起始卡组</span>
                <span className="text-sm font-medium text-center block capitalize">
                  {character.startingDeckType}
                </span>
              </div>
              
              {character.abilities && character.abilities.length > 0 && (
                <div className="mt-4 w-full">
                  <span className="text-xs text-gray-400 block text-center">能力</span>
                  <span className="text-sm font-medium text-amber-300 block text-center">
                    {character.abilities[0].name}
                  </span>
                  <p className="text-xs text-center text-gray-300 mt-1">
                    {character.abilities[0].description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button
        className={`
          px-8 py-3 rounded-full font-semibold text-lg transition-all
          ${selectedCharacterId 
            ? 'bg-amber-600 hover:bg-amber-500 text-white' 
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
        `}
        onClick={handleStartGame}
        disabled={!selectedCharacterId}
      >
        开始旅程
      </button>
      
      {/* Display sample cards for the selected character */}
      {selectedCharacterId && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 text-center">特殊卡牌</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {characters
              .find(char => char.id === selectedCharacterId)
              ?.specialCards?.map(cardId => (
                <Card 
                  key={cardId} 
                  cardId={cardId} 
                  size="medium"
                  previewMode={true}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;