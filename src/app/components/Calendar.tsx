'use client';

import { useState } from 'react';
import { Holiday } from '@/types/holiday';

interface CalendarProps {
  holidays: Holiday[];
}

export default function Calendar({ holidays }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getHolidayForDate = (date: Date) => {
    return holidays.find(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getDate() === date.getDate() &&
        holidayDate.getMonth() === date.getMonth() &&
        holidayDate.getFullYear() === date.getFullYear();
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const holiday = getHolidayForDate(date);

      days.push(
        <div
          key={day}
          className={`h-24 border p-2 ${holiday ? 'bg-red-50' : 'bg-white'}`}
        >
          <div className="flex justify-between">
            <span className={`font-semibold ${holiday ? 'text-red-500' : ''}`}>
              {day}
            </span>
          </div>
          {holiday && (
            <div className="text-sm text-red-500 mt-1">
              {holiday.reason}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          이전달
        </button>
        <h3 className="text-xl font-semibold">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>
        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          다음달
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center py-2 font-semibold">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
} 