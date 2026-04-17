import React, { useState, useEffect } from 'react';
import { Plus, Grid, Search, Loader2, LogOut, X } from 'lucide-react';
import IdeaCard from './components/IdeaCard';
import IdeaUploadForm from './components/IdeaUploadForm';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import imageCompression from 'browser-image-compression';
import Logo from './assets/logo.png';

const CATEGORIES = ['All', 'General', 'Science', 'Medical', 'Engineering', 'Technology', 'Productivity', 'Business', 'Arts', 'Personal', 'Other'];

export default function App() {
  const [session, setSession] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Public Feed Control
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auth Initialization
  useEffect(() => {
    if (!supabase) {
      setIsInitializing(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowAuthModal(false); // Close modal when logged in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Ideas GLOBALLY
  useEffect(() => {
    async function fetchIdeas() {
      if (!supabase) return;
      setIsLoading(true);

      // NO user restriction here. Public Community Feed!
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Supabase data:', error);
      } else if (data) {
        const mappedData = data.map(i => ({...i, date: i.created_at}));
        setIdeas(mappedData);
      }
      setIsLoading(false);
    }
    
    fetchIdeas();
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const handlePostIdea = async (formDataPayload) => {
    const { imageFile, ...baseData } = formDataPayload;
    
    let imageUrl = null;

    if (imageFile && supabase && session) {
      // 1. FREE-TIER OPTIMIZATION: Compress Image before upload
      let fileToUpload = imageFile;
      const compressionOptions = {
        maxSizeMB: 0.8, // Force under 800KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      try {
        fileToUpload = await imageCompression(imageFile, compressionOptions);
      } catch (error) {
        console.warn("Compression failed, proceeding with original.", error);
      }

      const fileExt =  imageFile.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      // Segregate storage by user_id
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('idea-photos')
        .upload(filePath, fileToUpload);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Failed to upload image. Please check your Supabase Storage limits.');
        return; 
      }

      const { data: publicUrlData } = supabase.storage
        .from('idea-photos')
        .getPublicUrl(filePath);
        
      imageUrl = publicUrlData.publicUrl;
    }

    const newIdeaLabel = session?.user?.email?.split('@')[0] || 'User';

    const newIdea = {
      title: baseData.title,
      description: baseData.description,
      category: baseData.category,
      subject: baseData.subject,
      author: newIdeaLabel,
      table_data: baseData.table_data,
      image_url: imageUrl,
      user_id: session?.user?.id
    };

    if (supabase && session) {
      const { data, error } = await supabase
        .from('ideas')
        .insert([newIdea])
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting idea:', error);
        alert('Failed to post idea to database.');
        setIsUploading(false);
        return;
      }
      
      setIdeas([{...data, date: data.created_at}, ...ideas]);
    }

    setIsUploading(false);
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  // Intercept Render with full-screen Auth Modal if triggered
  if (showAuthModal) {
    return (
      <div className="relative min-h-screen bg-slate-50">
        <button 
          onClick={() => setShowAuthModal(false)}
          className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl font-bold shadow-sm transition-all"
        >
          <X className="w-5 h-5" /> Cancel
        </button>
        <Auth />
      </div>
    );
  }

  const filteredIdeas = ideas.filter(idea => {
    const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory;
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (idea.subject && idea.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/30">
      
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-900 cursor-pointer" onClick={() => {setIsUploading(false); setSelectedCategory('All');}}>
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 p-1">
              <img src={Logo} className="w-full h-full object-contain" alt="Logo" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-slate-800">
              Chain It
            </span>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <button 
                onClick={handleSignOut}
                className="text-slate-500 hover:text-red-500 text-sm font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Log out</span>
              </button>
            ) : (
               <button 
                onClick={() => setShowAuthModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1.5 transition-colors"
              >
                Sign In
              </button>
            )}

            {!isUploading && (
              <button 
                onClick={() => session ? setIsUploading(true) : setShowAuthModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Idea</span>
              </button>
            )}
          </div>
        </div>
      </nav>

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
            <div className="md:hidden w-full mb-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-slate-800 font-semibold outline-none transition-all appearance-none cursor-pointer shadow-sm"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat} ({cat === 'All' ? ideas.length : ideas.filter(i => i.category === cat).length})
                  </option>
                ))}
              </select>
            </div>

            <aside className="hidden md:block w-64 flex-shrink-0">
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

            <div className="flex-1">
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                  {selectedCategory === 'All' ? 'Community Ideas' : `${selectedCategory} Ideas`}
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
                      : `The community hasn't posted any ideas in the ${selectedCategory} category yet.`}
                  </p>
                  <button 
                    onClick={() => session ? setIsUploading(true) : setShowAuthModal(true)}
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

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/20 blur-[150px]" />
      </div>
    </div>
  );
}
