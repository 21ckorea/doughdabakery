'use client';

import { useState, useEffect } from 'react';
import { StoreStatus } from '@/types/store';

export default function StoreManagement() {
  const [status, setStatus] = useState<StoreStatus>({ isOpen: true });
  const [time, setTime] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/store/status');
      const data = await response.json();
      setStatus(data);
      if (data.closedAt) {
        setTime(data.closedAt);
      }
    } catch (error) {
      console.error('Failed to fetch store status:', error);
    }
  };

  const updateStatus = async (newStatus: boolean) => {
    try {
      const updatedStatus: StoreStatus = {
        isOpen: newStatus,
        ...(newStatus ? {} : { closedAt: time, reason: '재료 소진' })
      };

      await fetch('/api/store/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStatus),
      });

      setStatus(updatedStatus);
    } catch (error) {
      console.error('Failed to update store status:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">영업 상태 관리</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">현재 상태</h2>
            <p className={`text-lg ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {status.isOpen ? '영업중' : '마감'}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => updateStatus(true)}
              className={`px-4 py-2 rounded-lg ${
                status.isOpen
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              영업 시작
            </button>
            <button
              onClick={() => updateStatus(false)}
              className={`px-4 py-2 rounded-lg ${
                !status.isOpen
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              마감
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            마감 시간
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>
    </div>
  );
} 