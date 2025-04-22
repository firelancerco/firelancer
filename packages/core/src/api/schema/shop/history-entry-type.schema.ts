import z from 'zod';
import { HistoryEntryType, ID } from '../common';

export const HistoryEntry = z.object({
    id: ID,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    type: HistoryEntryType,
    data: z.any(),
});

export const HistoryEntryList = z.object({
    items: z.array(HistoryEntry),
    totalItems: z.number(),
});
