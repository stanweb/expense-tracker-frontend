"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useDispatch, useSelector } from "react-redux";
import { JSX } from "react";
import { Card } from "@/components/ui/card";
import { RootState } from "@/Interfaces/Interfaces";
import { updateDateRangeAndFetchData } from "@/app/store/thunks";
import { AppDispatch } from "@/app/store/store";

interface PresetRange {
    from: Date;
    to: Date;
}

const PRESET_RANGES: Record<string, PresetRange> = {
    today: {
        from: new Date(new Date().setHours(0, 0, 0, 0)),
        to: new Date(new Date().setHours(23, 59, 59, 999))
    },
    yesterday: {
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() - 1))
    },
    last7Days: {
        from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        to: new Date()
    },
    last30Days: {
        from: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
        to: new Date()
    },
    thisMonth: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date()
    },
    lastMonth: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    },
};

export function DateRangePicker(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const { fromDate, toDate } = useSelector((s: RootState) => s.dateRange);
    const { loading: transactionsLoading } = useSelector((s: RootState) => s.transactions);
    const { loading: overviewLoading } = useSelector((s: RootState) => s.overview);
    const isLoading = transactionsLoading || overviewLoading;

    const [range, setRangeState] = React.useState<DateRange | undefined>(() => {
        if (!fromDate && !toDate) return undefined;
        return {
            from: fromDate ? new Date(fromDate) : undefined,
            to: toDate ? new Date(toDate) : undefined,
        };
    });

    const [open, setOpen] = React.useState(false);

    const handleSelect = (selectedRange: DateRange | undefined) => {
        setRangeState(selectedRange);
        dispatch(updateDateRangeAndFetchData(selectedRange ? { from: selectedRange.from?.toISOString(), to: selectedRange.to?.toISOString() } : null));

        if (selectedRange?.from && selectedRange?.to) {
            setOpen(false);
        }
    };

    const handlePresetSelect = (presetKey: keyof typeof PRESET_RANGES) => {
        const presetRange = PRESET_RANGES[presetKey];
        handleSelect({ from: presetRange.from, to: presetRange.to });
    };

    const handleReset = () => {
        handleSelect(undefined);
    };

    const displayText = React.useMemo(() => {
        if (!range?.from) return "Select date range";
        if (!range.to) return range.from.toLocaleDateString();
        return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
    }, [range]);

    return (
        <Card className="bg-card">
            <div className="flex flex-col gap-3">
                <Label className="px-1 text-sm font-medium">Date Range</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-64 justify-between font-normal"
                            disabled={isLoading}
                        >
                            <span>{isLoading ? "Loading..." : displayText}</span>
                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <div className="flex">
                            <div className="flex flex-col border-r bg-muted/20 p-3">
                                <h3 className="mb-2 text-sm font-medium">Presets</h3>
                                {Object.keys(PRESET_RANGES).map((key) => (
                                    <Button
                                        key={key}
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start text-left text-sm font-normal h-8 px-2 mb-1"
                                        onClick={() => handlePresetSelect(key as keyof typeof PRESET_RANGES)}
                                    >
                                        {key.replace(/([A-Z])/g, ' $1')}
                                    </Button>
                                ))}
                                {range && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 text-xs"
                                        onClick={handleReset}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                            <div className="p-3">
                                <Calendar
                                    mode="range"
                                    selected={range}
                                    onSelect={handleSelect}
                                    numberOfMonths={2}
                                    disabled={{ after: new Date() }}
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </Card>
    );
}
