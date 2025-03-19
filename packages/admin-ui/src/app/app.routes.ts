import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'login', loadChildren: () => import('@firelancerco/admin-ui/login').then(m => m.LoginModule) },
];
