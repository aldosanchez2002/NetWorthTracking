// js/darkmode.js: Manages the light/dark mode functionality.

const darkModeState = {
    enabled: false,
    key: 'darkModeEnabled'
};

function applyDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    document.querySelectorAll('.light-icon').forEach(icon => {
        icon.classList.toggle('hidden', enabled);
    });
    document.querySelectorAll('.dark-icon').forEach(icon => {
        icon.classList.toggle('hidden', !enabled);
        icon.style.color = enabled ? '#6366F1' : ''; // Indigo-500 for moon in dark mode
    });
}

function toggleDarkMode(chartInstances) {
    darkModeState.enabled = !darkModeState.enabled;
    localStorage.setItem(darkModeState.key, darkModeState.enabled);
    applyDarkMode(darkModeState.enabled);
    updateChartColors(chartInstances); // Pass chart instances to update colors
}

function loadDarkMode() {
    const savedState = localStorage.getItem(darkModeState.key);
    darkModeState.enabled = savedState === 'true';
    applyDarkMode(darkModeState.enabled);
}

export function initializeDarkMode(chartInstances) {
    loadDarkMode();
    document.getElementById('initial-screen-dark-mode-toggle').addEventListener('click', () => toggleDarkMode(chartInstances));
    document.getElementById('dashboard-dark-mode-toggle').addEventListener('click', () => toggleDarkMode(chartInstances));
}

export function updateChartColors({ netWorthChart, yearlyFinancialsChart }) {
    if (netWorthChart) {
        const darkColor = '#667eea';
        const lightColor = '#4299E1';
        const gridColor = '#4a5568';
        const textColor = '#cbd5e0';

        netWorthChart.data.datasets[0].borderColor = darkModeState.enabled ? darkColor : lightColor;
        netWorthChart.data.datasets[0].backgroundColor = darkModeState.enabled ? 'rgba(102, 126, 234, 0.2)' : 'rgba(66, 153, 225, 0.2)';
        netWorthChart.options.scales.y.grid.color = darkModeState.enabled ? gridColor : '#E2E8F0';
        netWorthChart.options.scales.x.grid.color = darkModeState.enabled ? gridColor : '#E2E8F0';
        netWorthChart.options.scales.y.ticks.color = darkModeState.enabled ? textColor : '#6B7280';
        netWorthChart.options.scales.x.ticks.color = darkModeState.enabled ? textColor : '#6B7280';
        netWorthChart.update();
    }

    if (yearlyFinancialsChart) {
        yearlyFinancialsChart.options.scales.y.grid.color = darkModeState.enabled ? '#4a5568' : '#E2E8F0';
        yearlyFinancialsChart.options.scales.x.grid.color = darkModeState.enabled ? '#4a5568' : '#E2E8F0';
        yearlyFinancialsChart.options.scales.y.ticks.color = darkModeState.enabled ? '#cbd5e0' : '#6B7280';
        yearlyFinancialsChart.options.scales.x.ticks.color = darkModeState.enabled ? '#cbd5e0' : '#6B7280';
        yearlyFinancialsChart.update();
    }
}