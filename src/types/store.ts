export interface StoreStatus {
  isOpen: boolean;
  message?: string;   // 상태 메시지 (선택사항)
  closedAt?: string;  // 마감 시간을 저장
  reason?: string;    // 마감 사유 (선택사항)
} 