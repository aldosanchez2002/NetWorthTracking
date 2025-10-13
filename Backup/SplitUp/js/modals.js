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

    document.getElementById('life-event-title').innerText = eventIndex !== null ? 'Edit Life Event' : 'Add New Life Event';
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
    document.getElementById('editCustomTaxRateContainer').classList.toggle('hidden', state.initialData.taxFilingStatus !== 'custom');
    openModal('initial-data-modal');
}

const INFO_TEXTS = {
    'current-net-worth': 'Your Current Net Worth is the total value of what you own minus what you owe. It is sourced from your initial financial data.',
    'projected-net-worth': 'Your Projected Net Worth at Retirement is an estimate of your total wealth when you reach the target retirement age. This calculation considers your income, expenses, inflation, and investment growth over time.\n\nSee the Detailed Projection Table for year-by-year breakdowns.',
    'savings-target': 'The Yearly Savings Target is the amount you should aim to save each year. It is the difference between your after-tax income and your expenses.\n\nFormula:\nIncome - Taxes - Expenses',
    'fi-number': 'The Net Worth Required to Retire, also known as your "Financial Independence Number," is the investment amount you need to generate enough passive income to cover your yearly expenses.\n\nFormula:\nAnnual Retirement Expenses / Safe Withdrawal Rate',
    'fi-age': 'Your Age of Financial Independence is the age when your investments are large enough to cover your expenses, allowing you to stop working. This is when your Net Worth is equal to your Net Worth Required to Retire.\n\nSee the Detailed Projection Table for year-by-year breakdowns.',
    'zero-age': 'The Net Worth Hits $0 age is a projection of when your savings could run out, based on your retirement spending. This is a crucial number to monitor for long-term planning.\n\nSee the Detailed Projection Table for year-by-year breakdowns.',
};

export function openInfoModal(type) {
    document.getElementById('info-modal-title').innerText = 'Info';
    document.getElementById('info-modal-content').innerText = INFO_TEXTS[type] || '';
    openModal('info-modal');
}