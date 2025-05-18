import z from 'zod';
import { HistoryEntryType } from '../common/history-entry-type.schema';
import { Administrator } from './administrator-type.schema';
import { ID } from '../common';

export const HistoryEntry = z.object({
    id: ID,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    type: HistoryEntryType,
    data: z.any(),

    isPublic: z.boolean(),
    administrator: Administrator,
});

export const HistoryEntryList = z.object({
    items: z.array(HistoryEntry),
    totalItems: z.number(),
});
