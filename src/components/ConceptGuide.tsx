import React, { useState } from 'react';
import { BOUNDARIES_DATA } from '../data/tectonicsData';
import { BoundaryType } from '../types/tectonics';
import { X, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

interface ConceptGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBoundary: (type: BoundaryType) => void;
}

export const ConceptGuide: React.FC<ConceptGuideProps> = ({
  isOpen,
  onClose,
  onSelectBoundary
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'divergent' | 'convergent_subduction' | 'convergent_collision' | 'transform'>('comparison');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-white">판구조론 핵심 개념 가이드</h2>
              <p className="text-xs text-slate-400">지구과학 교육과정 판의 경계 및 지각 변동 총정리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'comparison'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4대 판 경계 종합 비교표
          </button>
          <button
            onClick={() => setActiveTab('divergent')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'divergent'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            발산형 (해령·열곡)
          </button>
          <button
            onClick={() => setActiveTab('convergent_subduction')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'convergent_subduction'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            수렴형 (섭입대)
          </button>
          <button
            onClick={() => setActiveTab('convergent_collision')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'convergent_collision'
                ? 'border-yellow-500 text-yellow-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            수렴형 (충돌대)
          </button>
          <button
            onClick={() => setActiveTab('transform')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'transform'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            보존형 (변환단층)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200 text-xs">
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-300 font-semibold border-b border-slate-800 text-[11px]">
                      <th className="p-3">경계 구분</th>
                      <th className="p-3">상대 운동</th>
                      <th className="p-3">판의 변화</th>
                      <th className="p-3">대표 지형</th>
                      <th className="p-3">지진 깊이</th>
                      <th className="p-3">화산 활동</th>
                      <th className="p-3">대표 지역</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-orange-400">발산형 경계</td>
                      <td className="p-3 text-slate-300">멀어짐 (← →)</td>
                      <td className="p-3 text-emerald-400 font-medium">새로운 지각 생성</td>
                      <td className="p-3">해령, 중앙 열곡, 열곡대</td>
                      <td className="p-3 text-emerald-400">천발 지진만</td>
                      <td className="p-3 text-red-400 font-medium">활발 (현무암질)</td>
                      <td className="p-3 text-slate-400">대서양 중앙해령, 동아프리카 열곡대</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-sky-400">수렴형: 섭입대</td>
                      <td className="p-3 text-slate-300">모여듦 (→ ←)</td>
                      <td className="p-3 text-rose-400 font-medium">해양판 소멸 (섭입)</td>
                      <td className="p-3">해구, 호상열도, 습곡산맥</td>
                      <td className="p-3 text-purple-400 font-medium">천발 ~ 중발 ~ 심발 (베니오프대)</td>
                      <td className="p-3 text-red-400 font-medium">활발 (안산암질)</td>
                      <td className="p-3 text-slate-400">마리아나 해구, 일본 열도, 안데스 산맥</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-yellow-400">수렴형: 충돌대</td>
                      <td className="p-3 text-slate-300">모여듦 (→ ←)</td>
                      <td className="p-3 text-slate-300 font-medium">판 소멸 없음 (융기)</td>
                      <td className="p-3">거대 습곡산맥, 고원, 역단층</td>
                      <td className="p-3 text-amber-400 font-medium">천발 ~ 중발 지진</td>
                      <td className="p-3 text-slate-500 font-semibold">화산 없음 (지각 70km)</td>
                      <td className="p-3 text-slate-400">히말라야 산맥, 알프스 산맥</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-emerald-400">보존형 경계</td>
                      <td className="p-3 text-slate-300">어긋남 (⇅)</td>
                      <td className="p-3 text-slate-300 font-medium">생성·소멸 없음 (보존)</td>
                      <td className="p-3">변환단층, 단층애</td>
                      <td className="p-3 text-emerald-400">천발 지진만 (강력)</td>
                      <td className="p-3 text-slate-500 font-semibold">화산 없음</td>
                      <td className="p-3 text-slate-400">산안드레아스 단층</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Core Principle Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-sky-400 text-sm">판의 밀도와 섭입의 원리</h3>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    해양 지각(현무암질, 평균 밀도 약 3.0 g/cm³)은 대륙 지각(화강암질, 평균 밀도 약 2.7 g/cm³)보다 밀도가 큽니다.
                    따라서 두 판이 수렴할 때 밀도가 큰 해양판이 밀도가 작은 대륙판 아래로 파고들어(섭입) 맨틀 속으로 가라앉습니다.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-purple-400 text-sm">베니오프대 (Benioff Zone)란?</h3>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    섭입대에서 해양판이 비스듬히 기울어져 파고들기 때문에, 판 경계면을 따라 발생하는 지진의 진원 깊이가
                    해구(천발: 0~70km)에서 대륙 쪽으로 갈수록(중발: 70~300km → 심발: 300~700km) 점진적으로 깊어지는 경사면입니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'comparison' && (
            <div className="space-y-4">
              {(() => {
                const b = BOUNDARIES_DATA[activeTab];
                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">{b.title}</h3>
                        <button
                          onClick={() => {
                            onSelectBoundary(b.id);
                            onClose();
                          }}
                          className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                        >
                          <span>이 경계 단면 실험하기</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{b.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <h4 className="font-bold text-sky-400 text-xs">핵심 지질 포인트</h4>
                        <ul className="space-y-1.5 text-slate-300 text-[11px]">
                          {b.keyPoints.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <h4 className="font-bold text-amber-400 text-xs">지진 및 화산 특성</h4>
                        <div className="space-y-1.5 text-[11px] text-slate-300">
                          <div>
                            <span className="font-semibold text-slate-200">지진 발생: </span>
                            <span>{b.earthquakes.depth} - {b.earthquakes.description}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200">화산 활동: </span>
                            <span>{b.volcanism.exists ? '화산 발생' : '화산 없음'} - {b.volcanism.description}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200">대표 지역: </span>
                            <span>{b.realWorldExamples.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
