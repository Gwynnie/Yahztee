/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Trophy, 
  Info, 
  X, 
  Check, 
  Plus,
  Dice5,
  History
} from 'lucide-react';

// --- Types & Constants ---

type CategoryId = 
  | 'aces' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'threeOfAKind' | 'fourOfAKind' | 'fullHouse' | 'smallStraight' | 'largeStraight' | 'yahtzee' | 'chance';

interface Category {
  id: CategoryId;
  name: string;
  description: string;
  section: 'upper' | 'lower';
}

const CATEGORIES: Category[] = [
  { id: 'aces', name: 'Aces', description: 'Total of all Aces', section: 'upper' },
  { id: 'twos', name: 'Twos', description: 'Total of all Twos', section: 'upper' },
  { id: 'threes', name: 'Threes', description: 'Total of all Threes', section: 'upper' },
  { id: 'fours', name: 'Fours', description: 'Total of all Fours', section: 'upper' },
  { id: 'fives', name: 'Fives', description: 'Total of all Fives', section: 'upper' },
  { id: 'sixes', name: 'Sixes', description: 'Total of all Sixes', section: 'upper' },
  { id: 'threeOfAKind', name: '3 of a Kind', description: 'Total of all 5 dice', section: 'lower' },
  { id: 'fourOfAKind', name: '4 of a Kind', description: 'Total of all 5 dice', section: 'lower' },
  { id: 'fullHouse', name: 'Full House', description: 'Score 25', section: 'lower' },
  { id: 'smallStraight', name: 'Sm. Straight', description: 'Score 30', section: 'lower' },
  { id: 'largeStraight', name: 'Lg. Straight', description: 'Score 40', section: 'lower' },
  { id: 'yahtzee', name: 'Yahtzee', description: 'Score 50', section: 'lower' },
  { id: 'chance', name: 'Chance', description: 'Total of all 5 dice', section: 'lower' },
];

type Scores = Partial<Record<CategoryId, number>>;

// --- Components ---

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [scores, setScores] = useState<Scores>({});
  const [yahtzeeBonuses, setYahtzeeBonuses] = useState(0);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<{ date: string; score: number }[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('yahtzee_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (finalScore: number) => {
    const newEntry = { date: new Date().toLocaleString(), score: finalScore };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('yahtzee_history', JSON.stringify(updated));
  };

  // Calculations
  const upperScore = useMemo(() => {
    return CATEGORIES
      .filter(c => c.section === 'upper')
      .reduce((sum, c) => sum + (scores[c.id] ?? 0), 0);
  }, [scores]);

  const upperBonus = upperScore >= 63 ? 35 : 0;
  const upperTotal = upperScore + upperBonus;

  const lowerScore = useMemo(() => {
    return CATEGORIES
      .filter(c => c.section === 'lower')
      .reduce((sum, c) => sum + (scores[c.id] ?? 0), 0) + (yahtzeeBonuses * 100);
  }, [scores, yahtzeeBonuses]);

  const grandTotal = upperTotal + lowerScore;

  const isGameOver = useMemo(() => {
    return CATEGORIES.every(c => scores[c.id] !== undefined);
  }, [scores]);

  // Handlers
  const startGame = () => {
    setScores({});
    setYahtzeeBonuses(0);
    setGameStarted(true);
  };

  const endGame = () => {
    if (window.confirm("Are you sure you want to end the game? Current scores will be lost unless the game is finished.")) {
      setGameStarted(false);
      setScores({});
      setYahtzeeBonuses(0);
    }
  };

  const handleScoreClick = (category: Category) => {
    if (!gameStarted || isGameOver) return;
    if (scores[category.id] !== undefined) return;
    setActiveCategory(category);
    setInputValue('');
  };

  const submitScore = () => {
    if (!activeCategory) return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    setScores(prev => ({ ...prev, [activeCategory.id]: val }));
    setActiveCategory(null);
  };

  const addYahtzeeBonus = () => {
    // Only if Yahtzee is already scored as 50
    if (scores['yahtzee'] === 50) {
      setYahtzeeBonuses(prev => prev + 1);
    }
  };

  const finishGame = () => {
    saveToHistory(grandTotal);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans selection:bg-orange-200">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Dice5 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Yahtzee</h1>
        </div>
        
        {gameStarted ? (
          <button 
            onClick={endGame}
            className="text-sm font-semibold text-stone-500 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" /> End Game
          </button>
        ) : (
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setHistory([])}
              className="text-stone-400 hover:text-stone-600 transition-colors"
              title="Clear History"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-2"
            >
              <h2 className="text-4xl font-black text-stone-800">Ready to roll?</h2>
              <p className="text-stone-500">Traditional Yahtzee Scorecard</p>
            </motion.div>

            <button 
              onClick={startGame}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" /> Start New Game
            </button>

            {history.length > 0 && (
              <div className="w-full space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Recent Games</h3>
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                  {history.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border-b border-stone-100 last:border-0">
                      <span className="text-sm text-stone-500">{entry.date}</span>
                      <span className="font-bold text-stone-800">{entry.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Sections */}
            <section className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Upper Section</h3>
                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Bonus (63+)</span>
                  <span className={`font-bold ${upperBonus > 0 ? 'text-green-600' : 'text-stone-300'}`}>
                    {upperBonus > 0 ? '+35' : '0'}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                {CATEGORIES.filter(c => c.section === 'upper').map(cat => (
                  <ScoreRow 
                    key={cat.id} 
                    category={cat} 
                    score={scores[cat.id]} 
                    onClick={() => handleScoreClick(cat)} 
                  />
                ))}
                <div className="bg-stone-50 p-4 flex justify-between items-center border-t border-stone-100">
                  <span className="font-bold text-stone-500">Upper Total</span>
                  <span className="text-xl font-black text-stone-800">{upperTotal}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Lower Section</h3>
                {scores['yahtzee'] === 50 && (
                   <button 
                    onClick={addYahtzeeBonus}
                    className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
                   >
                     <Plus className="w-3 h-3" /> Yahtzee Bonus
                   </button>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                {CATEGORIES.filter(c => c.section === 'lower').map(cat => (
                  <ScoreRow 
                    key={cat.id} 
                    category={cat} 
                    score={scores[cat.id]} 
                    onClick={() => handleScoreClick(cat)} 
                  />
                ))}
                {yahtzeeBonuses > 0 && (
                  <div className="p-4 flex justify-between items-center border-t border-stone-100 text-orange-600">
                    <span className="font-bold">Yahtzee Bonus ({yahtzeeBonuses})</span>
                    <span className="font-black">+{yahtzeeBonuses * 100}</span>
                  </div>
                )}
                <div className="bg-stone-50 p-4 flex justify-between items-center border-t border-stone-100">
                  <span className="font-bold text-stone-500">Lower Total</span>
                  <span className="text-xl font-black text-stone-800">{lowerScore}</span>
                </div>
              </div>
            </section>

            {/* Final Total Sticky Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-stone-200 flex items-center justify-between max-w-md mx-auto z-20">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400 block">Grand Total</span>
                <span className="text-3xl font-black text-orange-500">{grandTotal}</span>
              </div>
              
              {isGameOver ? (
                <button 
                  onClick={finishGame}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-100 flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5" /> Finish
                </button>
              ) : (
                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Remaining</span>
                  <span className="font-bold text-stone-600">
                    {CATEGORIES.length - Object.keys(scores).length} boxes
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Score Entry Modal */}
      <AnimatePresence>
        {activeCategory && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCategory(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-stone-800">{activeCategory.name}</h2>
                    <p className="text-stone-500 text-sm">{activeCategory.description}</p>
                  </div>
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-stone-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      autoFocus
                      inputMode="numeric"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter score..."
                      className="w-full text-4xl font-black p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-orange-500 focus:outline-none transition-colors placeholder:text-stone-200"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 font-bold">
                      pts
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[0, 5, 10, 15, 20, 25, 30, 40, 50].map(quickVal => (
                      <button
                        key={quickVal}
                        onClick={() => setInputValue(quickVal.toString())}
                        className="py-2 bg-stone-50 hover:bg-stone-100 rounded-xl text-sm font-bold text-stone-600 transition-colors"
                      >
                        {quickVal}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={submitScore}
                  disabled={inputValue === ''}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <Check className="w-6 h-6" /> Confirm Score
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ScoreRowProps {
  category: Category;
  score?: number;
  onClick: () => void;
}

const ScoreRow: React.FC<ScoreRowProps> = ({ category, score, onClick }) => {
  const isFilled = score !== undefined;

  return (
    <button 
      onClick={onClick}
      className={`w-full flex justify-between items-center p-4 transition-colors border-b border-stone-100 last:border-0 group
        ${isFilled ? 'bg-white' : 'bg-white hover:bg-orange-50 active:bg-orange-100'}
      `}
    >
      <div className="text-left">
        <span className={`font-bold block ${isFilled ? 'text-stone-400' : 'text-stone-700'}`}>
          {category.name}
        </span>
        {!isFilled && (
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold group-hover:text-orange-400 transition-colors">
            Tap to score
          </span>
        )}
      </div>
      
      <div className={`text-2xl font-black transition-all ${isFilled ? 'text-stone-800' : 'text-stone-100 group-hover:text-orange-200'}`}>
        {isFilled ? score : '—'}
      </div>
    </button>
  );
}
