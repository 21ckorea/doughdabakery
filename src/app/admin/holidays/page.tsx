'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Holiday, HolidayInput } from '@/types/holiday';

export default function HolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 휴일 목록 조회
  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/holidays');
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    }
  };

  // 컴포넌트 마운트 시 휴일 목록 조회
  useEffect(() => {
    fetchHolidays();
  }, []);

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 휴일 추가
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !reason) return;

    setIsLoading(true);
    try {
      const holidayInput: HolidayInput = {
        date: formatDate(selectedDate),
        reason,
      };

      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holidayInput),
      });

      if (response.ok) {
        setReason('');
        setSelectedDate(new Date());
        fetchHolidays();
      }
    } catch (error) {
      console.error('Failed to add holiday:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 휴일 삭제
  const handleDeleteHoliday = async (id: number) => {
    if (!confirm('정말 이 휴일을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch('/api/holidays', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchHolidays();
      }
    } catch (error) {
      console.error('Failed to delete holiday:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">휴일 관리</h1>
      
      {/* 휴일 추가 폼 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">새 휴일 추가</h2>
        <form onSubmit={handleAddHoliday} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              locale="ko"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사유
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="휴일 사유를 입력하세요"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? '추가 중...' : '휴일 추가'}
          </button>
        </form>
      </div>

      {/* 휴일 목록 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">휴일 목록</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사유
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holidays.map((holiday) => (
                <tr key={holiday.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(holiday.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">{holiday.reason}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    등록된 휴일이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 