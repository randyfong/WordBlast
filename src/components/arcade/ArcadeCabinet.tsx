'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  Flame, 
  Zap, 
  Sparkles, 
  ShieldAlert, 
  Gauge, 
  Pause, 
  Play,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { STORY_THEMES, StoryTheme, PhonicsWord, PHONICS_CATALOG } from '@/lib/game/syllabication';
import { arcadeAudio } from '@/lib/game/audio';
import { voiceController, SpeechMatchEvent } from '@/lib/speech/voice-controller';
import { CRTOverlay } from './CRTOverlay';
import { ParticleCanvas, Particle, createExplosionParticles } from './ParticleCanvas';
import { ThemeIcon } from './ThemeIcon';
import { PhonicsLegend } from './PhonicsLegend';

interface ActiveWordItem {
  id: string;
  wordData: PhonicsWord;
  spawnTime: number;
  y: number; // 0 to 100%
  lane: number; // 0, 1, 2
  scaffoldActive: boolean;
  hesitationElapsedMs: number;
}

export type SpeedPreset = 'CREEP' | 'ZEN' | 'ULTRA_SLOW' | 'SLOW' | 'NORMAL' | 'FAST' | 'HYPER';

const SPEED_CONFIG: Record<SpeedPreset, { label: string; shortLabel: string; fallStep: number; spawnIntervalMs: number; badgeColor: string }> = {
  CREEP: { label: '0.05x Crawl', shortLabel: '0.05x', fallStep: 0.03, spawnIntervalMs: 14000, badgeColor: 'text-[#183153] border-[#3fcf8e] bg-[#bffff0]' },
  ZEN: { label: '0.1x Zen', shortLabel: '0.1x', fallStep: 0.06, spawnIntervalMs: 9500, badgeColor: 'text-[#183153] border-[#3fcf8e] bg-[#cff7e7]' },
  ULTRA_SLOW: { label: '0.25x Super Easy', shortLabel: '0.25x', fallStep: 0.14, spawnIntervalMs: 6500, badgeColor: 'text-[#183153] border-[#3fcf8e] bg-[#dff8eb]' },
  SLOW: { label: '0.5x Easy', shortLabel: '0.5x', fallStep: 0.28, spawnIntervalMs: 4200, badgeColor: 'text-[#183153] border-[#67c8f4] bg-[#eaf8ff]' },
  NORMAL: { label: '1.0x Normal', shortLabel: '1.0x', fallStep: 0.55, spawnIntervalMs: 3000, badgeColor: 'text-[#183153] border-[#ffd166] bg-[#fff1bd]' },
  FAST: { label: '1.5x Fast', shortLabel: '1.5x', fallStep: 0.85, spawnIntervalMs: 2200, badgeColor: 'text-[#183153] border-[#ff8e7f] bg-[#ffe7e3]' },
  HYPER: { label: '2.0x Hyper', shortLabel: '2.0x', fallStep: 1.25, spawnIntervalMs: 1600, badgeColor: 'text-white border-[#7657e8] bg-[#7657e8]' },
};

export const ArcadeCabinet: React.FC = () => {
  const [gameState, setGameState] = useState<'INSERT_COIN' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'>('INSERT_COIN');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [activeWords, setActiveWords] = useState<ActiveWordItem[]>([]);
  const [lastBlast, setLastBlast] = useState<{ word: string; latency: number; accuracy: number; scaffold: boolean } | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [remediationTarget, setRemediationTarget] = useState<string | null>(null);
  const [latestLatencyMs, setLatestLatencyMs] = useState(0);
  
  // Story Theme Selection
  const [selectedThemeId, setSelectedThemeId] = useState<string>(STORY_THEMES[0].id);
  const currentTheme: StoryTheme = STORY_THEMES.find(t => t.id === selectedThemeId) || STORY_THEMES[0];

  // Game Speed setting
  const [gameSpeed, setGameSpeed] = useState<SpeedPreset>('SLOW');

  const particlesRef = useRef<Particle[]>([]);
  const activeWordsRef = useRef<ActiveWordItem[]>([]);
  activeWordsRef.current = activeWords;

  const gameSpeedRef = useRef<SpeedPreset>(gameSpeed);
  gameSpeedRef.current = gameSpeed;

  const currentThemeRef = useRef<StoryTheme>(currentTheme);
  currentThemeRef.current = currentTheme;

  // Handle Voice Match
  const handleWordBlast = useCallback((matchedWord: string, speechTimestamp: number) => {
    const list = activeWordsRef.current;
    const rawSpeech = matchedWord.trim().toUpperCase();
    const speechTokens = rawSpeech.split(/\s+/);

    // Phonetic homophone & silent letter alias dictionary for Web Speech API transcription quirks
    const PHONETIC_ALIASES: Record<string, string[]> = {
      'KNOT': ['NOT', 'NAUGHT', 'KNOT', 'NOTS'],
      'KNIGHT': ['NIGHT', 'KNIGHT', 'NIGHTS'],
      'KNIFE': ['NIFE', 'KNIFE', 'NYFE'],
      'KNOW': ['NO', 'KNOW', 'KNOWS'],
      'KNEEL': ['NEEL', 'NEAL', 'KNEEL'],
      'KNUCKLE': ['NUCKLE', 'NUCKEL', 'KNUCKLE'],
      'WRIST': ['RIST', 'WRIST'],
      'WRITTEN': ['RITTEN', 'WRITTEN'],
      'WRESTLE': ['RESTLE', 'WRESTLE'],
      'WRONG': ['RONG', 'WRONG'],
      'WRECK': ['RECK', 'WRECK'],
      'WREATH': ['REATH', 'WREATH'],
      'WRATH': ['RATH', 'WRATH'],
      'GNOME': ['NOME', 'GNOME'],
      'GNASH': ['NASH', 'GNASH'],
      'PHONE': ['FONE', 'PHONE'],
      'PHANTOM': ['FANTOM', 'PHANTOM'],
      'GRAPH': ['GRAF', 'GRAPH']
    };
    
    // Find if speech matches any active falling word
    const matchIndex = list.findIndex(item => {
      const targetWord = item.wordData.word.toUpperCase();
      const aliases = PHONETIC_ALIASES[targetWord] || [targetWord];

      // Check if target word or any of its phonetic aliases match the transcript or individual tokens
      return aliases.some(alias => 
        rawSpeech === alias || 
        rawSpeech.includes(alias) || 
        speechTokens.includes(alias) ||
        (targetWord.length >= 4 && rawSpeech.length >= 3 && (rawSpeech.startsWith(alias.slice(0, 3)) || alias.startsWith(rawSpeech)))
      );
    });

    if (matchIndex !== -1) {
      const target = list[matchIndex];
      const latency = Math.round(performance.now() - target.spawnTime);
      const isScaffolded = target.scaffoldActive;

      // Play audio & particles
      try {
        arcadeAudio.playBlast();
      } catch (e) {
        console.warn('Audio play error:', e);
      }
      setLatestLatencyMs(latency);

      // Spawn particles near lane coordinates
      const laneX = (target.lane + 1) * 200;
      const targetY = (target.y / 100) * 500;
      const newParticles = createExplosionParticles(laneX, targetY, target.scaffoldActive ? '#ff6b6b' : '#3fcf8e', 40);
      particlesRef.current.push(...newParticles);

      // Score calculation
      const basePoints = 250;
      const speedBonus = Math.max(0, Math.round((2000 - latency) / 10));
      const scaffoldPenalty = isScaffolded ? 0.7 : 1.0;
      const roundScore = Math.round((basePoints + speedBonus) * multiplier * scaffoldPenalty);

      setScore(s => s + roundScore);
      setStreak(st => {
        const next = st + 1;
        setMultiplier(Math.min(5, 1 + Math.floor(next / 3)));
        return next;
      });

      setLastBlast({
        word: target.wordData.word,
        latency,
        accuracy: 1.0,
        scaffold: isScaffolded
      });

      // Log ClickHouse Telemetry Ingest via API
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'stu_4a_player',
          studentName: 'Player 1 (4th Grade)',
          word: target.wordData.word,
          phonicsPattern: target.wordData.pattern,
          categoryLabel: target.wordData.categoryLabel,
          latencyMs: latency,
          hesitationMs: Math.max(0, latency - 80),
          accuracyScore: 1.0,
          scaffoldTriggered: isScaffolded,
          timeGapToPhonemeMs: Math.min(180, Math.round(latency * 0.08))
        })
      }).catch(console.error);

      // Remove blasted word
      setActiveWords(prev => prev.filter((_, i) => i !== matchIndex));
    }
  }, [multiplier]);

  // Web Speech recognition listener
  useEffect(() => {
    if (gameState === 'PLAYING') {
      try {
        voiceController.start((event: SpeechMatchEvent) => {
          setSpeechTranscript(event.transcript);
          handleWordBlast(event.transcript, event.speechTimestamp);
        });
        setMicActive(true);
      } catch (err) {
        console.warn('Voice controller start error:', err);
      }
    } else {
      try {
        voiceController.stop();
      } catch {
        // ignore
      }
      setMicActive(false);
    }

    return () => {
      try {
        voiceController.stop();
      } catch {
        // ignore
      }
    };
  }, [gameState, handleWordBlast]);

  const recentWordsRef = useRef<string[]>([]);

  // Spawn word drops using current active story theme catalog
  const spawnWord = useCallback(() => {
    const catalog = currentThemeRef.current.words && currentThemeRef.current.words.length > 0 
      ? currentThemeRef.current.words 
      : PHONICS_CATALOG;

    // Filter out active words currently on screen AND recently spawned words to avoid immediate repeats
    const activeWordStrings = activeWordsRef.current.map(item => item.wordData.word);
    const recentlyUsed = recentWordsRef.current;
    
    let availableWords = catalog.filter(
      w => !activeWordStrings.includes(w.word) && !recentlyUsed.includes(w.word)
    );

    // Fallback if catalog pool is small
    if (availableWords.length === 0) {
      availableWords = catalog.filter(w => !activeWordStrings.includes(w.word));
    }
    if (availableWords.length === 0) {
      availableWords = catalog;
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    const lane = Math.floor(Math.random() * 3);

    // Track recently used words (keep last 4)
    recentWordsRef.current = [...recentWordsRef.current.slice(-3), randomWord.word];

    const newItem: ActiveWordItem = {
      id: `word_${Date.now()}_${Math.random()}`,
      wordData: randomWord,
      spawnTime: performance.now(),
      y: 0,
      lane,
      scaffoldActive: false,
      hesitationElapsedMs: 0
    };

    setActiveWords(prev => [...prev.slice(-2), newItem]); // Max 3 on screen
  }, []);

  // Main game tick: card falling + Dynamic Syllabication trigger at > 1,500 ms
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const interval = setInterval(() => {
      const now = performance.now();
      const currentSpeedConfig = SPEED_CONFIG[gameSpeedRef.current];
      
      setActiveWords(prev => {
        const nextList: ActiveWordItem[] = [];

        for (const item of prev) {
          const elapsed = now - item.spawnTime;
          const nextY = item.y + currentSpeedConfig.fallStep; // dynamic fall speed
          let scaffolded = item.scaffoldActive;

          // DYNAMIC SYLLABICATION SCAFFOLD TRIGGER: > 1,500ms hesitation threshold
          if (elapsed >= 1500 && !scaffolded) {
            scaffolded = true;
            try {
              arcadeAudio.playSyllableBreak();
            } catch {
              // ignore
            }
          }

          if (nextY >= 82) {
            // Word reached bottom
            try {
              arcadeAudio.playMiss();
            } catch {
              // ignore
            }
            setStreak(0);
            setMultiplier(1);
            
            // Log Miss to Telemetry
            fetch('/api/telemetry', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: 'stu_4a_player',
                studentName: 'Player 1 (4th Grade)',
                word: item.wordData.word,
                phonicsPattern: item.wordData.pattern,
                categoryLabel: item.wordData.categoryLabel,
                latencyMs: 2500,
                hesitationMs: 2400,
                accuracyScore: 0.0,
                scaffoldTriggered: scaffolded,
                timeGapToPhonemeMs: 200
              })
            }).catch(console.error);
          } else {
            nextList.push({
              ...item,
              y: nextY,
              scaffoldActive: scaffolded,
              hesitationElapsedMs: Math.round(elapsed)
            });
          }
        }

        return nextList;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [gameState]);

  // Word spawn timer based on selected speed
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    
    // Initial drop
    spawnWord();

    const spawnDelay = SPEED_CONFIG[gameSpeed].spawnIntervalMs;
    const spawner = setInterval(() => {
      if (activeWordsRef.current.length < 3) {
        spawnWord();
      }
    }, spawnDelay);

    return () => clearInterval(spawner);
  }, [gameState, gameSpeed, spawnWord]);

  // Insert Coin / Start Game
  const handleInsertCoin = () => {
    try {
      arcadeAudio.playCoin();
    } catch {
      // ignore
    }
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setActiveWords([]);
    setLastBlast(null);
    setGameState('PLAYING');
  };

  // Toggle Pause/Resume
  const togglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  };

  const handleMuteToggle = () => {
    const muted = arcadeAudio.toggleMute();
    setIsMuted(muted);
  };

  // Trigger Adaptive Boss Remediation Round
  const triggerRemediationWave = async () => {
    try {
      const res = await fetch('/api/adaptive-generator', { method: 'POST' });
      const data = await res.json();
      if (data.remediationPlan) {
        setRemediationTarget(data.remediationPlan.categoryLabel);
        try {
          arcadeAudio.playSyllableBreak();
        } catch {
          // ignore
        }
        
        // Spawn targeted words
        const targetWords: PhonicsWord[] = data.remediationPlan.waveWords;
        const newDrops: ActiveWordItem[] = targetWords.slice(0, 2).map((w, idx) => ({
          id: `remed_${Date.now()}_${idx}`,
          wordData: w,
          spawnTime: performance.now() + idx * 800,
          y: idx * -15,
          lane: idx + 1,
          scaffoldActive: false,
          hesitationElapsedMs: 0
        }));
        setActiveWords(newDrops);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Top Arcade Marquee with Story Title */}
      <div className="w-full bg-[#ffd166] border-2 border-[#183153] rounded-t-3xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-[0_5px_0_#183153]">
        <div className="flex items-center gap-3">
          <ThemeIcon themeId={currentTheme.id} className="w-6 h-6" />
          <div>
            <h2 className="display-font text-2xl font-black text-[#183153] leading-none">
              {currentTheme.title}
            </h2>
          </div>
        </div>

        {/* Speed Controller, Sound & Pause */}
        <div className="flex-1 flex items-center justify-end flex-wrap gap-2">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border-2 border-[#183153]/15">
            <Gauge className="w-4 h-4 text-[#7657e8]" />
            <span className="text-xs font-bold text-[#55708f] hidden lg:inline mr-0.5">Speed:</span>
            {(['CREEP', 'ZEN', 'ULTRA_SLOW', 'SLOW', 'NORMAL', 'FAST', 'HYPER'] as SpeedPreset[]).map((preset) => {
              const active = gameSpeed === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setGameSpeed(preset)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    active
                      ? `${SPEED_CONFIG[preset].badgeColor} border-2 border-[#183153] shadow-sm`
                      : 'text-[#55708f] hover:text-[#183153] hover:bg-[#eaf8ff]'
                  }`}
                >
                  {SPEED_CONFIG[preset].shortLabel}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowLegend(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#183153]/15 hover:border-[#183153] text-[#7657e8] font-bold text-xs transition-all cursor-pointer shadow-sm"
            title="View Phonics Color Guide"
          >
            <HelpCircle className="w-4 h-4 text-[#7657e8]" />
            <span>Color Guide</span>
          </button>

          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-xl bg-white border-2 border-[#183153]/15 hover:border-[#183153] text-[#55708f] transition-all cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[#7657e8]" />}
          </button>
          
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border-2 border-[#183153]/15">
            <Mic className={`w-4 h-4 ${micActive ? 'text-[#20a36d] animate-pulse' : 'text-[#8aa0b8]'}`} />
            <span className="text-xs font-bold text-[#183153]">
              {micActive ? 'Listening' : 'Ready'}
            </span>
          </div>

          {/* Pause / Resume Button - Flush Right */}
          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <button
              onClick={togglePause}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                gameState === 'PAUSED'
                  ? 'bg-[#ff6b6b] text-white border-[#183153] animate-pulse shadow-[0_2px_0_#183153]'
                  : 'bg-white text-[#183153] border-[#183153]/25 hover:border-[#183153]'
              }`}
            >
              {gameState === 'PAUSED' ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              <span>{gameState === 'PAUSED' ? 'Resume' : 'Pause'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Arcade Frame */}
      <div className="w-full bg-[#ff8e7f] border-x-[3px] border-b-[3px] border-[#183153] rounded-b-[2rem] p-3 md:p-5 shadow-[0_8px_0_#183153] relative">
        <CRTOverlay>
          <div className="relative w-full h-[580px] bg-[#142a4b] overflow-hidden flex flex-col justify-between rounded-xl">
            {/* Particle Canvas */}
            <ParticleCanvas particlesRef={particlesRef} />

            {/* Clean, High-Contrast Top HUD */}
            <div className="relative z-10 w-full p-4 border-b border-white/10 bg-[#102441]/95 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-xs font-bold text-[#8edbff] tracking-wide">SCORE</div>
                  <div className="display-font text-3xl font-black text-[#ffd166]">
                    {score.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#ffaaa0] tracking-wide">STREAK</div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-5 h-5 text-[#ff6b6b] animate-bounce" />
                    <span className="display-font text-2xl font-bold text-white">{streak}x</span>
                    {multiplier > 1 && (
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-[#ff6b6b] text-white">
                        {multiplier}X BONUS
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#8aa0b8]">SPEED PACE</div>
                  <div className="text-sm font-extrabold text-[#3fcf8e]">
                    {SPEED_CONFIG[gameSpeed].label}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[#203b63] border border-white/20 flex items-center justify-center">
                  <Zap className={`w-5 h-5 ${latestLatencyMs > 1000 ? 'text-[#ff6b6b] animate-pulse' : 'text-[#3fcf8e]'}`} />
                </div>
              </div>
            </div>

            {/* Word lanes */}
            <div className="absolute inset-0 top-20 bottom-16 flex justify-around pointer-events-none opacity-20">
              <div className="w-1/3 border-r-2 border-dashed border-white/20" />
              <div className="w-1/3 border-r-2 border-dashed border-white/20" />
              <div className="w-1/3" />
            </div>

            {/* Game Screen Content: Mission Selector */}
            {gameState === 'INSERT_COIN' && (
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-4 gap-4 overflow-y-auto">
                <div>
                  <h3 className="display-font text-3xl md:text-4xl font-black text-white mb-1">
                    Select Your Mission
                  </h3>
                  <p className="text-[#d7e9ff] text-base md:text-lg font-bold max-w-md mx-auto">
                    Pick a story theme and start reading out loud!
                  </p>
                </div>

                {/* Streamlined Story Theme Grid with Custom Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full max-w-3xl p-1">
                  {STORY_THEMES.map((theme) => {
                    const isSelected = selectedThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedThemeId(theme.id)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#ffd166] border-[#183153] shadow-[0_4px_0_#183153] transform -translate-y-0.5'
                            : 'bg-[#0d203b]/85 border-white/15 hover:border-white/40 hover:bg-[#142e54]'
                        }`}
                      >
                        <ThemeIcon themeId={theme.id} className="w-6 h-6 shrink-0" />
                        <div className="truncate">
                          <div className={`text-sm font-extrabold truncate ${isSelected ? 'text-[#183153]' : 'text-white'}`}>
                            {theme.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleInsertCoin}
                  className="display-font px-10 py-4 bg-[#ff6b6b] hover:bg-[#ff7d73] text-white font-black text-xl rounded-2xl shadow-[0_6px_0_#a93232] transform hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer border-2 border-white/30 mt-2"
                >
                  Start Game →
                </button>
              </div>
            )}

            {/* PAUSED Overlay */}
            {gameState === 'PAUSED' && (
              <div className="relative z-20 flex-1 w-full h-full flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-4">
                <div className="p-4 rounded-full bg-[#ffd166] text-[#183153]">
                  <Pause className="w-12 h-12 fill-current" />
                </div>
                <h3 className="display-font text-4xl font-black text-[#ffd166]">
                  Game Paused
                </h3>
                <button
                  onClick={togglePause}
                  className="display-font px-8 py-3.5 rounded-2xl bg-[#ffd166] hover:bg-[#ffda7a] text-[#183153] font-black text-xl transition-all cursor-pointer shadow-[0_5px_0_#a86e00]"
                >
                  Resume Playing
                </button>
              </div>
            )}

            {/* Active Falling Word Target Cards */}
            {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
              <div className="relative z-10 flex-1 w-full h-full min-h-[380px] overflow-hidden">
                {activeWords.map((item) => {
                  const leftPos = item.lane === 0 ? '18%' : item.lane === 1 ? '50%' : '82%';
                  
                  return (
                    <div
                      key={item.id}
                      style={{
                        top: `${item.y}%`,
                        left: leftPos,
                        transform: 'translate(-50%, 0)'
                      }}
                      className="absolute transition-all duration-75 flex flex-col items-center gap-1.5 w-72 max-w-[92vw] pointer-events-auto"
                    >
                      {/* Short Condensed Context Hint - LARGER & HIGHER CONTRAST */}
                      <div className="px-3.5 py-1.5 rounded-xl bg-[#ffd166] border-2 border-[#183153] text-center shadow-[0_3px_0_#183153] w-full">
                        <div className="text-sm md:text-base font-black text-[#183153] leading-tight truncate">
                          💡 &ldquo;{item.wordData.storySentence}&rdquo;
                        </div>
                      </div>

                      {/* Main Phonics Target Word Button - BIG TEXT */}
                      <button
                        onClick={() => voiceController.simulateUtterance(item.wordData.word)}
                        className={`px-6 py-3.5 rounded-2xl backdrop-blur-md border-3 shadow-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 w-full ${
                          item.scaffoldActive 
                            ? 'bg-[#fff1bd] border-[#ffd166] shadow-[0_8px_0_#a86e00]'
                            : 'bg-white border-[#8edbff] shadow-[0_8px_0_#397b9b]'
                        }`}
                      >
                        {!item.scaffoldActive ? (
                          // Large Clear Target Word Text
                          <span className="display-font text-4xl md:text-5xl font-black text-[#183153] tracking-wider">
                            {item.wordData.word}
                          </span>
                        ) : (
                          // Color-Coded Syllable Breakdown
                          <div className="flex items-center gap-1.5">
                            {item.wordData.phoneticBreakdown.map((chunk, idx) => (
                              <span
                                key={idx}
                                className={`display-font text-3xl md:text-4xl font-black px-2 py-1 rounded-xl border-2 ${chunk.color}`}
                              >
                                {chunk.chunk}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Streamlined Microphone & Instant Tap HUD */}
            <div className="relative z-10 w-full p-3.5 bg-[#102441]/95 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                <div className="w-10 h-10 rounded-xl bg-[#ff6b6b] flex items-center justify-center shadow-[0_3px_0_#a93232] shrink-0">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-bold text-[#8aa0b8]">MICROPHONE</div>
                  <div className="text-base font-black text-[#8edbff] truncate">
                    {speechTranscript ? `"${speechTranscript}"` : 'Say the word out loud...'}
                  </div>
                </div>
              </div>

              {/* Instant Tap Buttons */}
              {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#8aa0b8] hidden sm:inline">Tap to blast:</span>
                  {activeWords.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => voiceController.simulateUtterance(w.wordData.word)}
                      className="px-3.5 py-1.5 text-sm font-black rounded-xl bg-white border-2 border-[#8edbff] text-[#183153] hover:bg-[#eaf8ff] transition-all cursor-pointer shadow-[0_3px_0_#8edbff] active:translate-y-0.5"
                    >
                      🗣️ {w.wordData.word}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CRTOverlay>
      </div>

      {/* Phonics Color Highlight Guide Legend */}
      <PhonicsLegend isOpen={showLegend} onClose={() => setShowLegend(false)} />
    </div>
  );
};
