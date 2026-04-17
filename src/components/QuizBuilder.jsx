import React from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

export default function QuizBuilder({ quiz, setQuiz }) {
  
  const addQuestion = () => {
    setQuiz([
      ...quiz,
      { id: Date.now().toString(), question: '', options: ['', '', '', ''], correctIndex: 0 }
    ]);
  };

  const removeQuestion = (id) => {
    setQuiz(quiz.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuiz(quiz.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId, optIdx, val) => {
    setQuiz(quiz.map(q => {
      if (q.id !== qId) return q;
      const newOpts = [...q.options];
      newOpts[optIdx] = val;
      return { ...q, options: newOpts };
    }));
  };

  return (
    <div className="space-y-6 mt-12 p-8 bg-[#F8FAFC] rounded-3xl border-2 border-gray-100">
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
        <div>
          <h3 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-[#FF6B35]" />
            Knowledge Quiz
          </h3>
          <p className="text-sm text-gray-500 mt-1">Test readers' understanding by adding multiple-choice questions.</p>
        </div>
      </div>

      {quiz.map((q, qIndex) => (
        <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group focus-within:border-[#3852B4]/40 transition-colors">
          <button 
            type="button" 
            onClick={() => removeQuestion(q.id)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-full"
            title="Remove Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="mb-6 pr-10">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Question {qIndex + 1}</label>
            <input 
              type="text" 
              value={q.question}
              onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
              placeholder="E.g., What does the R stand for?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#3852B4] font-bold text-gray-800 transition-colors"
            />
          </div>

          <div className="space-y-3">
             <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Options & Correct Answer</label>
             {q.options.map((opt, oIdx) => (
               <div key={oIdx} className="flex items-center gap-4">
                 <label className="relative flex items-center justify-center cursor-pointer">
                   <input 
                     type="radio" 
                     name={`correct-${q.id}`} 
                     checked={q.correctIndex === oIdx}
                     onChange={() => updateQuestion(q.id, 'correctIndex', oIdx)}
                     className="w-5 h-5 text-[#3852B4] border-gray-300 focus:ring-[#3852B4] cursor-pointer"
                   />
                 </label>
                 <input 
                   type="text"
                   value={opt}
                   onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                   placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                   className={`flex-1 px-4 py-3 border-2 rounded-xl outline-none text-sm transition-colors font-medium ${q.correctIndex === oIdx ? 'border-green-400 bg-green-50 text-green-900' : 'border-gray-200 focus:border-[#3852B4] text-gray-700'}`}
                 />
                 {q.correctIndex === oIdx && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded w-16 text-center">Correct</span>}
                 {q.correctIndex !== oIdx && <span className="w-16"></span>}
               </div>
             ))}
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addQuestion} 
        className="w-full py-4 border-2 border-dashed border-[#3852B4]/30 text-[#3852B4] font-bold rounded-2xl hover:bg-[#3852B4]/5 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Add Question
      </button>
    </div>
  );
}
