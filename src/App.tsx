/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCcw, Hand, Users, Play, Star, ChevronLeft } from 'lucide-react';

const ANIMALS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
  '🐌', '🐞', '🐜', '🦟', '🪲', '🐢', '🐍', '🦎', '🦖', '🐙'
];

type Level = 1 | 2 | 3;

interface CardData {
  id: number;
  animal: string;
}

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [level, setLevel] = useState<Level>(1);
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [isLocked, setIsLocked] = useState(false);

  const startGame = (selectedLevel: Level) => {
    let pairCount = 10;
    if (selectedLevel === 2) pairCount = 20;
    if (selectedLevel === 3) pairCount = 30;

    // We take the first `pairCount` animals to ensure variety
    const selectedAnimals = ANIMALS.slice(0, pairCount);
    const deck = [...selectedAnimals, ...selectedAnimals];

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setLevel(selectedLevel);
    setCards(deck.map((animal, id) => ({ id, animal })));
    setFlippedIndices([]);
    setMatchedIndices([]);
    setCurrentPlayer(0);
    setScores([0, 0]);
    setIsLocked(false);
    setScreen('playing');
  };

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (flippedIndices.includes(index)) return;
    if (matchedIndices.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].animal === cards[secondIndex].animal) {
        // Match!
        setTimeout(() => {
          setMatchedIndices(prev => [...prev, firstIndex, secondIndex]);
          setFlippedIndices([]);
          const newScores = [...scores] as [number, number];
          newScores[currentPlayer] += 1;
          setScores(newScores);

          setIsLocked(false);

          // Check if game over
          if (matchedIndices.length + 2 === cards.length) {
            setTimeout(() => setScreen('gameover'), 600);
          }
        }, 800);
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([]);
          // Switch player
          setCurrentPlayer(prev => prev === 0 ? 1 : 0);
          setIsLocked(false);
        }, 1500);
      }
    }
  };

  const getGridCols = () => {
    switch (level) {
      case 1: return 'grid-cols-4 sm:grid-cols-5 md:grid-cols-5';
      case 2: return 'grid-cols-5 sm:grid-cols-8 md:grid-cols-8';
      case 3: return 'grid-cols-6 sm:grid-cols-10 md:grid-cols-10';
      default: return 'grid-cols-4';
    }
  };

  const renderContent = () => {
    if (screen === 'menu') {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#E8E2D0] p-8 rounded-[2rem] shadow-sm border-2 border-[#5A5A40]"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-[#F7F3E9] p-4 rounded-3xl border border-[#DCD7C9]">
              <span className="text-6xl inline-block" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🦊</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif italic text-center text-[#5A5A40] mb-2">
            Fauna Memory
          </h1>
          <p className="text-center text-[#5A5A40]/70 font-medium mb-10">Test your memory against a friend</p>
          
          <div className="space-y-4">
            {[
              { lvl: 1, name: 'Level 01: The Forest Floor', pairs: 10, icon: '🌿', color: 'bg-white', shadow: 'hover:bg-[#F0EDE4]' },
              { lvl: 2, name: 'Level 02: Deeper Woods', pairs: 20, icon: '🌲', color: 'bg-white', shadow: 'hover:bg-[#F0EDE4]' },
              { lvl: 3, name: 'Level 03: The Canopy', pairs: 30, icon: '🦅', color: 'bg-white', shadow: 'hover:bg-[#F0EDE4]' }
            ].map((opt) => (
              <button 
                key={opt.lvl}
                onClick={() => startGame(opt.lvl as Level)} 
                className={`w-full relative group overflow-hidden rounded-2xl ${opt.color} p-4 border border-[#DCD7C9] hover:border-[#5A5A40] transition-all shadow-sm ${opt.shadow}`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-[#F7F3E9] text-inherit group-hover:bg-white transition-colors border border-[#DCD7C9]/50`}>
                    {opt.icon}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-[#4A4A40] text-lg">{opt.name}</h3>
                    <p className="text-[#5A5A40]/60 text-sm font-medium">{opt.pairs * 2} cards ({opt.pairs} pairs)</p>
                  </div>
                  <div className="text-[#DCD7C9] group-hover:-translate-x-1 group-hover:text-[#5A5A40] transition-all">
                    <Play className="fill-current w-6 h-6" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      );
    }

    if (screen === 'playing') {
      const totalPairs = cards.length / 2;
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col w-full h-full max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-[#DCD7C9] gap-4">
            <div className="flex items-baseline space-x-4">
              <button 
                onClick={() => setScreen('menu')}
                className="p-2 sm:px-4 sm:py-2 bg-[#E8E2D0] border border-[#DCD7C9] rounded-full text-[#4A4A40] hover:bg-[#DCD7C9] transition-colors flex items-center"
                title="Back to Menu"
              >
                <ChevronLeft className="w-5 h-5 sm:mr-1" />
                <span className="hidden sm:inline text-sm font-medium">Lvl {level}</span>
              </button>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-[#5A5A40]">Fauna Memory</h1>
              <span className="text-[10px] sm:text-xs tracking-widest uppercase opacity-60 hidden md:inline text-[#4A4A40]">
                 Level 0{level}: {level === 1 ? 'The Forest Floor' : level === 2 ? 'Deeper Woods' : 'The Canopy'}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/50 border border-[#DCD7C9] rounded-full text-xs sm:text-sm font-medium text-[#4A4A40]">
                  {matchedIndices.length / 2} / {totalPairs} Pairs
                </div>
                <button 
                  onClick={() => startGame(level)}
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-[#5A5A40] text-white rounded-full text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#4A4A40] transition-colors"
                >
                  Restart
                </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 w-full max-w-5xl mx-auto">
            {/* Sidebar / Scoreboard */}
            <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-4 lg:gap-6 shrink-0">
              {/* Player 1 */}
              <div 
                className={`flex-1 p-4 sm:p-6 rounded-3xl relative overflow-hidden transition-all duration-300 ${
                  currentPlayer === 0 
                  ? 'bg-[#E8E2D0] border-2 border-[#5A5A40] shadow-sm transform lg:scale-105' 
                  : 'bg-white border border-[#DCD7C9] opacity-70'
                }`}
              >
                <div className="relative z-10">
                  <div className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${currentPlayer === 0 ? 'text-[#5A5A40]' : 'text-[#4A4A40]'}`}>
                    {currentPlayer === 0 ? 'Current Turn' : 'Waiting'}
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-serif mt-1">Player One</h2>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">
                    {scores[0].toString().padStart(2, '0')} <span className="text-xs sm:text-sm font-normal opacity-60">Cards</span>
                  </p>
                </div>
                {currentPlayer === 0 && (
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 bg-[#5A5A40] opacity-10 rounded-full"></div>
                )}
              </div>

              {/* Player 2 */}
              <div 
                className={`flex-1 p-4 sm:p-6 rounded-3xl relative overflow-hidden transition-all duration-300 ${
                  currentPlayer === 1 
                  ? 'bg-[#E8E2D0] border-2 border-[#5A5A40] shadow-sm transform lg:scale-105' 
                  : 'bg-white border border-[#DCD7C9] opacity-70'
                }`}
              >
                <div className="relative z-10">
                  <div className={`text-[10px] sm:text-xs uppercase tracking-widest font-bold ${currentPlayer === 1 ? 'text-[#5A5A40]' : 'text-[#4A4A40]'}`}>
                    {currentPlayer === 1 ? 'Current Turn' : 'Waiting'}
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-serif mt-1">Player Two</h2>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">
                    {scores[1].toString().padStart(2, '0')} <span className="text-xs sm:text-sm font-normal opacity-60">Cards</span>
                  </p>
                </div>
                {currentPlayer === 1 && (
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 bg-[#5A5A40] opacity-10 rounded-full"></div>
                )}
              </div>
              
              <div className="hidden lg:block mt-auto p-4 bg-[#F0EDE4] rounded-2xl border border-dashed border-[#DCD7C9]">
                <p className="text-xs leading-relaxed italic opacity-80 text-[#5A5A40]">
                  "Flip two cards to find a match. The player with the most pairings at the end wins the forest crown."
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className={`flex-1 grid gap-2 sm:gap-3 lg:gap-4 ${getGridCols()} w-full mt-auto mb-auto content-start`}>
              {cards.map((card, index) => {
                const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index);
                const isMatched = matchedIndices.includes(index);
                
                return (
                  <div 
                    key={index} 
                    className="aspect-square relative flex items-center justify-center cursor-pointer perspective"
                    onClick={() => handleCardClick(index)}
                  >
                    <motion.div
                      className="w-full h-full preserve-3d"
                      initial={false}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                    >
                      {/* Front of card (upside down) */}
                      <div className={`absolute w-full h-full backface-hidden flex items-center justify-center rounded-xl sm:rounded-2xl border-[3px] border-white/20 bg-[#8C8C70] shadow-md hover:-translate-y-1 transition-all ${isFlipped ? 'pointer-events-none' : ''}`}>
                         <div className="w-8 h-8 sm:w-12 sm:h-12 border border-white/30 rounded-full opacity-40"></div>
                      </div>

                      {/* Back of card (animal face up) */}
                      <div className={`absolute w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 shadow-inner overflow-hidden ${isMatched ? 'border-[#DCD7C9] bg-[#F0EDE4]' : 'border-[#D4A373] bg-white'}`}>
                         <span className={`text-4xl sm:text-5xl lg:text-5xl ${isMatched ? 'opacity-40 grayscale transition-all duration-1000' : ''}`} style={!isMatched ? { filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.05))' } : {}}>
                           {card.animal}
                         </span>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      );
    }

    if (screen === 'gameover') {
      const p1Win = scores[0] > scores[1];
      const p2Win = scores[1] > scores[0];
      const tie = !p1Win && !p2Win;
      const totalPairs = cards.length / 2;

      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#E8E2D0] p-10 rounded-[2.5rem] shadow-sm border-2 border-[#5A5A40] text-center"
        >
          <div className="mb-6 flex justify-center">
             <div className="w-24 h-24 bg-[#F7F3E9] rounded-full flex items-center justify-center border border-[#DCD7C9] relative">
                <Trophy className="w-10 h-10 text-[#5A5A40]" />
                <motion.div 
                  initial={{ rotate: -10, y: 10 }}
                  animate={{ rotate: 10, y: -10 }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                  className="absolute -top-1 -right-1 text-2xl h-8 w-8 flex items-center justify-center bg-white rounded-full border border-[#DCD7C9]"
                >
                  ✨
                </motion.div>
             </div>
          </div>

          <h2 className="text-4xl font-serif italic text-[#5A5A40] mb-3">
            {tie ? "It's a Tie!" : p1Win ? "Player One Wins!" : "Player Two Wins!"}
          </h2>
          <p className="text-[#4A4A40]/80 mb-8 font-medium">All {totalPairs} pairs have been found in the forest.</p>

          <div className="grid grid-cols-2 gap-4 mb-10">
             <div className={`p-4 rounded-2xl border ${p1Win ? 'bg-[#5A5A40] text-white border-transparent' : 'bg-white text-[#4A4A40] border-[#DCD7C9]'}`}>
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Player One</div>
                <div className="text-4xl font-bold">{scores[0].toString().padStart(2, '0')}</div>
             </div>
             <div className={`p-4 rounded-2xl border ${p2Win ? 'bg-[#5A5A40] text-white border-transparent' : 'bg-white text-[#4A4A40] border-[#DCD7C9]'}`}>
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Player Two</div>
                <div className="text-4xl font-bold">{scores[1].toString().padStart(2, '0')}</div>
             </div>
          </div>

          <div className="space-y-3">
             <button 
               onClick={() => startGame(level)}
               className="w-full py-4 bg-[#5A5A40] hover:bg-[#4A4A40] text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
             >
               <RefreshCcw className="w-4 h-4" />
               Play Again
             </button>
             <button 
               onClick={() => setScreen('menu')}
               className="w-full py-4 bg-white hover:bg-[#F7F3E9] text-[#5A5A40] border border-[#DCD7C9] rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-sm"
             >
               Main Menu
             </button>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3E9] text-[#4A4A40] font-sans p-4 sm:p-6 md:p-8 flex items-center justify-center overflow-x-hidden">
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
           {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}

