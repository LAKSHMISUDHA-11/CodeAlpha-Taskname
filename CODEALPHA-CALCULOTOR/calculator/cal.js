const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');
const buttons = document.querySelectorAll('.btn');

let currentInput = '0';
let previousInput = '';
let activeOperator = null;
let shouldResetDisplay = false;

// Format numbers nicely, handles dynamic sizing hints implicitly via string length
function updateDisplay() {
    display.innerText = currentInput;
    
    // Dynamic Font Scaling for large numbers
    if (currentInput.length > 7) {
        display.style.fontSize = '2.2rem';
    } else if (currentInput.length > 11) {
        display.style.fontSize = '1.6rem';
    } else {
        display.style.fontSize = '3.5rem';
    }
}

function updateHistory(text) {
    historyDisplay.innerText = text;
}

function clearAll() {
    currentInput = '0';
    previousInput = '';
    activeOperator = null;
    shouldResetDisplay = false;
    updateHistory('');
    clearActiveOperatorStyles();
    updateDisplay();
}

function clearActiveOperatorStyles() {
    buttons.forEach(btn => btn.classList.remove('active'));
}

function handleDigit(digit) {
    if (shouldResetDisplay) {
        currentInput = digit;
        shouldResetDisplay = false;
    } else {
        currentInput = currentInput === '0' ? digit : currentInput + digit;
    }
    updateDisplay();
}

function handleDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0.';
        shouldResetDisplay = false;
        updateDisplay();
        return;
    }
    if (!currentInput.includes('.')) {
        currentInput += '.';
        updateDisplay();
    }
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);

    if (activeOperator && shouldResetDisplay) {
        activeOperator = nextOperator;
        updateHistory(`${previousInput} ${activeOperator}`);
        setActiveOperatorButton(nextOperator);
        return;
    }

    if (previousInput === '') {
        previousInput = currentInput;
    } else if (activeOperator) {
        const result = calculate(parseFloat(previousInput), inputValue, activeOperator);
        currentInput = String(result);
        previousInput = String(result);
        updateDisplay();
    }

    activeOperator = nextOperator;
    shouldResetDisplay = true;
    updateHistory(`${previousInput} ${activeOperator}`);
    setActiveOperatorButton(nextOperator);
}

function setActiveOperatorButton(op) {
    clearActiveOperatorStyles();
    const opButton = Array.from(buttons).find(btn => btn.getAttribute('data-operator') === op);
    if (opButton) opButton.classList.add('active');
}

function calculate(first, second, op) {
    if (op === '+') return first + second;
    if (op === '−' || op === '-') return first - second;
    if (op === '×' || op === '*') return first * second;
    if (op === '÷' || op === '/') {
        return second === 0 ? 'Error' : first / second;
    }
    return second;
}

function handleEvaluate() {
    if (!activeOperator || shouldResetDisplay) return;

    const first = parseFloat(previousInput);
    const second = parseFloat(currentInput);
    
    updateHistory(`${previousInput} ${activeOperator} ${currentInput} =`);
    
    const result = calculate(first, second, activeOperator);
    currentInput = String(result);
    previousInput = '';
    activeOperator = null;
    shouldResetDisplay = true;
    
    clearActiveOperatorStyles();
    updateDisplay();
}

function handlePercent() {
    currentInput = String(parseFloat(currentInput) / 100);
    updateDisplay();
}

function handleToggleSign() {
    currentInput = String(parseFloat(currentInput) * -1);
    updateDisplay();
}

function handleBackspace() {
    if (shouldResetDisplay) return;
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Click Event Listeners
buttons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('digit')) {
            if (button.dataset.action === 'decimal') {
                handleDecimal();
            } else {
                handleDigit(button.innerText);
            }
        } else if (button.classList.contains('operator')) {
            handleOperator(button.dataset.operator);
        } else if (button.id === 'equals') {
            handleEvaluate();
        } else {
            const action = button.dataset.action;
            if (action === 'clear') clearAll();
            if (action === 'percent') handlePercent();
            if (action === 'toggle-sign') handleToggleSign();
        }
    });
});

// Full Keyboard Support mapping
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
    if (e.key === '.') handleDecimal();
    if (e.key === 'Enter' || e.key === '=') handleEvaluate();
    if (e.key === 'Backspace') handleBackspace();
    if (e.key === 'Escape') clearAll();
    
    if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault(); // Prevents browser scroll on "/"
        let visualOp = e.key;
        if (e.key === '-') visualOp = '−';
        if (e.key === '*') visualOp = '×';
        if (e.key === '/') visualOp = '÷';
        handleOperator(visualOp);
    }
});