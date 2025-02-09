export interface CollectionRequest {
  id?: string;
  userId: string|number;
  wasteType: string; // 'plastic', 'glass', 'paper', 'metal'
  photos?: [string, ...string[]];
  estimatedWeight: number;
  collectionAddress: string;
  desiredDate: string;
  desiredTimeSlot: string;
  notes?: string;
  status: string; // 'pending', 'occupied', 'in_progress', 'validated', 'rejected'
}
