export function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value ?? 0);
}
