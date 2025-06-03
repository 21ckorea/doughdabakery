'use client';

import { useState, useEffect } from 'react';

interface StoreStatus {
  isOpen: boolean;
  message: string;
}

export default function StorePage() {
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    isOpen: true,
    message: '',
  });

  useEffect(() => {
    fetchStoreStatus();
  }, []);

  const fetchStoreStatus = async () => {
    try {
      const response = await fetch('/api/store');
      if (response.ok) {
        const data = await response.json();
        setStoreStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch store status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isOpen: formData.get('isOpen') === 'true',
          message: formData.get('message'),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStoreStatus(data);
        alert('저장되었습니다.');
      }
    } catch (error) {
      console.error('Failed to update store status:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">영업 상태 관리</h1>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">영업 상태</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="isOpen"
                value="true"
                checked={storeStatus.isOpen}
                onChange={() => setStoreStatus({ ...storeStatus, isOpen: true })}
                className="mr-2"
              />
              영업 중
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="isOpen"
                value="false"
                checked={!storeStatus.isOpen}
                onChange={() => setStoreStatus({ ...storeStatus, isOpen: false })}
                className="mr-2"
              />
              영업 종료
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            메시지 (선택사항)
          </label>
          <textarea
            name="message"
            value={storeStatus.message}
            onChange={(e) => setStoreStatus({ ...storeStatus, message: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="영업 시간이 변경되었습니다."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          저장
        </button>
      </form>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">현재 상태</h2>
        <p className="flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${storeStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {storeStatus.isOpen ? '영업 중' : '영업 종료'}
        </p>
        {storeStatus.message && (
          <p className="mt-2 text-gray-600">{storeStatus.message}</p>
        )}
      </div>
    </div>
  );
} 