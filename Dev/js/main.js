// js/main.js: The main entry point. Initializes the app, manages state, and wires up event listeners.

import { DEFAULTS, saveDataToLocalStorage, loadDataFromLocalStorage } from './utils.js';
import { initializeDarkMode } from './darkmode.js';
import { openLifeEventModal, openAssumptionsModal, openRetirementAssumptionsModal, openInitialDataModal, openInfoModal, closeModal } from './modals.js';
import { renderInitialScreen, toggleCustomTaxRateInput } from './initialScreen.js';
import { updateUI, getChartInstances } from './dashboard.js';

// --- APPLICATION STATE ---
const state = {
    initialData: { ...DEFAULTS },
    lifeEvents: [],
    isSetup: false,
    projection: [],
    fiAge: null,
    zeroAge: null
};

// --- CORE FUNCTIONS ---
function createOrUpdateRetirementEvent() {
    let retirementEventIndex = state.lifeEvents.findIndex(e => e.id === 'retirement');
    const retirementEvent = {
        id: 'retirement',
        name: 'Retirement',
        startAge: state.initialData.retirementAge,
        duration: -1,
        changeType: 'expenses',
        operation: 'set',
        value: state.initialData.retirementExpenses,
        valueType: 'amount',
        isDeletable: false
    };

    if (retirementEventIndex > -1) {
        state.lifeEvents[retirementEventIndex] = retirementEvent;
    } else {
        state.lifeEvents.push(retirementEvent);
    }
}

function handleStateUpdate() {
    createOrUpdateRetirementEvent();
    saveDataToLocalStorage(state);
    updateUI(state);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Load existing state from storage
    const savedState = loadDataFromLocalStorage();
    if (savedState) {
        Object.assign(state, savedState);
        // Handle potential new properties if loading old state
        state.initialData.retirementIncome = savedState.initialData.retirementIncome || DEFAULTS.retirementIncome;
    }
    
    // Initialize Dark Mode (pass a function to get chart instances)
    initializeDarkMode(getChartInstances());

    // Render initial views
    renderInitialScreen(state);
    updateUI(state);

    // --- EVENT LISTENERS ---

    // Initial Form Submission
    document.getElementById('initial-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        state.initialData = {
            ...state.initialData,
            netWorth: parseFloat(form.netWorth.value),
            income: parseFloat(form.income.value),
            expenses: parseFloat(form.expenses.value),
            taxFilingStatus: form.taxFilingStatus.value,
            customTaxRate: parseFloat(form.customTaxRate.value) || DEFAULTS.customTaxRate,
            currentAge: parseInt(form.currentAge.value, 10),
        };
        state.isSetup = true;
        handleStateUpdate();
    });

    // Assumptions Form
    document.getElementById('assumptions-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        state.initialData = {
            ...state.initialData,
            annualIncomeIncrease: parseFloat(form.annualIncomeIncrease.value),
            investmentReturnRate: parseFloat(form.investmentReturnRate.value),
            inflationRate: parseFloat(form.inflationRate.value),
            safeWithdrawalRate: parseFloat(form.safeWithdrawalRate.value),
            retirementAge: parseInt(form.retirementAge.value, 10),
            retirementExpenses: parseFloat(form.retirementExpenses.value),
            retirementIncome: parseFloat(form.retirementIncome.value),
            lifeExpectancy: parseInt(form.lifeExpectancy.value, 10)
        };
        closeModal('assumptions-modal');
        handleStateUpdate();
    });

    // Retirement Assumptions Form
    document.getElementById('retirement-assumptions-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        state.initialData = { ...state.initialData,
            safeWithdrawalRate: parseFloat(form.retirementSafeWithdrawalRate.value),
            retirementAge: parseInt(form.retirementRetirementAge.value, 10),
            retirementExpenses: parseFloat(form.retirementRetirementExpenses.value),
            retirementIncome: parseFloat(form.retirementRetirementIncome.value),
            lifeExpectancy: parseInt(form.retirementLifeExpectancy.value, 10)
        };
        closeModal('retirement-assumptions-modal');
        handleStateUpdate();
    });

    // Initial Data Form (Edit)
    document.getElementById('initial-data-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        state.initialData = { ...state.initialData,
            netWorth: parseFloat(form.editNetWorth.value),
            income: parseFloat(form.editIncome.value),
            expenses: parseFloat(form.editExpenses.value),
            taxFilingStatus: form.editTaxFilingStatus.value,
            customTaxRate: parseFloat(form.editCustomTaxRate.value) || DEFAULTS.customTaxRate,
            currentAge: parseInt(form.editCurrentAge.value, 10),
        };
        closeModal('initial-data-modal');
        handleStateUpdate();
    });

    // Life Event Form
    document.getElementById('life-event-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const index = form.dataset.index;
        const changeType = form.changeType.value;
        let newEvent = { name: form.name.value, startAge: parseInt(form.startAge.value, 10), changeType, isDeletable: true };
        
        if (changeType === 'oneTimeExpense') {
            newEvent.duration = 1;
            newEvent.value = parseFloat(form.querySelector(`#oneTimeExpense-value`).value);
        } else {
            newEvent.duration = form.duration.value ? parseInt(form.duration.value, 10) : null;
            newEvent.operation = form.querySelector(`#${changeType}-op`).value;
            newEvent.value = parseFloat(form.querySelector(`#${changeType}-value`).value);
            newEvent.valueType = changeType !== 'taxRate' ? form.querySelector(`#${changeType}-type`).value : 'percent';
        }

        if (index) {
            state.lifeEvents[index] = newEvent;
        } else {
            state.lifeEvents.push(newEvent);
        }
        closeModal('life-event-modal');
        handleStateUpdate();
    });

    // UI Buttons
    document.getElementById('edit-initial-data-btn').addEventListener('click', () => openInitialDataModal(state));
    document.getElementById('edit-current-net-worth-btn').addEventListener('click', () => openInitialDataModal(state));
    document.getElementById('add-life-event-btn').addEventListener('click', () => openLifeEventModal(state));
    document.getElementById('add-life-event-btn-charts').addEventListener('click', () => openLifeEventModal(state));
    document.getElementById('edit-assumptions-btn').addEventListener('click', () => openAssumptionsModal(state));
    document.getElementById('edit-retirement-assumptions-btn').addEventListener('click', () => openRetirementAssumptionsModal(state));
    document.getElementById('edit-fi-assumptions-btn').addEventListener('click', () => openRetirementAssumptionsModal(state));
    document.getElementById('edit-fi-age-assumptions-btn').addEventListener('click', () => openRetirementAssumptionsModal(state));
    document.getElementById('edit-lifespan-assumptions-btn').addEventListener('click', () => openRetirementAssumptionsModal(state));
    
    document.getElementById('restart-session-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to restart? All your data will be lost.")) {
            localStorage.removeItem('financialProjectionState');
            window.location.reload();
        }
    });

    // Modal Closing Buttons
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.closest('.modal-overlay').id;
            closeModal(modalId);
        });
    });

    // Info Buttons
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            openInfoModal(btn.getAttribute('data-info'));
        });
    });

    // Dynamic Input Toggling
    document.getElementById('taxFilingStatus').addEventListener('change', () => toggleCustomTaxRateInput('taxFilingStatus', 'customTaxRateContainer'));
    document.getElementById('editTaxFilingStatus').addEventListener('change', () => toggleCustomTaxRateInput('editTaxFilingStatus', 'editCustomTaxRateContainer'));
    document.getElementById('event-change-type').addEventListener('change', (e) => {
        const changeType = e.target.value;
        document.querySelectorAll('.change-field').forEach(field => field.classList.add('hidden'));
        document.getElementById('duration-field').classList.toggle('hidden', changeType === 'oneTimeExpense' || !changeType);
        if (changeType) {
            document.getElementById('change-inputs-container').classList.remove('hidden');
            document.getElementById(`${changeType}-change-fields`).classList.remove('hidden');
        } else {
            document.getElementById('change-inputs-container').classList.add('hidden');
        }
    });

    // Life Event List Delegation (for edit/delete buttons)
    document.getElementById('life-events-list').addEventListener('click', function (e) {
        const editBtn = e.target.closest('.edit-event-btn');
        if (editBtn) {
            const index = editBtn.getAttribute('data-index');
            openLifeEventModal(state, state.lifeEvents[index], index);
        }
        const deleteBtn = e.target.closest('.delete-event-btn');
        if (deleteBtn) {
            if (confirm("Are you sure you want to delete this event?")) {
                const index = deleteBtn.getAttribute('data-index');
                state.lifeEvents.splice(index, 1);
                handleStateUpdate();
            }
        }
    });
});