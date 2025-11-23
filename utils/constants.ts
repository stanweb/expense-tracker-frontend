export const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));

const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: 7 }, (_, i) => String(CURRENT_YEAR + 1 - i));

export const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF',
    '#FF1919', '#FF19A3', '#19FF19', '#1919FF', '#A319FF'
];