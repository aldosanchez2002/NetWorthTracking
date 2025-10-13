// js/dashboard.js: Manages all UI rendering for the main dashboard.

import { formatCurrency, formatAge, showScreen } from './utils.js';
import { runProjection } from './projection.js';
import { updateChartColors } from './darkmode.js';

let netWorthChart, yearlyFinancialsChart;

export function getChartInstances() {
    return { netWorthChart, yearlyFinancialsChart };
}

function renderLifeEvents(state) {
    const list = document.getElementById('life-events-list');
    list.innerHTML = '';
    state.lifeEvents.forEach((event, index) => {
        const li = document.createElement('div');
        li.className = 'flex items-center justify-between p-4 my-2 bg-gray-100 dark:bg-gray-100 rounded-lg shadow';
        const changeText = getChangeDescription(event);
        const durationText = (event.duration === null || event.duration === -1) ? 'Lasts until death' : `${event.duration} years`;
        let timeFrameText = (event.changeType === 'oneTimeExpense')
            ? `Happens at age ${event.startAge}`
            : `Starts at age ${event.startAge}, lasts ${durationText}.`;

        li.innerHTML = `
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800">${event.name}</h4>
                <p class="text-sm text-gray-600">${timeFrameText}<br>${changeText}</p>
            </div>
            <div>
                <button class="edit-event-btn text-blue-500 hover:text-blue-700 font-semibold px-2" data-index="${index}" data-event-id="${event.id}">Edit</button>
                ${event.isDeletable ? `<button class="delete-event-btn text-red-500 hover:text-red-700 font-semibold px-2" data-index="${index}">Delete</button>` : ''}
            </div>`;
        list.appendChild(li);
    });
}

function getChangeDescription(event) {
    if (event.changeType === 'oneTimeExpense') {
        return `Deducts a one-time expense of ${formatCurrency(event.value)}.`;
    }
    const opText = event.operation === 'set' ? 'set to' : 'change by';
    const valueText = event.valueType === 'percent' ? `${event.value}%` : formatCurrency(event.value);
    let targetText = event.changeType.charAt(0).toUpperCase() + event.changeType.slice(1);
    if (targetText === 'TaxRate') targetText = 'Tax Rate';
    return `${targetText} ${opText} ${valueText}`;
}

function renderProjectionTable(state) {
    const tableBody = document.getElementById('projection-table-body');
    tableBody.innerHTML = '';
    const taxStatusMap = {
        single: 'Single',
        married: 'Married Filing Jointly',
        headOfHousehold: 'Head of Household',
        custom: 'Custom Rate'
    };
    const taxStatusDisplay = taxStatusMap[state.initialData.taxFilingStatus] || 'N/A';

    state.projection.forEach((yearData, index) => {
        let rowClass = 'border-b hover:bg-gray-50';
        let milestoneIcon = '';
        let isMilestoneRow = false;
        if (yearData.netWorth >= 1000000 && (index === 0 || state.projection[index - 1].netWorth < 1000000)) {
            milestoneIcon = `<span class="has-tooltip" style="margin-left:4px; font-size:1.3em;">🤑<span class="tooltip-text">Millionaire Milestone</span></span>`;
            isMilestoneRow = true;
        }
        if (yearData.netWorth >= 10000000 && (index === 0 || state.projection[index - 1].netWorth < 10000000)) {
            milestoneIcon += `<span class="has-tooltip" style="margin-left:4px; font-size:1.3em;">🤑<span class="tooltip-text">Decamilionaire Milestone</span></span>`;
            isMilestoneRow = true;
        }
        if (isMilestoneRow) rowClass += ' milestone-row';
        if (index > 0 && yearData.netWorth < state.projection[index - 1].netWorth) rowClass += ' bg-red-100 dark:bg-red-900';

        const eventsForYear = state.lifeEvents
            .filter(event => event.startAge === yearData.age)
            .map(event => `<span class="event-link" data-event-id="${event.id}" data-event-name="${event.name}">${event.name}</span>`)
            .join(', ');

        const afterTaxIncome = yearData.income - yearData.taxes;
        const expenseTooltipText = afterTaxIncome > 0 ? `${((yearData.expenses / afterTaxIncome) * 100).toFixed(1)}% of after-tax income` : "Expenses exceed after-tax income.";
        const savingsTooltipText = afterTaxIncome > 0 ? `${((yearData.savings / afterTaxIncome) * 100).toFixed(1)}% of after-tax income` : "No after-tax income to save from.";
        const taxTooltipText = `Tax Status: ${taxStatusDisplay} - ${yearData.income > 0 ? ((yearData.taxes / yearData.income) * 100).toFixed(2) : 0}% of income`;

        const row = document.createElement('tr');
        row.className = rowClass;
        row.innerHTML = `
            <td class="px-6 py-3 text-sm font-bold text-gray-900">${yearData.age}</td>
            <td class="px-6 py-3 text-sm font-medium text-gray-900">${yearData.year}</td>
            <td class="px-6 py-3 text-sm text-gray-500">${formatCurrency(yearData.income)}</td>
            <td class="px-6 py-3 text-sm text-gray-500 has-tooltip">${formatCurrency(yearData.taxes)}<span class="tooltip-text">${taxTooltipText}</span></td>
            <td class="px-6 py-3 text-sm text-gray-500 has-tooltip">${formatCurrency(yearData.expenses)}<span class="tooltip-text">${expenseTooltipText}</span></td>
            <td class="px-6 py-3 text-sm text-gray-500 has-tooltip">${formatCurrency(yearData.savings)}<span class="tooltip-text">${savingsTooltipText}</span></td>
            <td class="px-6 py-3 text-sm text-gray-500">${eventsForYear}</td>
            <td class="px-6 py-3 text-sm text-gray-500 font-bold">${formatCurrency(yearData.netWorth)} ${milestoneIcon}</td>`;
        tableBody.appendChild(row);
    });
}

function renderCharts(state) {
    const netWorthCtx = document.getElementById('netWorthChart').getContext('2d');
    const yearlyFinancialsCtx = document.getElementById('yearlyFinancialsChart').getContext('2d');

    const labels = state.projection.map(p => p.age);
    if (netWorthChart) netWorthChart.destroy();
    if (yearlyFinancialsChart) yearlyFinancialsChart.destroy();

    netWorthChart = new Chart(netWorthCtx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Projected Net Worth', data: state.projection.map(p => p.netWorth), fill: true, tension: 0.1 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, x: {} } }
    });
    yearlyFinancialsChart = new Chart(yearlyFinancialsCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Taxes', data: state.projection.map(p => p.taxes), backgroundColor: '#ECC94B' },
                { label: 'Expenses', data: state.projection.map(p => p.expenses), backgroundColor: '#F56565' },
                { label: 'Savings', data: state.projection.map(p => p.savings), backgroundColor: '#48BB78' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    });
}

export function updateUI(state) {
    if (!state.isSetup) {
        showScreen('initial-screen');
        return;
    }
    runProjection(state);
    showScreen('main-dashboard');

    document.getElementById('current-net-worth').innerText = formatCurrency(state.initialData.netWorth);
    const projectedNetWorth = state.projection.find(p => p.age === state.initialData.retirementAge)?.netWorth || 0;
    document.getElementById('projected-net-worth').innerText = formatCurrency(projectedNetWorth);
    const savingsTarget = state.projection[0]?.savings || 0;
    document.getElementById('savings-target').innerText = formatCurrency(savingsTarget);

    const fiNumber = state.initialData.retirementExpenses / (state.initialData.safeWithdrawalRate / 100);
    document.getElementById('fi-number-display').innerText = formatCurrency(fiNumber);

    const fiAgeElement = document.getElementById('fi-age');
    const fiMessageElement = document.getElementById('fi-message');
    if (state.fiAge === null) {
        fiAgeElement.innerText = "Not projected";
        fiMessageElement.innerText = "You might not reach financial independence before your target retirement age.";
        fiAgeElement.classList.add('text-rose-600');
        fiAgeElement.classList.remove('text-green-600');
    } else {
        fiAgeElement.innerText = formatAge(state.fiAge);
        fiMessageElement.innerText = "When passive income covers expenses.";
        fiAgeElement.classList.remove('text-rose-600');
        fiAgeElement.classList.add('text-green-600');
    }

    const zeroAgeElement = document.getElementById('zero-age');
    const zeroAgeMessageElement = document.getElementById('zero-age-message');
    if (state.zeroAge === null) {
        zeroAgeElement.innerText = 'Beyond life expectancy';
        zeroAgeMessageElement.innerText = 'Your funds will last beyond your life expectancy.';
        zeroAgeElement.className = 'text-4xl font-bold text-green-600 mt-2';
    } else {
        zeroAgeElement.innerText = formatAge(state.zeroAge);
        zeroAgeMessageElement.innerText = 'Based on retirement spending.';
        zeroAgeElement.className = state.zeroAge < state.initialData.retirementAge ? 'text-4xl font-bold text-rose-600 mt-2' : 'text-4xl font-bold';
    }

    const retirementMessage = document.getElementById('retirement-message');
    if (projectedNetWorth < fiNumber) {
        retirementMessage.innerText = 'You are not on track to retire at your goal age.';
        retirementMessage.className = 'text-sm mt-2 font-medium text-rose-500';
    } else {
        retirementMessage.innerText = 'You are on track to retire at your goal age!';
        retirementMessage.className = 'text-sm mt-2 font-medium text-green-600';
    }

    renderLifeEvents(state);
    renderProjectionTable(state);
    renderCharts(state);
    updateChartColors(getChartInstances());
}