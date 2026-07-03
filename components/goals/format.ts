export const formatMoney = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return "0.00"
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const formatDate = (value: string | null | undefined) => {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
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

// `progress` is a 0..1 fraction (per the API). Display as a percent.
export const formatPercent = (progress: number | null | undefined) => {
    if (progress === null || progress === undefined || Number.isNaN(Number(progress))) return "0.0%"
    const num = Number(progress) * 100
    return `${num.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`
}
