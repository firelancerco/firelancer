import { Column, DeepPartial, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

import { InternalServerException } from '../../common/error/errors';
import { SoftDeletable } from '../../common/shared-types';
import { AuthenticationMethod } from '../authentication-method/authentication-method.entity';
import { NativeAuthenticationMethod } from '../authentication-method/native-authentication-method.entity';
import { FirelancerEntity } from '../base/base.entity';
import { Role } from '../role/role.entity';
import { AuthenticatedSession } from '../session/authenticated-session.entity';

/**
 * @description
 * A User represents any authenticated user of the Firelancer API.
 */
@Entity()
export class User extends FirelancerEntity implements SoftDeletable {
    constructor(input?: DeepPartial<User>) {
        super(input);
    }

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    @Column({ unique: true })
    identifier: string;

    @OneToMany(() => AuthenticationMethod, authenticationMethod => authenticationMethod.user)
    authenticationMethods: AuthenticationMethod[];

    @Column({ default: false })
    verified: boolean;

    @ManyToMany(() => Role, { eager: true })
    @JoinTable()
    roles: Role[];

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date | null;

    @OneToMany(() => AuthenticatedSession, session => session.user)
    sessions: AuthenticatedSession[];

    getNativeAuthenticationMethod(): NativeAuthenticationMethod;
    getNativeAuthenticationMethod(strict?: boolean): NativeAuthenticationMethod | undefined;
    getNativeAuthenticationMethod(strict?: boolean): NativeAuthenticationMethod | undefined {
        if (!this.authenticationMethods) {
            // TODO
            throw new InternalServerException('error.user-authentication-methods-not-loaded' as any);
        }
        const match = this.authenticationMethods.find(
            (m): m is NativeAuthenticationMethod => m instanceof NativeAuthenticationMethod,
        );
        if (!match && (strict === undefined || strict)) {
            // TODO
            throw new InternalServerException('error.native-authentication-methods-not-found' as any);
        }
        return match;
    }
}
