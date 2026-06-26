export const formatMoney = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "0.00"
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const formatUnits = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "0"
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}