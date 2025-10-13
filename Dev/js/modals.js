// js/modals.js: Handles logic for opening, closing, and populating all modals.

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

export function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

export function openLifeEventModal(state, eventData = {}, eventIndex = null) {
    const form = document.getElementById('life-event-form');
    form.reset();
    form.dataset.index = eventIndex !== null ? eventIndex : '';

    const lifeEventTitle = eventIndex !== null ? 'Edit Life Event' : 'Add New Life Event';
    document.getElementById('life-event-title').innerText = lifeEventTitle;
    document.getElementById('life-event-submit-btn').innerText = eventIndex !== null ? 'Save Event' : 'Add Event';

    document.querySelectorAll('.change-field').forEach(field => field.classList.add('hidden'));
    document.getElementById('change-inputs-container').classList.add('hidden');
    const durationField = document.getElementById('duration-field');
    durationField.classList.add('hidden');

    if (eventIndex !== null) {
        document.getElementById('event-name').value = eventData.name;
        document.getElementById('event-startAge').value = eventData.startAge;
        if (eventData.changeType !== 'oneTimeExpense') {
            document.getElementById('event-duration').value = eventData.duration;
            durationField.classList.remove('hidden');
        } else {
            document.getElementById('event-duration').value = 1;
            durationField.classList.add('hidden');
        }
        document.getElementById('event-change-type').value = eventData.changeType;
        document.getElementById('change-inputs-container').classList.remove('hidden');
        document.getElementById(`${eventData.changeType}-change-fields`).classList.remove('hidden');
        if (eventData.changeType === 'oneTimeExpense') {
            document.getElementById('oneTimeExpense-value').value = eventData.value;
        } else {
            document.getElementById(`${eventData.changeType}-op`).value = eventData.operation;
            document.getElementById(`${eventData.changeType}-value`).value = eventData.value;
            if (eventData.changeType !== 'taxRate') {
                document.getElementById(`${eventData.changeType}-type`).value = eventData.valueType;
            }
        }
    } else {
        document.getElementById('event-duration').value = '';
        document.getElementById('income-op').value = 'set';
        document.getElementById('income-type').value = 'amount';
        document.getElementById('expenses-op').value = 'set';
        document.getElementById('expenses-type').value = 'amount';
        document.getElementById('taxRate-op').value = 'set';
    }

    openModal('life-event-modal');
}

export function openAssumptionsModal(state) {
    const form = document.getElementById('assumptions-form');
    form.annualIncomeIncrease.value = state.initialData.annualIncomeIncrease;
    form.investmentReturnRate.value = state.initialData.investmentReturnRate;
    form.inflationRate.value = state.initialData.inflationRate;
    form.safeWithdrawalRate.value = state.initialData.safeWithdrawalRate;
    form.retirementAge.value = state.initialData.retirementAge;
    form.retirementExpenses.value = state.initialData.retirementExpenses;
    form.retirementIncome.value = state.initialData.retirementIncome;
    form.lifeExpectancy.value = state.initialData.lifeExpectancy;
    openModal('assumptions-modal');
}

export function openRetirementAssumptionsModal(state) {
    const form = document.getElementById('retirement-assumptions-form');
    form.retirementSafeWithdrawalRate.value = state.initialData.safeWithdrawalRate;
    form.retirementRetirementAge.value = state.initialData.retirementAge;
    form.retirementRetirementExpenses.value = state.initialData.retirementExpenses;
    form.retirementRetirementIncome.value = state.initialData.retirementIncome;
    form.retirementLifeExpectancy.value = state.initialData.lifeExpectancy;
    openModal('retirement-assumptions-modal');
}

export function openInitialDataModal(state) {
    document.getElementById('editNetWorth').value = state.initialData.netWorth;
    document.getElementById('editIncome').value = state.initialData.income;
    document.getElementById('editExpenses').value = state.initialData.expenses;
    document.getElementById('editTaxFilingStatus').value = state.initialData.taxFilingStatus;
    document.getElementById('editCustomTaxRate').value = state.initialData.customTaxRate;
    document.getElementById('editCurrentAge').value = state.initialData.currentAge;
    const customTaxRateContainer = document.getElementById('editCustomTaxRateContainer');
    const isCustomTaxStatus = state.initialData.taxFilingStatus !== 'custom';
    customTaxRateContainer.classList.toggle('hidden', isCustomTaxStatus);
    openModal('initial-data-modal');
}

let _INFO_TEXTS_CACHE = null;
async function loadInfoTexts() {
    if (_INFO_TEXTS_CACHE) return _INFO_TEXTS_CACHE;
    try {
        const res = await fetch('./js/info_texts.txt');
        if (!res.ok) throw new Error('Failed to load info_texts');
        const text = await res.text();
        _INFO_TEXTS_CACHE = JSON.parse(text);
        return _INFO_TEXTS_CACHE;
    } catch (err) {
        console.error('Error loading info texts:', err);
        _INFO_TEXTS_CACHE = {};
        return _INFO_TEXTS_CACHE;
    }
}

export async function openInfoModal(type) {
    document.getElementById('info-modal-title').innerText = 'Info';
    const info = await loadInfoTexts();
    document.getElementById('info-modal-content').innerText = info[type] || '';
    openModal('info-modal');
}