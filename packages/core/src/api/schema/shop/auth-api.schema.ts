import z from 'zod';

export let AuthenticationInput = z.object({
    // Populated at run-time
});

export const MutationAuthenticateArgs = z.object({
    input: AuthenticationInput,
    rememberMe: z.boolean().optional(),
});

export const MutationLoginArgs = z.object({
    password: z.string(),
    username: z.string(),
    rememberMe: z.boolean().optional(),
});
