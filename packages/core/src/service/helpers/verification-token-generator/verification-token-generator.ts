import { Injectable } from '@nestjs/common';
import { alphabet, generateRandomString } from '@firelancerco/common/lib/shared-utils';

import { ConfigService } from '../../../config/config.service';

const ms = require('ms');

/**
 * This class is responsible for generating and verifying the tokens issued when new accounts are registered
 * or when a password reset is requested.
 */
@Injectable()
export class VerificationTokenGenerator {
    constructor(private configService: ConfigService) {}

    /**
     * Generates a verification token
     */
    generateVerificationToken() {
        return generateRandomString(5, '23456789ABCDEFGHJKLMNPQRSTUVWXYZ');
    }

    /**
     * Checks the age of the verification token to see if it falls within the token duration
     * as specified in the FirelancerConfig.
     */
    verifyVerificationToken(token: string, createdAt: string | Date | null): boolean {
        const { verificationTokenDuration } = this.configService.authOptions;
        const verificationTokenDurationInMs =
            typeof verificationTokenDuration === 'string' ? ms(verificationTokenDuration) : verificationTokenDuration;

        if (!createdAt) return false;

        const date = new Date(createdAt);
        const elapsed = +new Date() - +date;
        return elapsed < verificationTokenDurationInMs;
    }
}
