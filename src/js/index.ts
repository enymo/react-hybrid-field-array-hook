import { useCallback } from "react";
import { RegisterOptions, useFieldArray, useFormContext } from "react-hook-form";

function arrayWrap<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

export default function useHybridFieldArray<T extends object>({name = "", onChange, value, options}: {
    name?: string,
    onChange?: (value: T[]) => void | Promise<void>,
    value?: T[],
    options?: RegisterOptions
}) {
    const form = useFormContext();
    const fieldArray = useFieldArray({name, control: form?.control, rules: options});
    const fields: (T & {id?: string})[] = (name && form) ? fieldArray.fields as any : value ?? [];

    const append = useCallback((defaultValue: T | T[]) => {
        fieldArray.append(defaultValue);
        value && onChange?.([...value, ...arrayWrap(defaultValue)]);
    }, [onChange, value, fieldArray]);

    const prepend = useCallback((defaultValue: T | T[]) => {
        fieldArray.prepend(defaultValue);
        value && onChange?.([...arrayWrap(defaultValue), ...value]);
    }, [onChange, value, fieldArray]);

    const insert = useCallback((index: number, defaultValue: T) => {
        fieldArray.insert(index, defaultValue);
        if (value && onChange) {
            const copy = [...value];
            copy.splice(index, 0, defaultValue);
            onChange(copy);
        }
    }, [onChange, value, fieldArray]);

    const swap = useCallback((from: number, to: number) => {
        fieldArray.swap(from, to);
        if (value && onChange) {
            const valueCopy = [...value];
            [valueCopy[from], valueCopy[to]] = [valueCopy[to], valueCopy[from]];
            onChange(valueCopy);
        }
    }, [onChange, value, fieldArray]);

    const move = useCallback((from: number, to: number) => {
        fieldArray.move(from, to);
        if (value && onChange) {
            const copy = [...value];
            copy.splice(to, 0, ...copy.splice(from, 1));
            onChange(copy);
        }
    }, [onChange, value, fieldArray]);

    const update = useCallback((index: number, newValue: T) => {
        fieldArray.update(index, newValue);
        value && onChange?.(value.map((item, currentIndex) => currentIndex === index ? newValue : item));
    }, [onChange, value, fieldArray]);

    const replace = useCallback((value: T[]) => {
        fieldArray.replace(value);
        onChange?.(value);
    }, [onChange, fieldArray]);

    const remove = useCallback((index: number | number[]) => {
        fieldArray.remove(index);
        const filter = new Set(arrayWrap(index));
        value && onChange?.(value.filter((_, currentIndex) => !filter.has(currentIndex)));
    }, [onChange, value, fieldArray]);

    return {fields, append, prepend, insert, swap, move, update, replace, remove};
}