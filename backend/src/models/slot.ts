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
        slot_id: exception.slot_id,
        date: exception.date,
        exception_type: exception.status, // Map status to exception_type
        start_time: exception.override_start,
        end_time: exception.override_end,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    // Map back to our interface format
    return {
      id: newException.id,
      slot_id: newException.slot_id,
      date: newException.date,
      override_start: newException.start_time,
      override_end: newException.end_time,
      status: newException.exception_type,
      created_at: newException.created_at,
      updated_at: newException.updated_at
    };
  }

  static async findBySlotIdAndDate(slotId: string, date: string): Promise<Exception | undefined> {
    const dbException = await db('exceptions')
      .where('slot_id', slotId)
      .where('date', date)
      .first();
      
    if (!dbException) return undefined;
    
    // Map database columns to our interface
    return {
      id: dbException.id,
      slot_id: dbException.slot_id,
      date: dbException.date,
      override_start: dbException.start_time,
      override_end: dbException.end_time,
      status: dbException.exception_type,
      created_at: dbException.created_at,
      updated_at: dbException.updated_at
    };
  }

  static async findByDateRange(startDate: string, endDate: string): Promise<Exception[]> {
    const dbExceptions = await db('exceptions')
      .whereBetween('date', [startDate, endDate]);
      
    // Map database columns to our interface
    return dbExceptions.map(dbException => ({
      id: dbException.id,
      slot_id: dbException.slot_id,
      date: dbException.date,
      override_start: dbException.start_time,
      override_end: dbException.end_time,
      status: dbException.exception_type,
      created_at: dbException.created_at,
      updated_at: dbException.updated_at
    }));
  }

  static async update(id: string, updates: Partial<Exception>): Promise<Exception> {
    const dbUpdates: any = {
      updated_at: new Date()
    };
    
    // Map our interface fields to database columns
    if (updates.override_start !== undefined) dbUpdates.start_time = updates.override_start;
    if (updates.override_end !== undefined) dbUpdates.end_time = updates.override_end;
    if (updates.status !== undefined) dbUpdates.exception_type = updates.status;
    
    const [updatedException] = await db('exceptions')
      .where('id', id)
      .update(dbUpdates)
      .returning('*');
      
    // Map back to our interface format
    return {
      id: updatedException.id,
      slot_id: updatedException.slot_id,
      date: updatedException.date,
      override_start: updatedException.start_time,
      override_end: updatedException.end_time,
      status: updatedException.exception_type,
      created_at: updatedException.created_at,
      updated_at: updatedException.updated_at
    };
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