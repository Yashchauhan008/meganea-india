import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronsUpDown, Check } from 'lucide-react';

const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        let newSelected;
        if (selected.includes(optionValue)) {
            newSelected = selected.filter(item => item !== optionValue);
        } else {
            newSelected = [...selected, optionValue];
        }
        onChange(newSelected);
    };

    const getSelectedNames = () => {
        return options
            .filter(opt => selected.includes(opt.value))
            .map(opt => opt.label);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* The main input-like button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="form-input flex items-center justify-between w-full text-left"
            >
                <div className="flex flex-wrap gap-2">
                    {getSelectedNames().length > 0 ? (
                        getSelectedNames().map(name => (
                            <span key={name} className="bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary text-xs font-medium px-2 py-1 rounded-full">
                                {name}
                            </span>
                        ))
                    ) : (
                        <span className="text-text-secondary/70 dark:text-dark-text-secondary/70">{placeholder}</span>
                    )}
                </div>
                <ChevronsUpDown className="h-4 w-4 text-text-secondary/50" />
            </button>

            {/* The dropdown panel */}
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul className="p-1">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="px-3 py-2 text-sm text-text dark:text-dark-text rounded-md flex items-center justify-between cursor-pointer hover:bg-background dark:hover:bg-dark-background"
                            >
                                <span>{option.label}</span>
                                {selected.includes(option.value) && <Check className="h-4 w-4 text-primary" />}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
