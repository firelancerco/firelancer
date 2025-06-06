import { ChildEntity, Column, DeepPartial } from 'typeorm';

import { AuthenticationMethod } from './authentication-method.entity';

/**
 * @description
 * This is the default, built-in authentication method which uses a identifier (typically username or email address)
 * and password combination to authenticate a User.
 */
@ChildEntity()
export class NativeAuthenticationMethod extends AuthenticationMethod {
    constructor(input?: DeepPartial<NativeAuthenticationMethod>) {
        super(input);
    }

    @Column()
    identifier: string;

    @Column({ select: false })
    passwordHash: string;

    @Column({ type: 'varchar', nullable: true })
    verificationToken: string | null;

    @Column({ type: 'timestamp', nullable: true })
    verificationTokenCreatedAt: Date | null;

    @Column({ type: 'varchar', nullable: true })
    passwordResetToken: string | null;

    @Column({ type: 'timestamp', nullable: true })
    passwordResetTokenCreatedAt: Date | null;

    /**
     * @description
     * A token issued when a User requests to change their identifier (typically an email address)
     */
    @Column({ type: 'varchar', nullable: true })
    identifierChangeToken: string | null;

    @Column({ type: 'timestamp', nullable: true })
    identifierChangeTokenCreatedAt: Date | null;

    /**
     * @description
     * When a request has been made to change the User's identifier, the new identifier
     * will be stored here until it has been verified, after which it will
     * replace the current value of the `identifier` field.
     */
    @Column({ type: 'varchar', nullable: true })
    pendingIdentifier: string | null;
}
