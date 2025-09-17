import { Router } from 'express';
import { SlotController } from '../controllers/slotController';

const router = Router();

// GET /slots?weekStart=YYYY-MM-DD - get slots for a week
router.get('/', SlotController.getSlots);

// POST /slots - create a new recurring slot
router.post('/', SlotController.createSlot);

// PUT /slots/:id - update a slot (creates exception)
router.put('/:id', SlotController.updateSlot);

// DELETE /slots/:id - delete a slot (creates exception)
router.delete('/:id', SlotController.deleteSlot);

export default router;