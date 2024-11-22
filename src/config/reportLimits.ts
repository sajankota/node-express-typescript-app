// src/config/reportLimits.ts

interface ReportLimits {
    [role: string]: number;
}

export const reportLimits: ReportLimits = {
    free_user: 100,          // Limit for free users
    paid_user: 10000,         // Limit for paid users
    admin: 100000,            // Limit for admins
    super_admin: 1000000,     // Limit for super admins
};
