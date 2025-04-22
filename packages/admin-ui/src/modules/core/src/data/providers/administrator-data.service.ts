import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import {
    CreateAdministratorInput,
    CreateRoleInput,
    UpdateActiveAdministratorInput,
    UpdateAdministratorInput,
    UpdateRoleInput,
} from '@firelancerco/common/lib/generated-schema';
import { ADMIN_API_BASE_URL } from '../data.module';

export class AdministratorDataService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(ADMIN_API_BASE_URL);

    getActiveAdministrator() {
        return this.http.get<unknown>(`${this.baseUrl}/admins/active`);
    }

    createAdministrator(input: CreateAdministratorInput) {
        return this.http.post<unknown>(`${this.baseUrl}/admins/create`, { input });
    }

    updateAdministrator(input: UpdateAdministratorInput) {
        return this.http.put<unknown>(`${this.baseUrl}/admins`, { input });
    }

    updateActiveAdministrator(input: UpdateActiveAdministratorInput) {
        return this.http.put<unknown>(`${this.baseUrl}/admins/active`, { input });
    }

    deleteAdministrator(id: string) {
        return this.http.delete<unknown>(`${this.baseUrl}/admins/${id}`);
    }

    deleteAdministrators(ids: string[]) {
        return this.http.delete<unknown>(`${this.baseUrl}/admins`, { body: { ids } });
    }

    getRoles(take = 10, skip = 0) {
        return this.http.get<unknown>(`${this.baseUrl}/roles`, {
            params: {
                take,
                skip,
            },
        });
    }

    createRole(input: CreateRoleInput) {
        return this.http.post<unknown>(`${this.baseUrl}/roles/create`, { input });
    }

    updateRole(input: UpdateRoleInput) {
        return this.http.put<unknown>(`${this.baseUrl}/roles`, { input });
    }

    deleteRole(id: string) {
        return this.http.delete<unknown>(`${this.baseUrl}/roles/${id}`);
    }

    deleteRoles(ids: string[]) {
        return this.http.delete<unknown>(`${this.baseUrl}/roles`, { body: { ids } });
    }
}
