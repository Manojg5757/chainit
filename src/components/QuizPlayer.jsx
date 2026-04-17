import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function QuizPlayer({ quiz, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const currentQ = quiz[currentIndex];

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 p-8 text-center max-w-2xl mx-auto animate-fade-in my-8">
        <Award className={`w-20 h-20 mx-auto mb-4 ${percentage >= 70 ? 'text-green-500' : 'text-[#FF6B35]'}`} />
        <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-2">Quiz Completed!</h2>
        <p className="text-gray-500 text-lg mb-8">You scored {score} out of {quiz.length} ({percentage}%)</p>
        <button onClick={onComplete} className="px-8 py-3 bg-[#3852B4] text-white font-bold rounded-xl hover:bg-[#2A3A8F] shadow-sm transition-colors">
          Return to Document
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 p-8 lg:p-12 max-w-3xl mx-auto my-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} of {quiz.length}</h2>
        <span className="text-[#FF6B35] font-bold bg-[#FF6B35]/10 px-4 py-1 rounded-full text-sm">Score: {score}</span>
      </div>
      
      <h3 className="text-2xl font-bold text-[#1A1A2E] mb-8 leading-tight">{currentQ.question}</h3>
      
      <div className="space-y-4 mb-8">
        {currentQ.options.map((opt, idx) => {
          let stateClass = "border-gray-200 hover:border-[#3852B4] bg-white";
          let Icon = null;
          
          if (isAnswered) {
             if (idx === currentQ.correctIndex) {
               stateClass = "border-green-500 bg-green-50 text-green-800 shadow-md";
               Icon = <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />;
             } else if (idx === selectedOption) {
               stateClass = "border-red-500 bg-red-50 text-red-800 shadow-md";
               Icon = <XCircle className="w-6 h-6 text-red-500 shrink-0" />;
             } else {
               stateClass = "border-gray-100 bg-gray-50 opacity-50";
             }
          }

          return (
            <button 
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border-[3px] transition-all font-medium flex items-center justify-between gap-4 ${stateClass}`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${isAnswered && idx === currentQ.correctIndex ? 'bg-green-100 text-green-600' : isAnswered && idx === selectedOption ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-lg">{opt}</span>
              </div>
              {Icon}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="flex justify-end animate-fade-in mt-4 border-t border-gray-100 pt-6">
          <button onClick={handleNext} className="button-bounce px-8 py-4 bg-[#FF6B35] hover:bg-[#E5552A] text-white font-bold rounded-xl transition-colors flex items-center gap-3 shadow-lg">
            {currentIndex < quiz.length - 1 ? 'Next Question' : 'See Results'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
