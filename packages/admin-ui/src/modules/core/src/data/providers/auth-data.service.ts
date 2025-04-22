import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ADMIN_API_BASE_URL } from '../data.module';

export class AuthDataService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(ADMIN_API_BASE_URL);

    currentUser() {
        return this.http.get<unknown>(`${this.baseUrl}/auth/me`);
    }

    attemptLogin(username: string, password: string, rememberMe: boolean) {
        return this.http.post<unknown>(`${this.baseUrl}/auth/login`, {
            username,
            password,
            rememberMe,
        });
    }

    logOut() {
        return this.http.post<unknown>(`${this.baseUrl}/auth/logout`, {});
    }
}
