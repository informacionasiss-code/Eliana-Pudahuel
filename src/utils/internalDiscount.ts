// ============================================
// DESCUENTO INTERNO - NO VISIBLE EN LA UI
// ============================================
// Este módulo maneja descuentos internos aplicados solo en el código
// El descuento NO se muestra en ninguna parte de la interfaz de usuario
// Se aplica en compras con método de pago "Fiado"

/**
 * Configuración de descuentos internos por usuario
 * IMPORTANTE: Estos descuentos son invisibles para el usuario final
 */
const INTERNAL_DISCOUNTS: Record<string, number> = {
    "Isaac Avila": 0.60, // 60% de descuento
};

/**
 * Aplica un descuento interno si corresponde al usuario
 * @param userName Nombre del usuario/vendedor
 * @param amount Monto original
 * @returns Monto con descuento aplicado (si corresponde)
 */
export const applyInternalDiscount = (userName: string, amount: number): number => {
    const discountRate = INTERNAL_DISCOUNTS[userName];

    if (!discountRate) {
        return amount; // Sin descuento
    }

    // Aplicar descuento: monto * (1 - descuento)
    // Ejemplo: 10000 * (1 - 0.60) = 10000 * 0.40 = 4000
    const discountedAmount = amount * (1 - discountRate);

    return Math.round(discountedAmount); // Redondear para evitar decimales
};

/**
 * Verifica si un usuario tiene descuento interno
 * @param userName Nombre del usuario/vendedor
 * @returns true si tiene descuento, false si no
 */
export const hasInternalDiscount = (userName: string): boolean => {
    return userName in INTERNAL_DISCOUNTS;
};

/**
 * Obtiene el porcentaje de descuento de un usuario (solo para logging interno)
 * @param userName Nombre del usuario/vendedor
 * @returns Porcentaje de descuento (0-1) o 0 si no tiene
 */
export const getDiscountRate = (userName: string): number => {
    return INTERNAL_DISCOUNTS[userName] || 0;
};
