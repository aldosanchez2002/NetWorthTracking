// js/initialScreen.js: Handles logic for the initial data entry screen.

export function renderInitialScreen(state) {
    const form = document.getElementById('initial-form');
    if (form) {
        form.netWorth.value = state.initialData.netWorth;
        form.income.value = state.initialData.income;
        form.expenses.value = state.initialData.expenses;
        form.taxFilingStatus.value = state.initialData.taxFilingStatus;
        form.customTaxRate.value = state.initialData.customTaxRate;
        form.currentAge.value = state.initialData.currentAge;
        toggleCustomTaxRateInput('taxFilingStatus', 'customTaxRateContainer');
    }
}

export function toggleCustomTaxRateInput(selectId, containerId) {
    const status = document.getElementById(selectId).value;
    const container = document.getElementById(containerId);
    container.classList.toggle('hidden', status !== 'custom');
}