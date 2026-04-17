import React, { useState } from 'react';
import { Tag, Calendar, User, LayoutGrid, BrainCircuit } from 'lucide-react';
import TableQuiz from './TableQuiz';

export default function IdeaCard({ idea }) {
  const [quizMode, setQuizMode] = useState(false);
  const hasImage = !!idea.image_url;
  const hasTable = !!idea.table_data && idea.table_data.headers && idea.table_data.headers.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      
      {/* Optional Image Header */}
      {hasImage && (
        <div className="w-full h-48 sm:h-56 bg-slate-100 overflow-hidden border-b border-slate-100">
          <img src={idea.image_url} alt={idea.title} className="w-full h-full object-cover object-center" />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
              <Tag className="w-3.5 h-3.5" />
              {idea.category}
            </span>
            {idea.subject && (
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
                {idea.subject}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(idea.date).toLocaleDateString()}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-3">{idea.title}</h3>
        
        {idea.description && (
          <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap mb-4">
            {idea.description}
          </p>
        )}

        {/* Optional Data Table OR Quiz Mode */}
        {hasTable && !quizMode && (
          <div className="mt-2 mb-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Structured Data</span>
              </div>
              <button 
                onClick={() => setQuizMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                Test Memory
              </button>
            </div>
            <div className="overflow-x-auto p-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white">
                  <tr>
                    {idea.table_data.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 border-b border-r border-slate-100 last:border-r-0 font-bold text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {idea.table_data.rows.map((row, i) => (
                    <tr key={i} className="even:bg-slate-50/50 hover:bg-blue-50/30 transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 border-b border-r border-slate-50 last:border-r-0 text-slate-600">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {hasTable && quizMode && (
          <TableQuiz 
            tableData={idea.table_data} 
            onExit={() => setQuizMode(false)} 
          />
        )}
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2 relative z-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-slate-600 truncate">{idea.author || 'Anonymous'}</span>
        </div>
      </div>
    </div>
  );
}
