import React, { useState, useRef, useEffect } from 'react';
import { TravelStyle, TripFormData, Language } from './types';
import { HERO_IMAGE_URL, Icons } from '../constants';
import DatePicker from './DatePicker';

interface HeroProps {
  onGenerate: (data: TripFormData) => void;
  isGenerating: boolean;
}

const Hero: React.FC<HeroProps> = ({ onGenerate, isGenerating }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  // Date State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [style, setStyle] = useState<TravelStyle>(TravelStyle.STANDARD);
  const [language, setLanguage] = useState<Language>('zh-TW'); // Default Chinese
  
  // Transport State
  const [transportSelect, setTransportSelect] = useState('Public Transport');
  const [customTransport, setCustomTransport] = useState('');
  
  const [customPreferences, setCustomPreferences] = useState('');

  // Close DatePicker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !origin.trim() || !startDate || !endDate) return;
    
    // Basic validation
    if (new Date(endDate) < new Date(startDate)) {
        alert(language === 'zh-TW' ? '結束日期必須晚於或等於開始日期' : 'End date must be after start date');
        return;
    }

    const finalTransport = transportSelect === 'Other' ? customTransport : transportSelect;

    onGenerate({ 
        origin,
        destination, 
        startDate,
        endDate,
        style, 
        transportMode: finalTransport || 'Public Transport',
        customPreferences,
        language
    });
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  const formatDateDisplay = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      // Format as MM/DD
      return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-10 md:py-0">
      {/* Background with overlay - Moved overflow-hidden here to allow popup to overflow section if needed */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ 
                backgroundImage: `url('${HERO_IMAGE_URL}')`,
                filter: 'brightness(0.6)'
            }}
        />
      </div>

      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-20 flex bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/20">
          <button 
             onClick={() => setLanguage('zh-TW')}
             className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${language === 'zh-TW' ? 'bg-white text-gray-900 shadow-md' : 'text-white hover:bg-white/10'}`}
          >
              中文
          </button>
          <button 
             onClick={() => setLanguage('en')}
             className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${language === 'en' ? 'bg-white text-gray-900 shadow-md' : 'text-white hover:bg-white/10'}`}
          >
              EN
          </button>
      </div>

      <div className="relative z-10 text-center p-4 max-w-5xl mx-auto w-full mt-10 md:mt-0">
        <div className="mb-6 flex justify-center animate-fade-in-down">
           <span className="bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md flex items-center gap-2">
             <Icons.Sparkles className="w-4 h-4" /> 
             AI-Powered Travel Agent
           </span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
          Route
        </h2>
        
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
          {language === 'zh-TW' 
             ? '告訴我們你想去哪、什麼時候去，一切交給 AI 安排。' 
             : 'Tell us where, when, and how you roll. We handle the rest.'}
        </p>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 max-w-5xl mx-auto transition-all hover:bg-white/15">
          
          {/* Main Search Row: Origin | Destination | Dates */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
              {/* Origin Input (3 cols) */}
              <div className="relative group lg:col-span-3">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.MapPin className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={language === 'zh-TW' ? "出發地 (例如: 台北)" : "Where from?"}
                  className="w-full pl-10 p-4 bg-white/95 border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all outline-none font-bold text-lg h-full"
                  required
                />
              </div>

              {/* Destination Input (3 cols) */}
              <div className="relative group lg:col-span-3">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <Icons.MapPin className="w-5 h-5 text-indigo-500" />
                </div>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={language === 'zh-TW' ? "目的地 (例如: 京都)" : "Where to?"}
                  className="w-full pl-10 p-4 bg-white/95 border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all outline-none font-bold text-lg h-full"
                  required
                />
              </div>

              {/* Date Range Input (4 cols) - Interactive Custom Trigger */}
              <div 
                ref={datePickerRef}
                className="relative group lg:col-span-4 bg-white/95 rounded-2xl flex items-center px-3 py-2 cursor-pointer hover:bg-white transition-all h-full min-h-[64px]"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                 <div className="absolute left-3 text-gray-400 hidden sm:block">
                     <Icons.Calendar className="w-5 h-5" />
                 </div>
                 
                 <div className="flex flex-1 items-center gap-2 w-full sm:ml-8">
                     {/* Start Date Display */}
                     <div className="flex-1 relative border-b-2 border-transparent hover:border-indigo-100 pb-1 transition-colors">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 text-left cursor-pointer select-none">
                            {language === 'zh-TW' ? '出發日期' : 'Start Date'}
                        </label>
                        <div className={`text-left font-bold text-lg select-none ${startDate ? 'text-gray-900' : 'text-gray-400'}`}>
                            {formatDateDisplay(startDate) || (language === 'zh-TW' ? '去程' : 'Select Date')}
                        </div>
                     </div>

                     {/* Divider */}
                     <div className="w-px h-8 bg-gray-300 mx-1"></div>

                     {/* End Date Display */}
                     <div className="flex-1 relative border-b-2 border-transparent hover:border-indigo-100 pb-1 transition-colors">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 text-left cursor-pointer select-none">
                            {language === 'zh-TW' ? '回程日期' : 'End Date'}
                        </label>
                        <div className={`text-left font-bold text-lg select-none ${endDate ? 'text-gray-900' : 'text-gray-400'}`}>
                             {formatDateDisplay(endDate) || (language === 'zh-TW' ? '回程' : 'Select Date')}
                        </div>
                     </div>
                 </div>

                 {/* Custom Popup Component */}
                 {showDatePicker && (
                    <DatePicker 
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(start, end) => {
                            setStartDate(start);
                            setEndDate(end);
                        }}
                        onClose={() => setShowDatePicker(false)}
                        minDate={today}
                        language={language}
                    />
                 )}
              </div>
          </div>

          {/* Filters Row: Style | Transport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <select 
                    value={style}
                    onChange={(e) => setStyle(e.target.value as TravelStyle)}
                    className="w-full p-4 bg-white/95 border-0 rounded-2xl text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer h-14 md:h-16"
                >
                    <option value={TravelStyle.STANDARD}>{language === 'zh-TW' ? '標準行程' : 'Standard'}</option>
                    <option value={TravelStyle.DEEP}>{language === 'zh-TW' ? '深度文化' : 'Deep Culture'}</option>
                    <option value={TravelStyle.BUDGET}>{language === 'zh-TW' ? '小資省錢' : 'Budget Saver'}</option>
                    <option value={TravelStyle.LUXURY}>{language === 'zh-TW' ? '豪華享受' : 'Luxury'}</option>
                    <option value={TravelStyle.FOODIE}>{language === 'zh-TW' ? '美食之旅' : 'Foodie'}</option>
                </select>
              </div>

              <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-600 z-10">
                     <Icons.Bus className="w-5 h-5" />
                  </div>
                  <select 
                      value={transportSelect}
                      onChange={(e) => setTransportSelect(e.target.value)}
                      className="w-full pl-10 p-4 bg-white/95 border-0 rounded-2xl text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer h-14 md:h-16"
                  >
                      <option value="Public Transport">{language === 'zh-TW' ? '大眾運輸' : 'Public Transport'}</option>
                      <option value="Car">{language === 'zh-TW' ? '汽車' : 'Car'}</option>
                      <option value="Scooter">{language === 'zh-TW' ? '機車' : 'Scooter'}</option>
                      <option value="Other">{language === 'zh-TW' ? '其他 (自行輸入)' : 'Other'}</option>
                  </select>
              </div>
          </div>

          {/* Conditional Custom Transport Input */}
          {transportSelect === 'Other' && (
             <div className="relative animate-fade-in-down">
                <input 
                    type="text"
                    value={customTransport}
                    onChange={(e) => setCustomTransport(e.target.value)}
                    placeholder={language === 'zh-TW' ? "輸入交通方式 (例如: 重機, 徒步)" : "Enter your transport"}
                    className="w-full p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none font-bold text-lg"
                    autoFocus
                />
             </div>
          )}

          {/* Custom Preferences Field */}
          <div className="relative">
            <textarea
                value={customPreferences}
                onChange={(e) => setCustomPreferences(e.target.value)}
                placeholder={language === 'zh-TW' ? "有什麼特別願望嗎? (例如: 我喜歡動漫, 不吃辣...)" : "Any special wishes?"}
                className="w-full p-4 bg-white/95 border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all outline-none font-medium resize-none h-20"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isGenerating}
            className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:brightness-110 transition-all duration-300 w-full shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
            ) : (
                <>
                    {language === 'zh-TW' ? '生成我的夢想行程' : 'Generate My Dream Trip'}
                    <Icons.ArrowRight className="w-5 h-5" />
                </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
