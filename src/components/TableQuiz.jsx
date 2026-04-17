import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RefreshCcw, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TableQuiz({ tableData, onExit }) {
  const [blankedCells, setBlankedCells] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Initialize Quiz
  useEffect(() => {
    generateQuiz();
  }, [tableData]);

  const generateQuiz = () => {
    const newBlanked = {};
    tableData.rows.forEach((row, rowIdx) => {
      // Pick a random column to hide for this row
      const randomCol = Math.floor(Math.random() * tableData.headers.length);
      newBlanked[`${rowIdx}-${randomCol}`] = { originalValue: row[randomCol] };
    });
    setBlankedCells(newBlanked);
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const handleInputChange = (rowIdx, colIdx, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [`${rowIdx}-${colIdx}`]: value
    }));
  };

  const normalizeAnswer = (ans) => {
    if (ans === null || ans === undefined) return '';
    return String(ans).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const checkAnswers = () => {
    let correctCount = 0;
    const totalCount = Object.keys(blankedCells).length;
    
    Object.keys(blankedCells).forEach(key => {
      const userAnswer = normalizeAnswer(userAnswers[key]);
      const originalAnswer = normalizeAnswer(blankedCells[key].originalValue);
      if (userAnswer === originalAnswer) {
        correctCount++;
      }
    });

    setScore({ correct: correctCount, total: totalCount });
    setIsSubmitted(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 mb-4 border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm bg-white relative"
    >
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-bold text-blue-800 uppercase tracking-wider">Memory Quiz</span>
        </div>
        {!isSubmitted && (
          <button onClick={onExit} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Exit
          </button>
        )}
      </div>

      <div className="overflow-x-auto p-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white">
            <tr>
              {tableData.headers.map((h, i) => (
                <th key={i} className="px-3 py-2 border-b border-r border-slate-100 last:border-r-0 font-bold text-slate-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="even:bg-slate-50/50">
                {row.map((cell, colIdx) => {
                  const key = `${rowIdx}-${colIdx}`;
                  const isBlanked = blankedCells[key];

                  // Cell is normal text
                  if (!isBlanked) {
                    return (
                      <td key={colIdx} className="px-3 py-2 border-b border-r border-slate-50 last:border-r-0 text-slate-600">
                        {cell}
                      </td>
                    );
                  }

                  // Cell is quiz input
                  const userAnswer = (userAnswers[key] || '');
                  let inputStateClasses = "bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-blue-900";
                  let icon = null;

                  if (isSubmitted) {
                    const correctlyAnswered = normalizeAnswer(userAnswer) === normalizeAnswer(isBlanked.originalValue);
                    if (correctlyAnswered) {
                      inputStateClasses = "bg-emerald-50 border-emerald-400 text-emerald-800";
                      icon = <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />;
                    } else {
                      inputStateClasses = "bg-red-50 border-red-400 text-red-800";
                      icon = <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />;
                    }
                  }

                  return (
                    <td key={colIdx} className="px-3 py-1.5 border-b border-r border-slate-50 last:border-r-0 relative min-w-[140px]">
                      <input 
                        type="text"
                        disabled={isSubmitted}
                        value={userAnswer}
                        onChange={(e) => handleInputChange(rowIdx, colIdx, e.target.value)}
                        placeholder="?"
                        className={`w-full px-3 py-1.5 border rounded-lg outline-none transition-all font-semibold shadow-inner ${inputStateClasses} pr-8`}
                      />
                      {icon}
                      {isSubmitted && normalizeAnswer(userAnswer) !== normalizeAnswer(isBlanked.originalValue) && (
                        <div className="text-[10px] text-red-600 mt-1 font-bold absolute -bottom-3 left-3 bg-white px-1 shadow-sm border border-red-100 rounded">
                          Answer: {isBlanked.originalValue}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {isSubmitted ? (
          <>
            <div className={`font-bold text-lg ${score.correct === score.total ? 'text-emerald-600' : 'text-blue-600'}`}>
              Score: {score.correct} / {score.total}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={generateQuiz} 
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all"
              >
                <RefreshCcw className="w-4 h-4" /> Try Again
              </button>
              <button 
                onClick={onExit} 
                className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Finish
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-slate-500">Fill in all the blanks to test your memory.</span>
            <button 
              onClick={checkAnswers} 
              className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              Submit Quiz
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
