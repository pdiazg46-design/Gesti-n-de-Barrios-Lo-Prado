// Lista de emails autorizados como ADMIN Municipal
// Agregar aquí los emails de las personas que tendrán acceso al panel municipal

export const MUNICIPAL_ADMINS = [
    'pdiazg46@gmail.com', // Patricio Díaz - Admin Municipal
    'pdiazg@gmail.com',   // Patricio Díaz - Superadmin Alternativo
    // Agregar más emails si es necesario
];

export function isMunicipalAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    return MUNICIPAL_ADMINS.includes(email.toLowerCase());
}
