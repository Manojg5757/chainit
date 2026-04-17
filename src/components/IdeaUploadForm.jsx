import React, { useState } from 'react';
import { Send, AlertCircle, Plus, Table2, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PREDEFINED_CATEGORIES = [
  'General', 'Science', 'Medical', 'Engineering', 'Technology', 'Productivity', 'Business', 'Arts', 'Personal', 'Other'
];

export default function IdeaUploadForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    subject: '',
    description: '',
  });
  
  // Table Builder State
  const [includeTable, setIncludeTable] = useState(false);
  const [tableData, setTableData] = useState({
    headers: ['Idea', 'To Remember'],
    rows: [['', '']]
  });

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table Handlers
  const addColumn = () => {
    setTableData(prev => ({
      headers: [...prev.headers, `New Column`],
      rows: prev.rows.map(row => [...row, ''])
    }));
  };
  
  const addRow = () => {
    setTableData(prev => ({
      ...prev,
      rows: [...prev.rows, new Array(prev.headers.length).fill('')]
    }));
  };

  const removeColumn = (colIdx) => {
    if (tableData.headers.length <= 1) return;
    setTableData(prev => ({
      headers: prev.headers.filter((_, i) => i !== colIdx),
      rows: prev.rows.map(row => row.filter((_, i) => i !== colIdx))
    }));
  };

  const removeRow = (rowIdx) => {
    if (tableData.rows.length <= 1) return;
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== rowIdx)
    }));
  };

  const updateHeader = (colIdx, val) => {
    setTableData(prev => {
      const newHeaders = [...prev.headers];
      newHeaders[colIdx] = val;
      return { ...prev, headers: newHeaders };
    });
  };

  const updateCell = (rowIdx, colIdx, val) => {
    setTableData(prev => {
      const newRows = [...prev.rows];
      newRows[rowIdx][colIdx] = val;
      return { ...prev, rows: newRows };
    });
  };

  // Image Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    // Pass the payload up to App.jsx to handle backend interaction
    await onSubmit({
      ...formData,
      table_data: includeTable ? tableData : null,
      imageFile: imageFile
    });
    
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 my-6"
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Share an Idea</h2>
      <p className="text-slate-500 mb-6">Create a robust entry with optional structured tables and images.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Idea Title</label>
          <input 
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g. Remember wifi password, or Planets Order..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-slate-800 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-slate-800 outline-none transition-all appearance-none cursor-pointer"
            >
              {PREDEFINED_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Specific Subject (Optional)</label>
            <input 
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="e.g. Astronomy..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-slate-800 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional Context if using a Table/Image)</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Elaborate on your idea, mnemonic, or data..."
            className="w-full h-32 bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl p-4 text-slate-800 outline-none resize-none transition-all"
          />
        </div>
        
        {/* ENHANCEMENTS: Image and Table Toggles */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
           <span className="text-sm font-semibold text-slate-500 mr-2">Enhance:</span>
           
           <button 
             type="button" 
             onClick={() => setIncludeTable(!includeTable)}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all border ${includeTable ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
           >
             <Table2 className="w-4 h-4" />
             {includeTable ? 'Remove Table' : 'Add Table'}
           </button>

           <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all border ${imagePreview ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
             <ImageIcon className="w-4 h-4" />
             {imagePreview ? 'Change Photo' : 'Upload Photo'}
             <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
           </label>
        </div>

        {/* IMAGE PREVIEW */}
        {imagePreview && (
          <div className="relative w-full sm:w-64 h-40 mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TABLE BUILDER UI */}
        {includeTable && (
          <div className="mt-6 p-1 overflow-x-auto">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50">
                  <tr>
                    {tableData.headers.map((header, colIdx) => (
                      <th key={colIdx} className="p-2 border-b border-r border-slate-200 last:border-r-0 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <input 
                            value={header}
                            onChange={(e) => updateHeader(colIdx, e.target.value)}
                            className="bg-transparent font-bold text-slate-700 outline-none w-full !min-w-0" 
                            placeholder="Header..." 
                          />
                          <button type="button" onClick={() => removeColumn(colIdx)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="p-2 border-b border-slate-200 bg-white w-10">
                      <button type="button" onClick={addColumn} className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="Add Column">
                        <Plus className="w-4 h-4" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="group">
                      {row.map((cell, colIdx) => (
                        <td key={colIdx} className="p-2 border-b border-r border-slate-100 last:border-r-0">
                          <input 
                            value={cell}
                            onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                            className="bg-transparent text-slate-600 outline-none w-full !min-w-0" 
                            placeholder="Value..." 
                          />
                        </td>
                      ))}
                      <td className="p-2 border-b border-slate-50">
                        <button type="button" onClick={() => removeRow(rowIdx)} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-center">
                 <button type="button" onClick={addRow} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                   <Plus className="w-3.5 h-3.5" /> Add Row
                 </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Uploading...' : <><Send className="w-4 h-4" /> Post Idea</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
