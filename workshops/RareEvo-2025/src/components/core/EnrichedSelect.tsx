import { useState, useRef, useEffect, ReactNode } from "react";

export interface EnrichedSelectItem<T = any> {
    id: string;
    data: T;
}

export interface EnrichedSelectItemRenderer<T> {
    (item: EnrichedSelectItem<T>, index: number): ReactNode;
}

export interface EnrichedSelectProps<T> {
    items: EnrichedSelectItem<T>[];
    renderItem: EnrichedSelectItemRenderer<T>;
    onSelectItem?: (item: EnrichedSelectItem<T>) => void;
    placeholder: string;
    renderSelectedItem?: (item: EnrichedSelectItem<T>) => ReactNode;
    emptyState?: {
        icon: ReactNode;
        title: string;
        description: string;
        action?: {
            label: string;
            onClick: () => void;
        };
    };
    className?: string;
    dropdownClassName?: string;
    maxHeight?: string;
    zIndex?: string;
    disabled?: boolean;
    selectedItemId?: string;
    focusColor?: string;
    closeOnSelect?: boolean; // Whether to close dropdown when an item is selected/clicked
    fontSize?: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl'; // Font size for select and options
}

export function EnrichedSelect<T>({
    items,
    renderItem,
    onSelectItem,
    placeholder,
    renderSelectedItem,
    emptyState,
    className = "",
    dropdownClassName = "",
    maxHeight = "max-h-80",
    zIndex = "z-50",
    disabled = false,
    selectedItemId,
    focusColor = "emerald",
    closeOnSelect = true,
    fontSize = "text-lg"
}: EnrichedSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent wheel events from bubbling up to the scroll navigation system
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (isOpen) {
                event.stopPropagation();
            }
        };

        const dropdown = dropdownRef.current?.querySelector('.enriched-select-dropdown');
        if (dropdown) {
            dropdown.addEventListener('wheel', handleWheel, { passive: true });
            return () => dropdown.removeEventListener('wheel', handleWheel);
        }
    }, [isOpen]);

    const handleItemSelect = (item: EnrichedSelectItem<T>) => {
        onSelectItem?.(item);
        if (closeOnSelect) {
            setIsOpen(false);
        }
    };

    const getFocusClasses = () => {
        switch (focusColor) {
            case 'blue':
                return 'focus:ring-blue-500 focus:border-blue-500';
            case 'emerald':
            default:
                return 'focus:ring-emerald-500 focus:border-emerald-500';
        }
    };

    if (items.length === 0 && emptyState) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    {emptyState.icon}
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">{emptyState.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{emptyState.description}</p>
                {emptyState.action && (
                    <button
                        disabled={disabled}
                        onClick={emptyState.action.onClick}
                        className={`px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${fontSize}`}
                    >
                        {emptyState.action.label}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`relative pt-2 ${className}`} ref={dropdownRef}>
            <button
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-left ${getFocusClasses()} transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed ${fontSize}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {(() => {
                            const selectedItem = selectedItemId ? items.find(item => item.id === selectedItemId) : null;
                            return selectedItem && renderSelectedItem ? (
                                renderSelectedItem(selectedItem)
                            ) : (
                                <span className="text-slate-900">
                                    {placeholder}
                                </span>
                            );
                        })()}
                    </div>
                    <svg
                        className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className={`enriched-select-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg ${zIndex} ${maxHeight} overflow-y-auto ${dropdownClassName} ${fontSize}`}>
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => handleItemSelect(item)}
                            className={`cursor-pointer ${selectedItemId === item.id ? 'bg-slate-100' : ''}`}
                        >
                            {renderItem(item, index)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
