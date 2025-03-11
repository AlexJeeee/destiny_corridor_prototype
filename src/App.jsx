import React, { useState, useEffect } from 'react';
import { GameProvider } from './contexts/GameContext';
import MainMenu from './screens/MainMenu';
import BattleScreen from './screens/BattleScreen';
import OracleScreen from './screens/OracleScreen';

function App() {
  // Game screen states
  const [currentScreen, setCurrentScreen] = useState('mainMenu');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  // Handle character selection from main menu
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    // After character selection, go to oracle screen
    setCurrentScreen('oracle');
  };
  
  // Handle oracle blessing selection
  const handleOracleSelect = (oracle) => {
    // After oracle selection, go to battle
    setCurrentScreen('battle');
  };
  
  // Handle battle completion
  const handleBattleComplete = (won) => {
    if (won) {
      // If player won, go to oracle for next blessing
      setCurrentScreen('oracle');
    } else {
      // If player lost, go back to main menu
      setCurrentScreen('mainMenu');
      setSelectedCharacter(null);
    }
  };
  
  // Render the appropriate screen based on current state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'mainMenu':
        return <MainMenu onCharacterSelect={handleCharacterSelect} />;
      case 'oracle':
        return <OracleScreen 
          character={selectedCharacter} 
          onOracleSelect={handleOracleSelect} 
        />;
      case 'battle':
        return <BattleScreen 
          character={selectedCharacter} 
          onBattleComplete={handleBattleComplete} 
        />;
      default:
        return <MainMenu onCharacterSelect={handleCharacterSelect} />;
    }
  };
  
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {renderScreen()}
        </div>
      </div>
    </GameProvider>
  );
}

export default App;