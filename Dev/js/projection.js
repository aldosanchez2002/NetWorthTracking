// js/projection.js: Handles the core financial calculation logic.

const TAX_BRACKETS = {
    single: [
        { rate: 0.10, min: 0, max: 11925 },
        { rate: 0.12, min: 11926, max: 48475 },
        { rate: 0.22, min: 48476, max: 103350 },
        { rate: 0.24, min: 103351, max: 197300 },
        { rate: 0.32, min: 197301, max: 250525 },
        { rate: 0.35, min: 250526, max: 626350 },
        { rate: 0.37, min: 626351, max: Infinity }
    ],
    married: [
        { rate: 0.10, min: 0, max: 23850 },
        { rate: 0.12, min: 23851, max: 96950 },
        { rate: 0.22, min: 96951, max: 206700 },
        { rate: 0.24, min: 206701, max: 394600 },
        { rate: 0.32, min: 394601, max: 501050 },
        { rate: 0.35, min: 501051, max: 751600 },
        { rate: 0.37, min: 751601, max: Infinity }
    ],
    headOfHousehold: [
        { rate: 0.10, min: 0, max: 17000 },
        { rate: 0.12, min: 17001, max: 64850 },
        { rate: 0.22, min: 64851, max: 103350 },
        { rate: 0.24, min: 103351, max: 197300 },
        { rate: 0.32, min: 197301, max: 250500 },
        { rate: 0.35, min: 250501, max: 626350 },
        { rate: 0.37, min: 626351, max: Infinity }
    ]
};

function calculateTax(income, filingStatus, customTaxRate) {
    if (filingStatus === 'custom') {
        return income * (customTaxRate / 100);
    }
    const brackets = TAX_BRACKETS[filingStatus];
    if (!brackets) return 0;

    let totalTax = 0;
    let remainingIncome = income;

    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;
        const taxableAmountInBracket = Math.min(remainingIncome, bracket.max - bracket.min + 1);
        totalTax += taxableAmountInBracket * bracket.rate;
        remainingIncome -= taxableAmountInBracket;
    }
    return totalTax;
};

export function runProjection(state) {
    const projection = [];
    let {
        netWorth,
        income,
        expenses,
        customTaxRate,
        taxFilingStatus,
        currentAge,
        annualIncomeIncrease,
        investmentReturnRate,
        inflationRate,
        safeWithdrawalRate,
        retirementAge,
        retirementExpenses,
        retirementIncome,
        lifeExpectancy
    } = state.initialData;

    let effectiveNetWorth = netWorth;
    let fiAge = null;
    let zeroAge = null;

    const incomeIncreaseRate = annualIncomeIncrease / 100;
    const investmentRate = investmentReturnRate / 100;
    const inflationRateDec = inflationRate / 100;
    const swrDecimal = safeWithdrawalRate / 100;

    const fiNumber = retirementExpenses / swrDecimal;

    const eventsByAge = state.lifeEvents.filter(e => e.id !== 'retirement').reduce((acc, event) => {
        if (!acc[event.startAge]) acc[event.startAge] = [];
        acc[event.startAge].push(event);
        return acc;
    }, {});

    for (let age = currentAge; age <= lifeExpectancy; age++) {
        const year = new Date().getFullYear() - currentAge + age;

        let baseIncome, baseExpenses;
        if (age < retirementAge) {
            baseIncome = income * Math.pow(1 + incomeIncreaseRate, age - currentAge);
            baseExpenses = expenses * Math.pow(1 + inflationRateDec, age - currentAge);
        } else {
            baseIncome = retirementIncome * Math.pow(1 + inflationRateDec, age - retirementAge);
            baseExpenses = retirementExpenses * Math.pow(1 + inflationRateDec, age - retirementAge);
        }

        let effectiveIncome = baseIncome;
        let effectiveExpenses = baseExpenses;
        let effectiveTaxRate = 0;
        if (taxFilingStatus === 'custom') {
            effectiveTaxRate = customTaxRate / 100;
        } else {
            effectiveTaxRate = baseIncome ? (calculateTax(baseIncome, taxFilingStatus, customTaxRate) / baseIncome) : 0;
        }
        let oneTimeExpense = 0;

        const eventsForThisYear = eventsByAge[age] || [];

        eventsForThisYear.forEach(event => {
            const eventDuration = (event.duration === null || event.duration === -1)
                ? (lifeExpectancy - event.startAge)
                : event.duration;
            if (age >= event.startAge && age < event.startAge + eventDuration) {
                if (event.changeType === 'income') {
                    if (event.operation === 'set') {
                        if (event.valueType === 'percent') {
                            effectiveIncome = baseIncome * (event.value / 100);
                        } else {
                            effectiveIncome = event.value;
                        }
                    } else { // 'change'
                        if (event.valueType === 'percent') {
                            effectiveIncome += baseIncome * (event.value / 100);
                        } else {
                            effectiveIncome += event.value;
                        }
                    }
                } else if (event.changeType === 'expenses') {
                    if (event.operation === 'set') {
                        effectiveExpenses = (event.valueType === 'percent')
                            ? (effectiveIncome - calculateTax(
                                effectiveIncome,
                                taxFilingStatus,
                                customTaxRate
                            )) * (event.value / 100)
                            : event.value;
                    } else { // 'change'
                        effectiveExpenses += (event.valueType === 'percent')
                            ? (effectiveIncome - calculateTax(
                                effectiveIncome,
                                taxFilingStatus,
                                customTaxRate
                            )) * (event.value / 100)
                            : event.value;
                    }
                } else if (event.changeType === 'taxRate') {
                    if (event.operation === 'set') {
                        effectiveTaxRate = event.value / 100;
                    } else {
                        effectiveTaxRate += event.value / 100;
                    }
                } else if (event.changeType === 'oneTimeExpense') {
                    oneTimeExpense += event.value;
                }
            }
        });

        const taxesPaid = (taxFilingStatus === 'custom') 
        ? effectiveIncome * effectiveTaxRate 
        : calculateTax(
            effectiveIncome, 
            taxFilingStatus, 
            customTaxRate
        );

        const netIncome = effectiveIncome - taxesPaid;
        const savings = netIncome - effectiveExpenses;
        const investmentGains = effectiveNetWorth * investmentRate;

        effectiveNetWorth = effectiveNetWorth + savings + investmentGains - oneTimeExpense;

        if (fiAge === null && effectiveNetWorth >= fiNumber && age < retirementAge) {
            fiAge = age;
        }
        if (zeroAge === null && age >= retirementAge && effectiveNetWorth <= 0) {
            zeroAge = age;
        }

        projection.push({
            year, 
            age, 
            income: effectiveIncome, 
            expenses: effectiveExpenses, 
            taxes: taxesPaid, 
            taxRate: effectiveTaxRate, 
            savings, oneTimeExpense, 
            netWorth: effectiveNetWorth
        });
    }

    state.projection = projection;
    state.fiAge = fiAge;
    state.zeroAge = zeroAge;
}