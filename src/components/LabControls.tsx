import React from 'react';
import { BoundaryType, SimState } from '../types/tectonics';
import { BOUNDARIES_DATA } from '../data/tectonicsData';
import { Play, Pause, StepForward, RotateCcw, Volume2, VolumeX, Layers, Activity, Flame, Wind, Tag, Ruler, HelpCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LabControlsProps {
  simState: SimState;
  onUpdateSimState: (updater: (prev: SimState) => SimState) => void;
  onOpenGuide: () => void;
  onOpenQuiz: () => void;
}

export const LabControls: React.FC<LabControlsProps> = ({
  simState,
  onUpdateSimState,
  onOpenGuide,
  onOpenQuiz
}) => {
  const currentBoundary = BOUNDARIES_DATA[simState.boundaryType];

  const handleBoundaryChange = (type: BoundaryType) => {
    soundFx.playClick();
    const targetData = BOUNDARIES_DATA[type];
    onUpdateSimState(prev => ({
      ...prev,
      boundaryType: type,
      plateDensityLeft: targetData.plateLeft.defaultDensity,
      plateDensityRight: targetData.plateRight.defaultDensity,
      time: 0
    }));
  };

  const togglePlay = () => {
    soundFx.playClick();
    onUpdateSimState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const stepForward = () => {
    soundFx.playClick();
    onUpdateSimState(prev => ({
      ...prev,
      isPlaying: false,
      time: (prev.time + 4) % 100
    }));
  };

  const resetSimulation = () => {
    soundFx.playClick();
    onUpdateSimState(prev => ({ ...prev, time: 0 }));
  };

  const toggleSound = () => {
    const nextVal = !simState.soundEnabled;
    soundFx.setMuted(!nextVal);
    onUpdateSimState(prev => ({ ...prev, soundEnabled: nextVal }));
  };

  // Density deduction calculation
  const dDiff = Number((simState.plateDensityLeft - simState.plateDensityRight).toFixed(2));
  let densityStatusText = '';
  let densityStatusColor = 'text-sky-400';

  if (Math.abs(dDiff) < 0.05) {
    densityStatusText = '두 판의 밀도가 유사하여 섭입하지 않고 충돌·융기합니다.';
    densityStatusColor = 'text-amber-400';
  } else if (dDiff > 0) {
    densityStatusText = `좌측 판(${simState.plateDensityLeft} g/cm³)이 더 무거워 우측 판 아래로 섭입합니다 (밀도차 +${dDiff} g/cm³).`;
    densityStatusColor = 'text-sky-400';
  } else {
    densityStatusText = `우측 판(${simState.plateDensityRight} g/cm³)이 더 무거워 좌측 판 아래로 섭입합니다 (밀도차 ${dDiff} g/cm³).`;
    densityStatusColor = 'text-purple-400';
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-5 text-slate-200">
      {/* 1. Boundary Type Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">판 경계 유형 선택</span>
          <span className="text-[11px] text-sky-400 font-medium">4가지 핵심 유형</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <button
            onClick={() => handleBoundaryChange('divergent')}
            className={`px-2.5 py-2 rounded-md text-xs font-medium text-left transition-all ${
              simState.boundaryType === 'divergent'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="font-semibold text-[11px]">1. 발산형 (해령·열곡)</div>
            <div className="text-[10px] text-slate-400 truncate">판의 멀어짐 & 새 지각 생성</div>
          </button>

          <button
            onClick={() => handleBoundaryChange('convergent_subduction')}
            className={`px-2.5 py-2 rounded-md text-xs font-medium text-left transition-all ${
              simState.boundaryType === 'convergent_subduction'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="font-semibold text-[11px]">2. 수렴형 (섭입대)</div>
            <div className="text-[10px] text-slate-400 truncate">해구, 호상열도, 베니오프대</div>
          </button>

          <button
            onClick={() => handleBoundaryChange('convergent_collision')}
            className={`px-2.5 py-2 rounded-md text-xs font-medium text-left transition-all ${
              simState.boundaryType === 'convergent_collision'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="font-semibold text-[11px]">3. 수렴형 (충돌대)</div>
            <div className="text-[10px] text-slate-400 truncate">히말라야 거대 습곡산맥</div>
          </button>

          <button
            onClick={() => handleBoundaryChange('transform')}
            className={`px-2.5 py-2 rounded-md text-xs font-medium text-left transition-all ${
              simState.boundaryType === 'transform'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="font-semibold text-[11px]">4. 보존형 (변환단층)</div>
            <div className="text-[10px] text-slate-400 truncate">산안드레아스 수평 엇갈림</div>
          </button>
        </div>
      </div>

      {/* 2. Playback & Timeline Controls */}
      <div className="space-y-2.5 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">시뮬레이션 재생 제어</span>
          <div className="flex items-center gap-1">
            {[0.5, 1, 2].map(spd => (
              <button
                key={spd}
                onClick={() => {
                  soundFx.playClick();
                  onUpdateSimState(prev => ({ ...prev, speed: spd }));
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  simState.speed === spd
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Play / Step / Reset Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${
              simState.isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg'
            }`}
          >
            {simState.isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>시뮬레이션 재생</span>
              </>
            )}
          </button>

          <button
            onClick={stepForward}
            title="1단계 전진"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/60"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            onClick={resetSimulation}
            title="처음으로 리셋"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/60"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            title={simState.soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            className={`p-2 rounded-lg transition-colors border ${
              simState.soundEnabled
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700/60'
            }`}
          >
            {simState.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>타임라인 진행도</span>
            <span className="font-mono text-slate-300">{Math.round(simState.time)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={simState.time}
            onChange={e => {
              onUpdateSimState(prev => ({
                ...prev,
                isPlaying: false,
                time: parseFloat(e.target.value)
              }));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      </div>

      {/* 3. Plate Density Virtual Experiment (밀도 조절 가상 실험실) */}
      <div className="space-y-3 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">가상 실험: 판 밀도 조절</span>
          <span className="text-[11px] text-amber-400 font-mono">단위: g/cm³</span>
        </div>

        {/* Density Sliders */}
        <div className="space-y-2.5 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          {/* Plate Left Density */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300">좌측 판 ({currentBoundary.plateLeft.name.split('/')[0]}):</span>
              <span className="font-mono text-sky-400 font-bold">{simState.plateDensityLeft} g/cm³</span>
            </div>
            <input
              type="range"
              min="2.5"
              max="3.4"
              step="0.1"
              value={simState.plateDensityLeft}
              onChange={e => {
                const val = parseFloat(e.target.value);
                onUpdateSimState(prev => ({ ...prev, plateDensityLeft: val }));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Plate Right Density */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300">우측 판 ({currentBoundary.plateRight.name.split('/')[0]}):</span>
              <span className="font-mono text-sky-400 font-bold">{simState.plateDensityRight} g/cm³</span>
            </div>
            <input
              type="range"
              min="2.5"
              max="3.4"
              step="0.1"
              value={simState.plateDensityRight}
              onChange={e => {
                const val = parseFloat(e.target.value);
                onUpdateSimState(prev => ({ ...prev, plateDensityRight: val }));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Real-time deduction text */}
          <div className="p-2 bg-slate-900/90 rounded border border-slate-800 text-[11px] leading-relaxed">
            <span className="font-semibold text-slate-300">물리 판정: </span>
            <span className={densityStatusColor}>{densityStatusText}</span>
          </div>

          {/* Quick experiment presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => {
                soundFx.playClick();
                onUpdateSimState(prev => ({ ...prev, plateDensityLeft: 3.0, plateDensityRight: 2.7 }));
              }}
              className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
            >
              표준 섭입 (3.0 vs 2.7)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onUpdateSimState(prev => ({ ...prev, plateDensityLeft: 3.3, plateDensityRight: 2.7 }));
              }}
              className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
            >
              급경사 섭입 (3.3 vs 2.7)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onUpdateSimState(prev => ({ ...prev, plateDensityLeft: 2.7, plateDensityRight: 2.7 }));
              }}
              className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
            >
              대륙 충돌 (2.7 vs 2.7)
            </button>
          </div>
        </div>

        {/* Plate Speed slider */}
        <div className="pt-1">
          <div className="flex justify-between text-[11px] text-slate-300 mb-1">
            <span>판 이동 속도:</span>
            <span className="font-mono text-sky-400 font-bold">{simState.plateSpeedCmPerYear} cm/년</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={simState.plateSpeedCmPerYear}
            onChange={e => {
              const val = parseInt(e.target.value, 10);
              onUpdateSimState(prev => ({ ...prev, plateSpeedCmPerYear: val }));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
      </div>

      {/* 4. Layer Visibility Toggles */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">단면 관측 레이어</span>
          <Layers className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 p-1.5 rounded bg-slate-950/40 border border-slate-800/60 cursor-pointer hover:bg-slate-800/40 transition-colors">
            <input
              type="checkbox"
              checked={simState.showEarthquakes}
              onChange={e => onUpdateSimState(prev => ({ ...prev, showEarthquakes: e.target.checked }))}
              className="accent-sky-500 rounded"
            />
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">베니오프대 지진</span>
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded bg-slate-950/40 border border-slate-800/60 cursor-pointer hover:bg-slate-800/40 transition-colors">
            <input
              type="checkbox"
              checked={simState.showMagma}
              onChange={e => onUpdateSimState(prev => ({ ...prev, showMagma: e.target.checked }))}
              className="accent-sky-500 rounded"
            />
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[11px]">마그마 및 화산</span>
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded bg-slate-950/40 border border-slate-800/60 cursor-pointer hover:bg-slate-800/40 transition-colors">
            <input
              type="checkbox"
              checked={simState.showConvection}
              onChange={e => onUpdateSimState(prev => ({ ...prev, showConvection: e.target.checked }))}
              className="accent-sky-500 rounded"
            />
            <Wind className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[11px]">맨틀 대류 흐름</span>
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded bg-slate-950/40 border border-slate-800/60 cursor-pointer hover:bg-slate-800/40 transition-colors">
            <input
              type="checkbox"
              checked={simState.showLabels}
              onChange={e => onUpdateSimState(prev => ({ ...prev, showLabels: e.target.checked }))}
              className="accent-sky-500 rounded"
            />
            <Tag className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px]">지질 구조 라벨</span>
          </label>
        </div>
      </div>

      {/* 5. Edu Concept & Quiz CTAs */}
      <div className="pt-2 border-t border-slate-800/80 flex gap-2">
        <button
          onClick={onOpenGuide}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>판구조론 개념 요약</span>
        </button>

        <button
          onClick={onOpenQuiz}
          className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow"
        >
          <span>탐구 자가진단 퀴즈</span>
        </button>
      </div>
    </div>
  );
};
