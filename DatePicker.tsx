import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface DatePickerProps {
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
    onClose: () => void;
    minDate?: string;
    language?: 'zh-TW' | 'en';
}

const DatePicker: React.FC<DatePickerProps> = ({ startDate, endDate, onChange, onClose, minDate, language = 'zh-TW' }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initial view based on start date or today
    // Parse 'YYYY-MM-DD' as local time, not UTC
    const parseDateLocal = (dateStr: string) => {
        if (!dateStr) return new Date();
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const [viewDate, setViewDate] = useState(() => {
        return startDate ? parseDateLocal(startDate) : new Date();
    });

    // Helper: Format Date object to 'YYYY-MM-DD' using local time
    const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Handle selecting logic
    const handleDateClick = (year: number, month: number, day: number) => {
        const clickedDate = new Date(year, month, day);
        const dateStr = formatDateLocal(clickedDate);

        // If no start date, or both dates already selected, start fresh
        if (!startDate || (startDate && endDate)) {
            onChange(dateStr, '');
        } 
        // If start date exists but no end date
        else if (startDate && !endDate) {
            const startObj = parseDateLocal(startDate);
            if (clickedDate < startObj) {
                // If clicked date is before start date, treat it as new start date
                onChange(dateStr, '');
            } else {
                // Set end date
                onChange(startDate, dateStr);
                setTimeout(onClose, 200);
            }
        }
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const changeYear = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setFullYear(newDate.getFullYear() + offset);
        setViewDate(newDate);
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const renderCalendarGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        const days = [];
        
        // Empty cells for padding
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        const minDateObj = minDate ? parseDateLocal(minDate) : today;
        minDateObj.setHours(0,0,0,0);

        const startObj = startDate ? parseDateLocal(startDate) : null;
        if(startObj) startObj.setHours(0,0,0,0);
        
        const endObj = endDate ? parseDateLocal(endDate) : null;
        if(endObj) endObj.setHours(0,0,0,0);

        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(year, month, d);
            currentDate.setHours(0,0,0,0);
            
            const isPast = currentDate < minDateObj;
            
            // Comparison using getTime() to avoid object reference issues
            const isStart = startObj && currentDate.getTime() === startObj.getTime();
            const isEnd = endObj && currentDate.getTime() === endObj.getTime();
            const isInRange = startObj && endObj && currentDate > startObj && currentDate < endObj;

            days.push(
                <button
                    key={d}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if(!isPast) handleDateClick(year, month, d);
                    }}
                    disabled={isPast}
                    className={`
                        h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                        ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-indigo-50 text-gray-700 font-bold'}
                        ${isStart ? '!bg-indigo-600 !text-white z-10 shadow-md' : ''}
                        ${isEnd ? '!bg-indigo-600 !text-white z-10 shadow-md' : ''}
                        ${isInRange ? 'bg-indigo-50 text-indigo-700 rounded-none w-full mx-[-5px]' : ''}
                        ${isStart && endObj ? 'rounded-r-none' : ''}
                        ${isEnd && startObj ? 'rounded-l-none' : ''}
                    `}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    const monthNames = language === 'zh-TW' 
        ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const weekDays = language === 'zh-TW'
        ? ['日', '一', '二', '三', '四', '五', '六']
        : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div 
            className="absolute top-full left-0 right-0 md:left-auto md:w-96 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-fade-in-up cursor-default"
            onClick={(e) => e.stopPropagation()} 
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => {e.preventDefault(); changeYear(-1)}} 
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" /></svg>
                    </button>
                    <button 
                        onClick={(e) => {e.preventDefault(); changeMonth(-1)}} 
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                </div>

                <span className="text-lg font-bold text-gray-800 select-none">
                    {viewDate.getFullYear()} {language === 'zh-TW' ? '年' : ''} {monthNames[viewDate.getMonth()]}
                </span>

                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => {e.preventDefault(); changeMonth(1)}} 
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button 
                        onClick={(e) => {e.preventDefault(); changeYear(1)}} 
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                </div>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {weekDays.map((day, idx) => (
                    <span key={idx} className={`text-xs font-bold uppercase select-none ${idx === 0 || idx === 6 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {day}
                    </span>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                {renderCalendarGrid()}
            </div>
            
            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>{language === 'zh-TW' ? '請選擇日期' : 'Select dates'}</span>
                {(startDate || endDate) && (
                    <button 
                        onClick={(e) => {e.preventDefault(); onChange('', '');}}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        {language === 'zh-TW' ? '清除' : 'Clear'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DatePicker;
