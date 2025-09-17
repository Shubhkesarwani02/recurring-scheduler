export interface Slot {
  id?: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;  // HH:MM format
  end_time: string;    // HH:MM format
  created_at?: Date;
  updated_at?: Date;
}

export interface Exception {
  id?: string;
  slot_id: string;
  date: string;        // YYYY-MM-DD format
  override_start?: string | null; // HH:MM format or null if deleted
  override_end?: string | null;   // HH:MM format or null if deleted
  status: 'updated' | 'deleted';
  created_at?: Date;
  updated_at?: Date;
}

export interface SlotWithDate {
  id: string;
  date: string;        // YYYY-MM-DD format
  start_time: string;  // HH:MM format
  end_time: string;    // HH:MM format
  is_exception: boolean;
  original_slot_id?: string;
}

export interface CreateSlotRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface UpdateSlotRequest {
  date: string;
  start_time?: string;
  end_time?: string;
}