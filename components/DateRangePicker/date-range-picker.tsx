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

// import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setRange } from "@/app/store/dateSlice";
import {useDispatch, useSelector} from "react-redux";
import {JSX} from "react";
import {Card} from "@/components/ui/card";
import {RootState} from "@/Interfaces/Interfaces";

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
    const dispatch = useDispatch();
    const reduxRange = useSelector((s:RootState) => s.dateRange);
    const [isLoading, setIsLoading] = React.useState(false);

    // Local UI state uses react-day-picker's DateRange shape
    const [range, setRangeState] = React.useState<DateRange | undefined>(() => {
        if (!reduxRange.fromDate && !reduxRange.toDate) return undefined;

        const createLocalDate = (dateString: string | null) => {
            if (!dateString) return undefined;
            const date = new Date(dateString);
            // Create date without time component to avoid timezone issues
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };

        return {
            from: createLocalDate(reduxRange.fromDate),
            to: createLocalDate(reduxRange.toDate),
        };
    });

    const [open, setOpen] = React.useState(false);

    const handleSelect = async (selectedRange: DateRange | undefined) => {
        try {
            setIsLoading(true);

            // Validate dates are not in the future
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            const from = selectedRange?.from;
            const to = selectedRange?.to;

            if (from && from > today) {
                console.warn("From date cannot be in the future");
                return;
            }

            if (to && to > today) {
                console.warn("To date cannot be in the future");
                return;
            }

            setRangeState(selectedRange);

            dispatch(
                setRange({
                    fromDate: selectedRange?.from ? selectedRange.from.toISOString() : null,
                    toDate: selectedRange?.to ? selectedRange.to.toISOString() : null,
                })
            );

            // Close when a full range is chosen
            if (selectedRange?.from && selectedRange?.to) {
                setOpen(false);
            }
        } catch (error) {
            console.error('Error selecting date range:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePresetSelect = (presetKey: keyof typeof PRESET_RANGES) => {
        const presetRange = PRESET_RANGES[presetKey];
        const normalizedRange: DateRange = {
            from: new Date(presetRange.from.setHours(0, 0, 0, 0)),
            to: new Date(presetRange.to.setHours(23, 59, 59, 999)),
        };
        handleSelect(normalizedRange);
    };

    const handleReset = () => {
        setRangeState(undefined);
        dispatch(setRange({ fromDate: null, toDate: null }));
        setOpen(false);
    };

    const displayText = React.useMemo(() => {
        if (!range?.from) return "Select date range";

        if (!range.to) {
            if (range.from.toDateString() === new Date().toDateString()) {
                return "Today";
            }
            return range.from.toLocaleDateString();
        }

        // Same day range
        if (range.from.toDateString() === range.to.toDateString()) {
            if (range.from.toDateString() === new Date().toDateString()) {
                return "Today";
            }
            return range.from.toLocaleDateString();
        }

        // Same month and year
        if (range.from.getMonth() === range.to.getMonth() &&
            range.from.getFullYear() === range.to.getFullYear()) {
            return `${range.from.getDate()} - ${range.to.getDate()} ${range.from.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        }

        // Same year, different months
        if (range.from.getFullYear() === range.to.getFullYear()) {
            return `${range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }

        // Different years
        return `${range.from.toLocaleDateString()} → ${range.to.toLocaleDateString()}`;
    }, [range]);

    const formatPresetDate = (preset: PresetRange): string => {
        if (preset.from.toDateString() === preset.to.toDateString()) {
            return preset.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return `${preset.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${preset.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    return (
        <Card className="bg-card">
        <div className="flex flex-col gap-3">
            <Label className="px-1 text-sm font-medium">Date Range</Label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-64 justify-between font-normal"
                        aria-label="Select date range"
                        aria-describedby="date-range-description"
                        disabled={isLoading}
                    >
            <span className={isLoading ? "opacity-50" : ""}>
              {isLoading ? "Loading..." : displayText}
            </span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start" role="dialog" aria-label="Date range picker">
                    <div className="flex">
                        {/* Preset Ranges Sidebar */}
                        <div className="flex flex-col border-r bg-muted/20 p-3">
                            <h3 className="mb-2 text-sm font-medium">Presets</h3>
                            {Object.entries(PRESET_RANGES).map(([key, preset]) => (
                                <Button
                                    key={key}
                                    variant="ghost"
                                    size="sm"
                                    className="justify-start text-left text-sm font-normal h-8 px-2 mb-1"
                                    onClick={() => handlePresetSelect(key as keyof typeof PRESET_RANGES)}
                                >
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                    {formatPresetDate(preset)}
                  </span>
                                </Button>
                            ))}

                            {/* Reset Button */}
                            {range && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 text-xs"
                                    onClick={handleReset}
                                >
                                    Clear Selection
                                </Button>
                            )}
                        </div>

                        {/* Calendar */}
                        <div className="p-3">
                            <Calendar
                                mode="range"
                                selected={range}
                                onSelect={handleSelect}
                                numberOfMonths={2}
                                disabled={{ after: new Date() }}
                                className="rounded-md border"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Accessibility Description */}
            <div id="date-range-description" className="sr-only">
                Select a date range using the calendar or choose from preset options.
                Use arrow keys to navigate and enter to select dates. Future dates are disabled.
            </div>

            {/* Selected Range Summary */}
            {range?.from && range?.to && (
                <div className="px-1 text-xs text-muted-foreground">
                    Selected: {range.from.toLocaleDateString()} to {range.to.toLocaleDateString()}
                    {' '}
                    <Button
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={handleReset}
                    >
                        (clear)
                    </Button>
                </div>
            )}
        </div>
        </Card>
    );
}