export interface StoreStatus {
  isOpen: boolean;
  closedAt?: string; // 마감 시간을 저장
  reason?: string;   // 마감 사유 (선택사항)
} 