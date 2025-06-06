import { Injectable } from '@angular/core';
import { Permission } from '@firelancerco/common/lib/generated-schema';
import { BehaviorSubject } from 'rxjs';

/**
 * @description
 * This service is used internally to power components & logic that are dependent on knowing the
 * current user's permissions.
 */
@Injectable({
    providedIn: 'root',
})
export class PermissionsService {
    private currentUserPermissions: string[] = [];
    private _currentUserPermissions$ = new BehaviorSubject<string[]>([]);
    currentUserPermissions$ = this._currentUserPermissions$.asObservable();

    /**
     * @description
     * This is called whenever:
     * - the user logs in
     *
     * Since active user validation occurs as part of the main auth guard, we can be assured
     * that if the user is logged in, then this method will be called with the user's permissions
     * before any other components are rendered lower down in the component tree.
     */
    setCurrentUserPermissions(permissions: string[]) {
        this.currentUserPermissions = permissions;
        this._currentUserPermissions$.next(permissions);
    }

    userHasPermissions(requiredPermissions: Array<string | Permission>): boolean {
        for (const perm of requiredPermissions) {
            if (this.currentUserPermissions.includes(perm)) {
                return true;
            }
        }
        return false;
    }
}
