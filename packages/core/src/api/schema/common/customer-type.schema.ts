import z from 'zod';

export const CustomerType = z.enum(['SELLER', 'BUYER']);
