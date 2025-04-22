import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

export const ZodValidationPipe = createZodValidationPipe({
    createValidationException: (error: ZodError) => {
        return new BadRequestException(fromError(error).message);
    },
});
