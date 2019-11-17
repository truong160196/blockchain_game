export const formatCurrency = (number, digit = 4) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: digit }).format(number)
}