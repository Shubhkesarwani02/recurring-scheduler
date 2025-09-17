import db from '../db/knexfile';
import { Slot, Exception } from '../types/slot';

export class SlotModel {
  static async create(slot: Omit<Slot, 'id' | 'created_at' | 'updated_at'>): Promise<Slot> {
    const [newSlot] = await db('slots')
      .insert({
        ...slot,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return newSlot;
  }

  static async findByDayOfWeek(dayOfWeek: number): Promise<Slot[]> {
    return db('slots')
      .where('day_of_week', dayOfWeek)
      .orderBy('start_time');
  }

  static async findById(id: string): Promise<Slot | undefined> {
    return db('slots').where('id', id).first();
  }

  static async update(id: string, updates: Partial<Slot>): Promise<Slot> {
    const [updatedSlot] = await db('slots')
      .where('id', id)
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    return updatedSlot;
  }

  static async delete(id: string): Promise<void> {
    await db('slots').where('id', id).del();
  }

  static async findAll(): Promise<Slot[]> {
    return db('slots').orderBy('day_of_week').orderBy('start_time');
  }
}

export class ExceptionModel {
  static async create(exception: Omit<Exception, 'id' | 'created_at' | 'updated_at'>): Promise<Exception> {
    const [newException] = await db('exceptions')
      .insert({
        ...exception,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return newException;
  }

  static async findBySlotIdAndDate(slotId: string, date: string): Promise<Exception | undefined> {
    return db('exceptions')
      .where('slot_id', slotId)
      .where('date', date)
      .first();
  }

  static async findByDateRange(startDate: string, endDate: string): Promise<Exception[]> {
    return db('exceptions')
      .whereBetween('date', [startDate, endDate]);
  }

  static async update(id: string, updates: Partial<Exception>): Promise<Exception> {
    const [updatedException] = await db('exceptions')
      .where('id', id)
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    return updatedException;
  }

  static async upsert(exception: Omit<Exception, 'id' | 'created_at' | 'updated_at'>): Promise<Exception> {
    const existing = await this.findBySlotIdAndDate(exception.slot_id, exception.date);
    
    if (existing) {
      return this.update(existing.id!, {
        override_start: exception.override_start,
        override_end: exception.override_end,
        status: exception.status
      });
    } else {
      return this.create(exception);
    }
  }
}