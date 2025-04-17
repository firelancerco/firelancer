import { CustomerType } from '@firelancerco/common/lib/shared-schema';

export class GoogleAuthData {
    action: 'register' | 'login';
    id_token?: string;
    access_token?: string;
    customer_type?: CustomerType;
}
