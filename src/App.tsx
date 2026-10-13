/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GlobeView } from './components/GlobeView';
import { CrossSectionLab } from './components/CrossSectionLab';
import { LabControls } from './components/LabControls';
import { ConceptGuide } from './components/ConceptGuide';
import { QuizModal } from './components/QuizModal';
import { BoundaryType, SimState } from './types/tectonics';
import { BOUNDARIES_DATA } from './data/tectonicsData';
import { Globe, Layers, BookOpen, Award, RotateCcw, ExternalLink, Sparkles } from 'lucide-react';
import { soundFx } from './utils/audio';

export default function App() {
  const [activeView, setActiveView] = useState<'globe' | 'crossSection'>('crossSection');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Simulation State
  const [simState, setSimState] = useState<SimState>({
    boundaryType: 'convergent_subduction',
    isPlaying: true,
    time: 0,
    speed: 1,
    plateDensityLeft: 3.0, // oceanic plate
    plateDensityRight: 2.7, // continental plate
    plateSpeedCmPerYear: 5,
    showEarthquakes: true,
    showMagma: true,
    showConvection: true,
    showLabels: true,
    showDepthScale: true,
    soundEnabled: false
  });

  const currentBoundary = BOUNDARIES_DATA[simState.boundaryType] || BOUNDARIES_DATA.convergent_subduction;

  const handleSelectBoundary = (type: BoundaryType) => {
    soundFx.playClick();
    const targetData = BOUNDARIES_DATA[type];
    setSimState(prev => ({
      ...prev,
      boundaryType: type,
      plateDensityLeft: targetData.plateLeft.defaultDensity,
      plateDensityRight: targetData.plateRight.defaultDensity,
      time: 0
    }));
  };

  const handleNavigateToCrossSection = (type: BoundaryType) => {
    handleSelectBoundary(type);
    setActiveView('crossSection');
  };

  const handleResetAll = () => {
    soundFx.playClick();
    const targetData = BOUNDARIES_DATA[simState.boundaryType];
    setSimState(prev => ({
      ...prev,
      time: 0,
      isPlaying: true,
      plateDensityLeft: targetData.plateLeft.defaultDensity,
      plateDensityRight: targetData.plateRight.defaultDensity,
      plateSpeedCmPerYear: 5
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Links) - Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <span className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
              PT
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">
              판구조론 시뮬레이션 실험실
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveView('crossSection');
              }}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'crossSection' ? 'text-sky-400 font-semibold' : 'hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D 단면 실험실</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setActiveView('globe');
              }}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'globe' ? 'text-sky-400 font-semibold' : 'hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D 지구본 탐색</span>
            </button>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>판 경계 개념표</span>
            </button>

            <button
              onClick={() => setIsQuizOpen(true)}
              className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Award className="w-3.5 h-3.5" />
              <span>탐구 퀴즈</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetAll}
              title="실험 파라미터 초기화"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">실험 초기화</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Sandbox Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* View Switcher Bar (Mobile & Desktop Quick Access) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveView('crossSection');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeView === 'crossSection'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>정밀 단면 시뮬레이터</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveView('globe');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeView === 'globe'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D 지구본 판 경계 탐색기</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>현재 관측:</span>
            <span className="font-semibold text-white px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
              {currentBoundary.koreanName}
            </span>
          </div>
        </div>

        {/* Two-Zone Sandbox Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Zone 1: Interactive Stage (Canvas / 3D Globe) */}
          <div className="lg:col-span-8 space-y-4">
            {activeView === 'crossSection' ? (
              <CrossSectionLab
                simState={simState}
                onUpdateSimState={setSimState}
              />
            ) : (
              <GlobeView
                onSelectBoundary={handleSelectBoundary}
                onNavigateToCrossSection={handleNavigateToCrossSection}
              />
            )}

            {/* Current Boundary Scientific Overview Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider">
                    지구과학 탐구 가이드
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {currentBoundary.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">판의 소멸/생성:</span>
                  <span className="font-semibold text-emerald-400">{currentBoundary.plateFate}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentBoundary.description}
              </p>

              {/* Quick specs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">발달 지형</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                    {currentBoundary.topography.join(', ')}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">지진 활동</span>
                  <span className="font-semibold text-amber-400 mt-0.5 block truncate">
                    {currentBoundary.earthquakes.depth.split('(')[0]}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">화산 활동</span>
                  <span className="font-semibold text-red-400 mt-0.5 block truncate">
                    {currentBoundary.volcanism.exists ? '활발하게 발생' : '화산 없음'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Zone 2: Control & Virtual Experiment Deck */}
          <div className="lg:col-span-4">
            <LabControls
              simState={simState}
              onUpdateSimState={setSimState}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenQuiz={() => setIsQuizOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span>판구조론 인터랙티브 시뮬레이션 가상 실험실</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>자바실험실(JavaLab) 과학 시뮬레이션 교육 철학 계승</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>대륙지각 (2.7 g/cm³) vs 해양지각 (3.0 g/cm³)</span>
            <span>·</span>
            <span>베니오프대(Benioff Zone) 진원 심도 연산</span>
          </div>
        </div>
      </footer>

      {/* Concept Guide & Quiz Modals */}
      <ConceptGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSelectBoundary={handleSelectBoundary}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />
    </div>
  );
}
