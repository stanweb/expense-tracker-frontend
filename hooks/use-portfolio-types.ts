'use client'

import { useCallback, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/Interfaces/Interfaces"
import { setPortfolioTypes } from "@/store/portfolio-types-slice"
import { getPortfolioTypes } from "@/components/api-calls/portfolio-types"

export function usePortfolioTypes() {
    const dispatch = useDispatch()
    const items = useSelector((s: RootState) => s.portfolioTypes.items)
    const loaded = useSelector((s: RootState) => s.portfolioTypes.loaded)
    const userId = useSelector((s: RootState) => s.user.userId)
    const inFlight = useRef(false)

    const refresh = useCallback(async () => {
        if (!userId || inFlight.current) return
        inFlight.current = true
        try {
            const fetched = await getPortfolioTypes(userId)
            dispatch(setPortfolioTypes(fetched))
        } finally {
            inFlight.current = false
        }
    }, [userId, dispatch])

    useEffect(() => {
        if (!userId || loaded) return
        let cancelled = false
        ;(async () => {
            const fetched = await getPortfolioTypes(userId)
            if (!cancelled) dispatch(setPortfolioTypes(fetched))
        })()
        return () => {
            cancelled = true
        }
    }, [userId, loaded, dispatch])

    return { items, refresh }
}