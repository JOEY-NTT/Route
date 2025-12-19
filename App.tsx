import React, { useState } from 'react';
import Hero from './Hero';
import ItineraryDisplay from './ItineraryDisplay';
import { generateItinerary } from './services/geminiService';
import { TripFormData, TripPlan } from './types';

const App: React.FC = () => {
  const [tripData, setTripData] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (formData: TripFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateItinerary(formData);
      setTripData(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTripData(null);
    setError(null);
  };

  if (tripData) {
    return <ItineraryDisplay plan={tripData} onReset={handleReset} />;
  }

  return (
    <>
      <Hero onGenerate={handleGenerate} isGenerating={isLoading} />
      
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <p className="font-bold">Oops!</p>
                <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-800 font-bold">✕</button>
        </div>
      )}
      
      {/* Loading Overlay (if sticking around on Hero) */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
            <div className="w-20 h-20 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-bold animate-pulse">Building your perfect trip...</h3>
            <p className="text-white/60 mt-2">Checking opening hours, finding hidden gems...</p>
        </div>
      )}
    </>
  );
};

export default App;
