// js/utils.js: Contains helper functions used across the application.

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatAge(age) {
    if (age === null || age === undefined) return 'N/A';
    return age;
}

export function saveDataToLocalStorage(state) {
    localStorage.setItem('financialProjectionState', JSON.stringify(state));
}

export function loadDataFromLocalStorage() {
    try {
        const savedState = localStorage.getItem('financialProjectionState');
        if (savedState) {
            return JSON.parse(savedState);
        }
    } catch (error) {
        console.error("Failed to load state from localStorage:", error);
    }
    return null;
}

export const DEFAULTS = {
    netWorth: 25000,
    income: 85000,
    expenses: 55000,
    taxFilingStatus: 'single',
    customTaxRate: 22,
    currentAge: 30,
    annualIncomeIncrease: 2,
    investmentReturnRate: 8,
    inflationRate: 3,
    safeWithdrawalRate: 4,
    retirementAge: 62,
    retirementExpenses: 60000,
    retirementIncome: 25000,
    lifeExpectancy: 80
};

export function showScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
};