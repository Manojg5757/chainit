import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Grid, List, Search, Loader2 } from 'lucide-react';
import IdeaCard from './components/IdeaCard';
import IdeaUploadForm from './components/IdeaUploadForm';
import { supabase } from './lib/supabase';

const INITIAL_IDEAS = [
  {
    id: '1',
    title: 'How to restart router',
    category: 'Technology',
    subject: 'Networking',
    description: 'Unplug the power cable from the back, wait 30 seconds, then plug it back in. Wait for all lights to turn green before testing connection.',
    date: new Date(Date.now() - 86400000).toISOString(),
    author: 'Admin'
  },
  {
    id: '2',
    title: 'Grocery List App Structure',
    category: 'Engineering',
    subject: 'System Design',
    description: 'Need a users table, a lists table, and an items table. The items table should have a boolean "checked" state. Use React native for frontend.',
    date: new Date(Date.now() - 172800000).toISOString(),
    author: 'Dev'
  },
  {
    id: '3',
    title: 'Office Wifi Password',
    category: 'General',
    subject: 'Passwords',
    description: 'Network: Guest_Network_5G\nPassword: CoffeeAndCode2024!',
    date: new Date().toISOString(),
    author: 'HR'
  }
];

const CATEGORIES = ['All', 'General', 'Science', 'Medical', 'Engineering', 'Technology', 'Productivity', 'Business', 'Arts', 'Personal', 'Other'];

export default function App() {
  const [ideas, setIdeas] = useState(INITIAL_IDEAS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Initial Fetch from Supabase
  useEffect(() => {
    async function fetchIdeas() {
      if (!supabase) return; // Fallback to initial local state if no keys

      setIsLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Supabase data:', error);
      } else if (data && data.length > 0) {
        // Map postgres 'created_at' to expected 'date' prop locally
        const mappedData = data.map(i => ({...i, date: i.created_at}));
        setIdeas(mappedData);
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(true);
        // Supabase is connected but empty, let's just clear the initial mocks 
        // to show a real blank slate.
        setIdeas([]);
      }
      setIsLoading(false);
    }
    
    fetchIdeas();
  }, []);

  const handlePostIdea = async (formDataPayload) => {
    const { imageFile, ...baseData } = formDataPayload;
    
    let imageUrl = null;

    // 1. Handle File Upload if Supabase is connected
    if (imageFile && supabase) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('idea-photos')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Failed to upload image. Please check your Supabase Storage policies.');
        return; // Halt if upload fails
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('idea-photos')
        .getPublicUrl(filePath);
        
      imageUrl = publicUrlData.publicUrl;
    }

    // fallback object shape
    const newIdea = {
      ...baseData,
      image_url: imageUrl,
      // override dummy ids if using supabase
    };

    // 2. Insert to Database
    if (supabase) {
      const { data, error } = await supabase
        .from('ideas')
        .insert([{
          title: newIdea.title,
          description: newIdea.description,
          category: newIdea.category,
          subject: newIdea.subject,
          author: newIdea.author,
          table_data: newIdea.table_data,
          image_url: newIdea.image_url
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting idea:', error);
        alert('Failed to post idea to database. Check RLS policies.');
        return;
      }
      
      // Prepend the new saved idea to state
      setIdeas([{...data, date: data.created_at}, ...ideas]);
    } else {
      // Local fallback
      // Since it's local, imageFile preview URL was created in the form but we need to create it here to persist locally as blob
      if (imageFile) {
         newIdea.image_url = URL.createObjectURL(imageFile);
      }
      setIdeas([newIdea, ...ideas]);
    }

    setIsUploading(false);
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory;
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (idea.subject && idea.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/30">
      
      {/* HEADER NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-900 cursor-pointer" onClick={() => {setIsUploading(false); setSelectedCategory('All');}}>
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-slate-800">
              Chain It
            </span>
            {isBackendConnected && (
              <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200">
                Live
              </span>
            )}
          </div>

          {!isUploading && (
            <button 
              onClick={() => setIsUploading(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Idea</span>
            </button>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-24 relative z-10 flex flex-col md:flex-row gap-8">
        
        {isUploading ? (
          <div className="w-full max-w-2xl mx-auto">
            <IdeaUploadForm 
              onSubmit={handlePostIdea} 
              onCancel={() => setIsUploading(false)} 
            />
          </div>
        ) : (
          <>
            {/* SIDEBAR */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl p-5 shadow-lg shadow-slate-200/40">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Categories</h3>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map(cat => {
                    const count = cat === 'All' ? ideas.length : ideas.filter(i => i.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedCategory === cat 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {cat}
                        <span className="float-right text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* FEED */}
            <div className="flex-1">
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                  {selectedCategory === 'All' ? 'All Ideas' : `${selectedCategory} Ideas`}
                  {isLoading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                </h2>
                
                <div className="relative w-full sm:w-auto">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search ideas..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              {filteredIdeas.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredIdeas.map(idea => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                  <Grid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No ideas found</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                    {searchQuery 
                      ? `We couldn't find any ideas matching "${searchQuery}" in ${selectedCategory}.` 
                      : `You haven't posted any ideas in the ${selectedCategory} category yet.`}
                  </p>
                  <button 
                    onClick={() => setIsUploading(true)}
                    className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
                  >
                    Post the first one →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </main>

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/20 blur-[150px]" />
      </div>
    </div>
  );
}
