"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { RootState } from "@/Interfaces/Interfaces";
import { updateDateRangeAndFetchData } from "@/app/store/thunks";
import { AppDispatch } from "@/app/store/store";

/** -------------------------
 *  Helpers: local formatting
 *  -------------------------
 */

/**
 * Pad a number to 2 digits
 */
const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Return local timezone offset in "+03:00" or "-05:30" format
 */
const tzOffsetString = (d: Date) => {
    const offsetMin = -d.getTimezoneOffset(); // negative of getTimezoneOffset to get sign we want
    const sign = offsetMin >= 0 ? "+" : "-";
    const absMin = Math.abs(offsetMin);
    const hh = pad2(Math.floor(absMin / 60));
    const mm = pad2(absMin % 60);
    return `${sign}${hh}:${mm}`;
};

/**
 * Format a Date to a full ISO string with local timezone offset.
 * If isEnd is true, set time to 23:59:59.999, otherwise 00:00:00.000
 *
 * Examples:
 *  - "2025-12-04T00:00:00.000+03:00"
 *  - "2025-12-04T23:59:59.999+03:00"
 */
const formatISOWithOffset = (d: Date, isEnd = false) => {
    const year = d.getFullYear();
    const month = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());

    const hh = isEnd ? 23 : 0;
    const mm = isEnd ? 59 : 0;
    const ss = isEnd ? 59 : 0;
    const ms = isEnd ? 999 : 0;

    const time = `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}.${String(ms).padStart(
        3,
        "0"
    )}`;

    return `${year}-${month}-${day}T${time}${tzOffsetString(d)}`;
};

/**
 * Helpers to get start and end of local day (preserving local timezone).
 */
const startOfDay = (d: Date) => {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
};

const endOfDay = (d: Date) => {
    const n = new Date(d);
    n.setHours(23, 59, 59, 999);
    return n;
};

/** -------------------------
 *  Component
 *  -------------------------
 */
export function DateRangePicker(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const { fromDate, toDate, transactionType } = useSelector(
        (s: RootState) => s.dateRange
    );

    /**
     * range holds actual Date objects (local time).
     * We will set it from Redux strings (which we store as ISO-with-offset).
     */
    const [range, setRange] = React.useState<DateRange | undefined>(() => {
        if (!fromDate && !toDate) return undefined;

        // If fromDate/toDate exist in the store, create Date objects from them.
        // We expect strings like "2025-12-04T00:00:00.000+03:00"
        try {
            return {
                from: fromDate ? new Date(fromDate) : undefined,
                to: toDate ? new Date(toDate) : undefined,
            } as DateRange;
        } catch {
            return undefined;
        }
    });

    // Keep range in sync when Redux store changes externally
    React.useEffect(() => {
        // avoid unnecessary setState if values are identical
        const newRange =
            fromDate || toDate
                ? {
                    from: fromDate ? new Date(fromDate) : undefined,
                    to: toDate ? new Date(toDate) : undefined,
                }
                : undefined;

        // simple deep-ish compare
        const same =
            (newRange === undefined && range === undefined) ||
            (!!newRange &&
                !!range &&
                ((newRange.from === undefined && range.from === undefined) ||
                    (newRange.from &&
                        range.from &&
                        newRange.from.getTime() === range.from.getTime())) &&
                ((newRange.to === undefined && range.to === undefined) ||
                    (newRange.to &&
                        range.to &&
                        newRange.to.getTime() === range.to.getTime())));

        if (!same) setRange(newRange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate]);

    const [open, setOpen] = React.useState(false);
    const userIsSelecting = React.useRef(false);

    /** PRESET RANGES **/
    const PRESET_RANGES = React.useMemo(() => {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        const yesterday = new Date(todayStart);
        yesterday.setDate(yesterday.getDate() - 1);

        const last7 = startOfDay(
            new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) // includes today
        );
        const last30 = startOfDay(
            new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
        );

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        return {
            today: { from: todayStart, to: todayEnd },
            yesterday: { from: startOfDay(yesterday), to: endOfDay(yesterday) },
            last7Days: { from: last7, to: todayEnd },
            last30Days: { from: last30, to: todayEnd },
            thisMonth: { from: startOfDay(thisMonthStart), to: todayEnd },
            lastMonth: { from: startOfDay(lastMonthStart), to: endOfDay(lastMonthEnd) },
        } as const;
    }, []);

    const endOfToday = React.useMemo(() => endOfDay(new Date()), []);

    /** Dispatch wrapper
     *
     * For Option B we store:
     *   - from  => "YYYY-MM-DDT00:00:00.000+HH:MM"
     *   - to    => "YYYY-MM-DDT23:59:59.999+HH:MM"
     */
    const sendUpdate = React.useCallback(
        (selected: DateRange | undefined, type: "all" | "spent" | "received") => {
            const payload = {
                from: selected?.from ? formatISOWithOffset(startOfDay(selected.from), false) : null,
                to: selected?.to ? formatISOWithOffset(endOfDay(selected.to), true) : null,
                transactionType: type,
            };
            // dispatch the thunk that expects from/to either full ISO strings or null
            dispatch(updateDateRangeAndFetchData(payload));
        },
        [dispatch]
    );

    /** Handle date selection **/
    const handleSelect = (
        selectedRange: DateRange | undefined,
        type: "all" | "spent" | "received" = transactionType
    ) => {
        userIsSelecting.current = true;

        const normalized =
            selectedRange && (selectedRange.from || selectedRange.to)
                ? {
                    from: selectedRange.from ? startOfDay(selectedRange.from) : undefined,
                    to: selectedRange.to ? endOfDay(selectedRange.to) : undefined,
                }
                : undefined;

        setRange(normalized);
        sendUpdate(normalized, type);

        // Close popover only when user selects both dates
        if (userIsSelecting.current && normalized?.from && normalized?.to) {
            // small timeout to allow Calendar internal state to settle
            setTimeout(() => setOpen(false), 0);
        }
    };

    /** Handle presets **/
    const handlePresetSelect = (key: keyof typeof PRESET_RANGES) => {
        const r = PRESET_RANGES[key];
        handleSelect({ from: r.from, to: r.to });
    };

    /** Handle type change **/
    const handleTypeChange = (value: string) => {
        const t = value as "all" | "spent" | "received";
        // when we change type we want to keep the same date range selection
        sendUpdate(range, t);
    };

    /** Reset **/
    const handleReset = () => {
        setRange(undefined);
        sendUpdate(undefined, "all");
    };

    /** Display text **/
    const displayText = React.useMemo(() => {
        if (!range?.from) return "Select date range";
        if (!range.to) return range.from.toLocaleDateString();
        return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
    }, [range]);

    return (
        <Card className="bg-card px-5">
            <div className="flex flex-col gap-3">
                <Label className="font-medium">Date Range</Label>
                <Label className="text-sm font-normal text-muted-foreground">
                    Select the date for your transactions
                </Label>

                <Popover
                    open={open}
                    onOpenChange={(o) => {
                        userIsSelecting.current = false; // reset
                        setOpen(o);
                    }}
                >
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-64 justify-between font-normal"
                        >
                            <span>{displayText}</span>
                            <ChevronDownIcon
                                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                            />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                        <div className="flex">
                            {/* Presets */}
                            <div className="flex flex-col border-r bg-muted/20 p-3">
                                <h3 className="mb-2 text-sm font-medium">Presets</h3>

                                {Object.keys(PRESET_RANGES).map((key) => (
                                    <Button
                                        key={key}
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start text-left text-sm font-normal h-8 px-2 mb-1"
                                        onClick={() =>
                                            handlePresetSelect(key as keyof typeof PRESET_RANGES)
                                        }
                                    >
                                        {key.replace(/([A-Z])/g, " $1")}
                                    </Button>
                                ))}

                                {range && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 text-xs"
                                        onClick={handleReset}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Calendar */}
                            <div className="p-3">
                                <Calendar
                                    mode="range"
                                    selected={range}
                                    onSelect={(r) => handleSelect(r)}
                                    numberOfMonths={2}
                                    disabled={{ after: endOfToday }}
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <Label className="font-medium">Transaction Type</Label>

                <Select value={transactionType} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="spent">Spent</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </Card>
    );
}
