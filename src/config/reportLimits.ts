// src/config/reportLimits.ts

interface ReportLimits {
    [role: string]: number;
}

export const reportLimits: ReportLimits = {
    free_user: 5,          // Limit for free users
    paid_user: 50,         // Limit for paid users
    admin: 200,            // Limit for admins
    super_admin: 1000,     // Limit for super admins
};
