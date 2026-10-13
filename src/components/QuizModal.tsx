import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/tectonicsData';
import { X, Award, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    soundFx.playClick();
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    soundFx.playClick();
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-white">판구조론 탐구 자가진단 퀴즈</h2>
              <p className="text-xs text-slate-400">시뮬레이터에서 관찰한 원리를 직접 점검해 보세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-200 space-y-5">
          {!showResult ? (
            <>
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>문제 {currentIdx + 1} / {QUIZ_QUESTIONS.length}</span>
                <span className="font-mono text-sky-400">현재 점수: {score}점</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <h3 className="text-sm font-semibold text-white leading-relaxed">
                  Q{currentIdx + 1}. {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  let optStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-200';
                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold';
                    } else if (idx === selectedOption) {
                      optStyle = 'border-rose-500 bg-rose-500/10 text-rose-300';
                    } else {
                      optStyle = 'border-slate-800/40 opacity-40 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{idx + 1}. {opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation on answer */}
              {isAnswered && (
                <div className="p-3.5 bg-sky-950/40 border border-sky-800/60 rounded-xl text-xs space-y-1 animate-in fade-in">
                  <div className="font-semibold text-sky-400">
                    {selectedOption === currentQ.correctIndex ? '정답입니다! 🎉' : '아쉽네요, 다시 확인해 보세요.'}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="py-2 px-5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg"
                  >
                    {currentIdx < QUIZ_QUESTIONS.length - 1 ? '다음 문제로 →' : '최종 결과 보기'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                <Award className="w-8 h-8 text-sky-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">퀴즈 완료!</h3>
                <p className="text-xs text-slate-400 mt-1">판구조론 탐구 평가 결과</p>
              </div>

              <div className="text-3xl font-bold font-mono text-sky-400">
                {score} / {QUIZ_QUESTIONS.length}
                <span className="text-xs text-slate-400 font-sans ml-2">
                  ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}점)
                </span>
              </div>

              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                {score === QUIZ_QUESTIONS.length
                  ? '완벽합니다! 판구조론의 4대 경계와 베니오프대, 맨틀 대류의 원리를 정확히 이해하셨습니다.'
                  : score >= 3
                  ? '우수한 성적입니다! 단면 시뮬레이터와 개념 가이드를 통해 세부 개념을 조금 더 다져보세요.'
                  : '시뮬레이터에서 판의 밀도 조절과 지진 진원 깊이를 다시 한번 관찰해 보신 후 도전해 보세요!'}
              </p>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>다시 풀기</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2 px-5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow"
                >
                  실험실로 돌아가기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
