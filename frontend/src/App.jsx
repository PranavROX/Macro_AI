import { useState } from 'react';
import { Search, Activity, Flame, Zap, Brain, ChevronRight, Utensils, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!query) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error('Traffic is high. Please try again in 10s.');
        throw new Error('Server connection failed. Is backend running?');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans text-white relative overflow-hidden">
      
      {/* Background Animated Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 z-10"
      >
        
        {/* Header */}
        <div className="pt-10 pb-6 px-8 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30"
          >
            <Activity className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight mb-2">
            MacroAI
          </h1>
          <p className="text-slate-400 font-medium text-lg">Intelligent Nutrition Analysis</p>
        </div>

        {/* Input Area */}
        <div className="p-8 pt-2">
          <div className="relative group">
            <textarea
              className="w-full p-5 pl-12 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:border-indigo-500 focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-slate-100 font-medium resize-none shadow-inner placeholder:text-slate-500"
              placeholder="e.g., I ate a grilled chicken sandwich and a salad..."
              rows="3"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute top-6 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !query}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-white text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl
              ${loading ? 'bg-slate-700 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/40 hover:brightness-110'}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white/20" /> Analyze Meal
              </>
            )}
          </button>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-red-500/10 text-red-200 rounded-xl text-sm font-semibold border border-red-500/20 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-red-400" /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Card */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-800/50 border-t border-white/5"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white capitalize leading-none">{result.item_name}</h2>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-2 block">Detected Meal</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-full border border-white/10">
                    <Utensils className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Calories */}
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500" />
                    <Flame className="w-6 h-6 text-orange-500 mb-2 opacity-80" />
                    <span className="text-3xl font-black text-white">{result.calories}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calories</span>
                  </div>
                  
                  {/* Protein */}
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-400 mb-2">Protein</span>
                    <span className="text-3xl font-black text-white">{result.protein}<span className="text-sm font-medium text-slate-500 ml-1">g</span></span>
                  </div>

                  {/* Carbs */}
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-amber-500" />
                    <span className="text-xs font-bold text-amber-400 mb-2">Carbs</span>
                    <span className="text-3xl font-black text-white">{result.carbs}<span className="text-sm font-medium text-slate-500 ml-1">g</span></span>
                  </div>

                  {/* Fat */}
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-rose-500" />
                    <span className="text-xs font-bold text-rose-400 mb-2">Fat</span>
                    <span className="text-3xl font-black text-white">{result.fat}<span className="text-sm font-medium text-slate-500 ml-1">g</span></span>
                  </div>
                </div>

                {/* Health Tip */}
                <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20 flex gap-4 items-start">
                  <Brain className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    {result.health_tip}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
      
      {/* Footer watermark */}
      <p className="fixed bottom-6 text-white/10 text-xs font-bold uppercase tracking-[0.3em] pointer-events-none">
        MacroAI Intelligence
      </p>
    </div>
  );
}

export default App;