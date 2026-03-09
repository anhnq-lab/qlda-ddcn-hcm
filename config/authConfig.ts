/**
 * Auth Configuration — Ban DDCN TP.HCM
 * 
 * Login credentials until Supabase Auth is implemented.
 * Matches employees in Supabase DB.
 */

export interface AuthCredential {
    EmployeeID: string;
    Username: string;
    Email: string;
    Password: string;
}

/** Login lookup - minimal data for authentication only */
export const authCredentials: AuthCredential[] = [
    { EmployeeID: 'NV001', Username: 'Admin', Email: 'bqlddcn@tphcm.gov.vn', Password: '123456' },
    { EmployeeID: 'NV002', Username: 'TRUONG.NV', Email: '', Password: '123456' },
    { EmployeeID: 'NV003', Username: 'THUY.DM', Email: '', Password: '123456' },
    { EmployeeID: 'NV004', Username: 'DUNG.LV', Email: '', Password: '123456' },
];

/** 
 * Validate credentials and return employee ID if matched.
 * Employee profile data will be fetched from Supabase separately.
 */
export function validateCredentials(username: string, password: string): string | null {
    const match = authCredentials.find(c =>
        (c.Username === username || c.Email === username) && c.Password === password
    );
    return match?.EmployeeID ?? null;
}
