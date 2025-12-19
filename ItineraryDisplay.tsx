import React, { useState } from 'react';
import { TripPlan, DayPlan, Activity, ActivityType, Restaurant, Accommodation } from '../types';
import { Icons } from '../constants';
import ChatWidget from './ChatWidget';

interface ItineraryDisplayProps {
  plan: TripPlan;
  onReset: () => void;
}

const ActivityIcon = ({ type, isSpecialEvent }: { type: ActivityType | string, isSpecialEvent?: boolean }) => {
  if (isSpecialEvent) return <Icons.Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />;
  
  switch (type?.toLowerCase()) {
    case 'sightseeing': return <Icons.Camera className="w-5 h-5 text-purple-600" />;
    case 'food': return <Icons.Utensils className="w-5 h-5 text-orange-600" />;
    case 'transport': return <Icons.Bus className="w-5 h-5 text-blue-600" />;
    case 'shopping': return <Icons.ShoppingBag className="w-5 h-5 text-pink-600" />;
    case 'special_event': return <Icons.Sparkles className="w-5 h-5 text-yellow-500" />;
    case 'rest':
    default: return <Icons.MapPin className="w-5 h-5 text-gray-600" />;
  }
};

const RestaurantCard: React.FC<{ restaurant: Restaurant; lang: string }> = ({ restaurant, lang }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col gap-2">
        {/* Decorative background circle */}
        <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-orange-100/50 rounded-full z-0"></div>

        <div className="relative z-10 w-full">
            <div className="flex justify-between items-start mb-1">
                <h5 className="font-black text-gray-900 text-lg group-hover:text-orange-600 transition-colors" title={restaurant.name}>
                    {restaurant.name}
                </h5>
                <span className="bg-orange-100 text-orange-700 text-xs font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-sm shrink-0">
                    {restaurant.rating} ★
                </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                 <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    <Icons.MapPin className="w-3 h-3 text-gray-400" /> 
                    {restaurant.travelTime}
                 </span>
                 <span className="font-bold text-gray-700">{restaurant.price}</span>
            </div>

            {restaurant.mustTry && (
                <div className="bg-orange-50 p-2 rounded-lg border border-orange-100 w-full">
                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-0.5">
                        {lang === 'zh-TW' ? '必點招牌' : 'Must Try'}
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                        🍴 {restaurant.mustTry}
                    </p>
                </div>
            )}
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-400">🕒 {restaurant.hours}</span>
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.googleMapsQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white bg-black hover:bg-gray-800 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                >
                    {lang === 'zh-TW' ? '導航' : 'Go'} <Icons.ArrowRight className="w-3 h-3 inline" />
                </a>
            </div>
        </div>
    </div>
);

const InteractiveActivityCard: React.FC<{ activity: Activity; lang: string }> = ({ activity, lang }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Replace generated image with Map Embed
    const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(activity.googleMapsQuery || activity.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    const toggleOpen = () => setIsOpen(!isOpen);

    // Highlight special events
    const isSpecial = activity.isSpecialEvent || activity.type === 'special_event';

    return (
        <div 
            className={`
                bg-white rounded-3xl border shadow-lg overflow-hidden flex flex-col z-10 relative 
                transition-all duration-300 ease-in-out
                ${isOpen ? 'ring-2 ring-indigo-500 shadow-xl' : 'hover:shadow-xl'}
                ${isSpecial ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-100'}
            `}
        >
            {/* Header: Title Area (Always visible, Interactive) */}
            <div 
                className={`px-6 pt-5 pb-3 cursor-pointer ${isSpecial ? 'bg-yellow-50/50' : 'bg-white'}`}
                onClick={toggleOpen}
            >
                {isSpecial && (
                    <div className="mb-2 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                        <Icons.Sparkles className="w-3 h-3" />
                        {lang === 'zh-TW' ? '期間限定' : 'Special Event'}
                    </div>
                )}
                <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                        {activity.activity}
                    </h4>
                    <ActivityIcon type={activity.type} isSpecialEvent={isSpecial} />
                </div>
                 <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Icons.MapPin className="w-3 h-3 flex-shrink-0 text-indigo-500" />
                    <span className="truncate">{activity.location}</span>
                </div>
                
                {/* Expand Hint */}
                <div className="flex justify-center mt-2">
                    <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                         <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            {/* Expanded Content Area */}
            {isOpen && (
                <div className="animate-fade-in-down">
                    {/* Map Preview Area */}
                    <div className="relative aspect-[16/9] w-full bg-gray-100 border-t border-b border-gray-100">
                        <iframe 
                            title={`Map of ${activity.activity}`}
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src={mapEmbedUrl}
                            className="w-full h-full filter grayscale-[10%]"
                        />
                         {/* Budget Display */}
                        {activity.estimatedCost && (
                            <div className="absolute bottom-3 left-3 z-10">
                                <span className="bg-black/80 backdrop-blur text-yellow-400 px-3 py-1 rounded-lg font-bold text-xs shadow-md border border-white/10">
                                    {lang === 'zh-TW' ? '預算:' : 'Budget:'} {activity.estimatedCost}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50">
                        <p className="text-gray-700 text-base leading-relaxed mb-4">
                            {activity.description}
                        </p>
                        
                        {/* Interactive Restaurant List (Vertical Stack) */}
                        {activity.restaurantOptions && activity.restaurantOptions.length > 0 && (
                            <div className="mt-6">
                                <h5 className="text-sm font-black uppercase tracking-widest text-orange-600 mb-3 flex items-center gap-2">
                                    <Icons.Utensils className="w-4 h-4" />
                                    {lang === 'zh-TW' ? `周邊美食推薦 (${activity.restaurantOptions.length})` : `Foodie Recommendations (${activity.restaurantOptions.length})`}
                                </h5>
                                
                                <div className="flex flex-col gap-3">
                                    {activity.restaurantOptions.map((rest, idx) => (
                                        <RestaurantCard key={idx} restaurant={rest} lang={lang} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Transport Section - Shows Path Image (simulated via embedded map view of destination to represent "going there")
const TransportBlock: React.FC<{ activity: Activity, mode: string, lang: string }> = ({ activity, mode, lang }) => {
    if (!activity.travelTimeFromPrevious) return null;

    const m = mode.toLowerCase();
    const isDrive = m.includes('car') || m.includes('drive') || m.includes('taxi') || m.includes('uber') || m.includes('motor') || m.includes('scooter');
    
    // We use a small, zoomed-out map embed to simulate "seeing the route context" to the next point
    const routePreviewUrl = `https://maps.google.com/maps?q=${encodeURIComponent(activity.location)}&t=m&z=12&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="mb-6 relative pl-4 md:pl-0">
             {/* Dotted Connector Line */}
             <div className="absolute left-[0.25rem] md:left-8 top-[-1rem] bottom-[-1rem] w-1 border-l-4 border-dotted border-gray-300 z-0 hidden md:block"></div>
             <div className="absolute left-[0.25rem] top-[-1rem] bottom-[-1rem] w-1 border-l-4 border-dotted border-gray-300 z-0 md:hidden"></div>

             <div className="bg-white border border-gray-200 rounded-xl p-1 md:p-1 flex flex-col gap-2 relative z-10 mx-2 md:mx-0 shadow-sm max-w-sm overflow-hidden group">
                 
                 {/* Visual Path "Image" (Map Embed) */}
                 <div className="h-24 w-full bg-gray-100 rounded-lg overflow-hidden relative opacity-80 group-hover:opacity-100 transition-opacity">
                      <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            src={routePreviewUrl}
                            className="w-full h-full pointer-events-none" // Disable interaction to make it just an image/visual
                            tabIndex={-1}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent flex items-end justify-center pb-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/50 px-2 rounded backdrop-blur-sm">
                                {lang === 'zh-TW' ? '路徑預覽' : 'Route Preview'}
                            </span>
                        </div>
                 </div>

                 <div className="flex items-center gap-3 px-3 pb-2">
                    <div className="bg-indigo-50 p-2 rounded-full text-indigo-600 shrink-0">
                        {isDrive ? <Icons.Car className="w-5 h-5" /> : <Icons.Bus className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm">
                                {lang === 'zh-TW' ? '前往下一站' : 'Travel to next stop'}
                            </span>
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                {activity.travelTimeFromPrevious} • {activity.travelAdvice || (lang === 'zh-TW' ? '依路況而定' : 'Depends on traffic')}
                            </span>
                        </div>
                    </div>
                    
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activity.location)}&travelmode=${isDrive ? 'driving' : 'transit'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
                        title={lang === 'zh-TW' ? '開啟完整導航' : 'Open Navigation'}
                    >
                        <Icons.ArrowRight className="w-4 h-4" />
                    </a>
                 </div>
             </div>
        </div>
    );
}

const ActivityTimelineItem: React.FC<{ activity: Activity, isLast: boolean, mode: string, lang: string }> = ({ activity, isLast, mode, lang }) => {
    return (
        <div className="relative group pb-10 md:pb-16">
             {/* Main Vertical Timeline Line */}
             {!isLast && (
                 <div className="absolute left-[0.9rem] md:left-[8.5rem] top-8 bottom-0 w-1 bg-indigo-100 z-0 hidden md:block" />
             )}
            
            {/* Transport Block (Point to Point Navigation) */}
            <div className="md:pl-48 mb-6">
                <TransportBlock activity={activity} mode={mode} lang={lang} />
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-stretch relative">
                
                {/* Time Column */}
                <div className="hidden md:flex flex-col items-end w-24 pt-4 shrink-0">
                    <span className="text-xl font-bold text-gray-900">{activity.time.split(' ')[0]}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{activity.time.split(' ')[1] || 'AM'}</span>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-2 md:relative md:left-auto w-4 flex justify-center pt-6 z-20 hidden md:flex">
                    <div className="w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-md"></div>
                </div>

                {/* Content Column */}
                <div className="flex-1 w-full md:pl-0 px-2 md:px-0">
                    {/* Mobile Time Header */}
                    <div className="md:hidden flex items-center gap-3 mb-3 pl-2">
                        <span className="bg-gray-900 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                            {activity.time}
                        </span>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    <InteractiveActivityCard activity={activity} lang={lang} />
                </div>
            </div>
        </div>
    );
}

const DaySection: React.FC<{ day: DayPlan, mode: string, lang: string, startDate?: string }> = ({ day, mode, lang, startDate }) => {
    // Calculate display date & Day Number
    let dateObj: Date | null = null;
    
    if (day.date) {
         // Create date using split to avoid timezone issues for display
         const [y, m, d] = day.date.split('-').map(Number);
         dateObj = new Date(y, m - 1, d);
    } else if (startDate) {
        // Calculate based on start date
        const [y, m, d] = startDate.split('-').map(Number);
        dateObj = new Date(y, m - 1, d);
        dateObj.setDate(dateObj.getDate() + (day.dayNumber - 1));
    }

    const displayDateStr = dateObj ? dateObj.toLocaleDateString(lang === 'zh-TW' ? 'zh-TW' : 'en-US', { month: 'short', year: 'numeric' }) : '';
    const dayNumberStr = dateObj ? dateObj.getDate() : day.dayNumber; // THE BIG NUMBER

    return (
        <div className="mb-12 last:mb-0 md:bg-white md:rounded-3xl md:p-10 md:shadow-xl md:border md:border-gray-100">
            {/* Day Header */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100 px-4 md:px-0 sticky top-16 md:static z-20 bg-slate-100/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none py-4 md:py-0">
                 {/* The Big Date Number Block */}
                 <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white w-20 h-24 md:w-28 md:h-28 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-indigo-200 shrink-0 transform transition-transform hover:scale-105">
                    <span className="text-xs md:text-sm font-medium opacity-80 uppercase tracking-widest mb-1">
                        {dateObj ? dateObj.toLocaleDateString(lang === 'zh-TW' ? 'en-US' : 'en-US', { weekday: 'short' }) : `Day`}
                    </span>
                    <span className="text-5xl md:text-6xl font-black leading-none tracking-tighter">
                        {dayNumberStr}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold bg-black/20 px-2 py-0.5 rounded mt-2">
                        {displayDateStr}
                    </span>
                 </div>
                 
                 <div className="min-w-0 flex-1">
                    <h3 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
                        {day.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100">
                            #{day.theme}
                        </span>
                        <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-bold border border-gray-200">
                            Day {day.dayNumber}
                        </span>
                    </div>
                 </div>
            </div>
            
            <div className="relative">
                {day.activities.map((activity, idx) => (
                    <ActivityTimelineItem 
                        key={idx} 
                        activity={activity} 
                        isLast={idx === day.activities.length - 1}
                        mode={mode}
                        lang={lang}
                    />
                ))}
            </div>
        </div>
    );
};

// No Image, Data Focused Accommodation Card
const AccommodationCard: React.FC<{ accommodation: Accommodation; lang: string }> = ({ accommodation, lang }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all h-full flex flex-col p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h4 className="text-xl font-black text-gray-900 leading-tight mb-1">{accommodation.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Icons.MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {accommodation.location}
                    </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                    <div className="text-lg font-black text-indigo-600">{accommodation.pricePerNight}</div>
                    <div className="flex items-center justify-end gap-1 text-yellow-500 text-sm font-bold">
                         <span>{accommodation.rating}</span>
                         <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {accommodation.description}
            </p>

            {/* Reviews Section */}
            {accommodation.reviews && accommodation.reviews.length > 0 && (
                <div className="mb-6 bg-gray-50 rounded-xl p-4">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                         {lang === 'zh-TW' ? '精選評論' : 'Top Reviews'}
                     </span>
                     <ul className="space-y-2">
                         {accommodation.reviews.map((review, i) => (
                             <li key={i} className="text-sm text-gray-700 flex gap-2">
                                 <span className="text-indigo-400">"</span>
                                 <span className="italic flex-1">{review}</span>
                                 <span className="text-indigo-400">"</span>
                             </li>
                         ))}
                     </ul>
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-50">
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.googleMapsQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold py-3 rounded-xl transition-all text-sm"
                >
                    <Icons.MapPin className="w-4 h-4" />
                    {lang === 'zh-TW' ? '查看地圖與房價' : 'Check Availability'}
                </a>
            </div>
        </div>
    );
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ plan, onReset }) => {
    const [activeTab, setActiveTab] = useState<number | 'overview'>('overview');
    const lang = plan.language || 'zh-TW';

    return (
        <div className="min-h-screen bg-slate-100 pb-20 font-sans relative">
            {/* Chat Assistant Widget */}
            <ChatWidget plan={plan} language={lang} />

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-lg md:text-xl font-extrabold text-indigo-900 flex items-center gap-2 tracking-tight">
                        <Icons.Plane className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                        <span className="hidden md:inline">Route</span>
                        <span className="md:hidden">Route</span>
                    </h1>
                    <button 
                        onClick={onReset}
                        className="text-xs md:text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors px-3 py-2 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-100"
                    >
                        {lang === 'zh-TW' ? '規劃新行程' : 'New Trip'}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto md:px-4 pt-6 md:pt-12">
                {/* Trip Title */}
                <div className="text-center mb-10 px-4">
                     <span className="text-indigo-600 font-bold tracking-widest uppercase text-[10px] md:text-xs mb-2 block">
                        {lang === 'zh-TW' ? '您的專屬行程' : 'Your Custom Plan'}
                     </span>
                     <h2 className="text-3xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-none">
                        {lang === 'zh-TW' 
                            ? <>{plan.destination} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{plan.duration} 日遊</span></> 
                            : <>{plan.duration} Days in <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{plan.destination}</span></>
                        }
                    </h2>
                    {plan.startDate && plan.endDate && (
                         <div className="mt-3 flex justify-center">
                            <span className="bg-white/50 border border-gray-200 px-4 py-1.5 rounded-full text-sm font-semibold text-gray-600 shadow-sm">
                                📅 {plan.startDate} ~ {plan.endDate}
                            </span>
                         </div>
                    )}
                    
                    <p className="text-lg md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-light mt-6">
                        {plan.summary}
                    </p>
                </div>

                {/* Accommodation Grid Section */}
                {plan.accommodations && plan.accommodations.length > 0 && (
                    <div className="mb-16 px-4 md:px-0">
                        <div className="flex items-center gap-2 mb-6 px-4 md:px-0">
                            <Icons.Bed className="w-6 h-6 text-indigo-600" />
                            <h3 className="text-2xl font-black text-gray-900">
                                {lang === 'zh-TW' ? '精選住宿' : 'Recommended Stays'}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plan.accommodations.map((acc, idx) => (
                                <AccommodationCard key={idx} accommodation={acc} lang={lang} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Day Navigation (Sticky Mobile) */}
                <div className="flex md:hidden overflow-x-auto gap-2 pb-2 mb-6 sticky top-16 z-30 bg-slate-100/95 backdrop-blur px-4 pt-2 scrollbar-hide border-b border-gray-200/50">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                            activeTab === 'overview' ? 'bg-black text-white shadow-lg scale-105' : 'bg-white text-gray-500 border border-gray-200'
                        }`}
                    >
                        Top
                    </button>
                    {plan.days.map((day) => (
                        <button
                            key={day.dayNumber}
                            onClick={() => {
                                setActiveTab(day.dayNumber);
                                const el = document.getElementById(`day-${day.dayNumber}`);
                                // Offset for sticky headers
                                const y = el!.getBoundingClientRect().top + window.scrollY - 140;
                                window.scrollTo({top: y, behavior: 'smooth'});
                            }}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                                activeTab === day.dayNumber ? 'bg-black text-white shadow-lg scale-105' : 'bg-white text-gray-500 border border-gray-200'
                            }`}
                        >
                            Day {day.dayNumber}
                        </button>
                    ))}
                </div>

                {/* Days Render */}
                <div className="max-w-4xl mx-auto">
                    {plan.days.map((day) => (
                        <div key={day.dayNumber} id={`day-${day.dayNumber}`} className="scroll-mt-32">
                            <DaySection day={day} mode={plan.transportMode} lang={lang} startDate={plan.startDate} />
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center pb-12 border-t border-gray-200 pt-12 px-6">
                     <p className="text-gray-400 text-xs md:text-sm">
                        {lang === 'zh-TW' 
                            ? 'AI 生成內容僅供參考，請以實際狀況為主。' 
                            : 'AI generated content based on popular travel trends. Check real-time availability before booking.'
                        }
                     </p>
                </div>
            </main>
        </div>
    );
};

export default ItineraryDisplay;