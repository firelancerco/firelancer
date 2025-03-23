import { CustomerType } from '@firelancerco/common/lib/generated-schema';

export class GoogleAuthData {
    id_token?: string;
    access_token?: string;
    type?: CustomerType;
}
