import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function number_format(value: number, locale: string = 'ru-RU') {
    const numberFormatter = new Intl.NumberFormat("ru-RU");
    return numberFormatter.format(value);
}