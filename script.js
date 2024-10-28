let incomes = { pg1: [], pg2: [] };

// Initialize page and load incomes from localStorage
window.onload = function () {
    initializeMonthFilter();
    loadIncomes();
    displayIncomeTable();

    // Add event listeners to PG and month filters
    document.getElementById('pg').addEventListener('change', displayIncomeTable);
    document.getElementById('monthFilter').addEventListener('change', displayIncomeTable);
};

// Initialize the month filter dropdown
function initializeMonthFilter() {
    const monthFilter = document.getElementById('monthFilter');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthFilter.appendChild(option);
    });
}

// Handle form submission
document.getElementById('incomeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const pg = document.getElementById('pg').value;
    const name = document.getElementById('guestName').value;
    const room = document.getElementById('roomNumber').value;
    const rent = parseFloat(document.getElementById('rent').value);
    const electricBill = parseFloat(document.getElementById('electricBill').value);
    const commonBill = parseFloat(document.getElementById('commonBill').value);
    const utilities = parseFloat(document.getElementById('utilities').value);
    const date = document.getElementById('date').value;
    const month = document.getElementById('monthFilter').value;

    if (isNaN(electricBill) || isNaN(commonBill) || isNaN(rent) || isNaN(utilities) || electricBill < 0 || commonBill < 0 || rent < 0 || utilities < 0) {
        alert('Please enter valid amounts for bills and rent.');
        return;
    }

    const income = { name, room, electricBill, rent, commonBill, utilities, month, date };

    if (pg === 'PG 1') {
        incomes.pg1.push(income);
    } else if (pg === 'PG 2') {
        incomes.pg2.push(income);
    }

    saveIncomes();
    displayIncomeTable();
    document.getElementById('incomeForm').reset();
});

// Save incomes to localStorage
function saveIncomes() {
    localStorage.setItem('incomes', JSON.stringify(incomes));
}

// Load incomes from localStorage
function loadIncomes() {
    const savedIncomes = localStorage.getItem('incomes');
    if (savedIncomes) {
        incomes = JSON.parse(savedIncomes);
    }
}

// Display income table with Edit and Delete options
function displayIncomeTable() {
    const incomeTableContainer = document.getElementById('incomeTableContainer');
    const selectedPG = document.getElementById('pg').value;
    const selectedMonth = document.getElementById('monthFilter').value;

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Room</th>
                    <th>PG</th>
                    <th>Electric Bill</th>
                    <th>Common Bill</th>
                    <th>Rent</th>
                    <th>Utilities</th>
                    <th>Total Bill</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Filter data based on selected month and PG type
    let pgData = [];
    if (selectedPG === 'PG 1') {
        pgData = incomes.pg1.filter(income => income.month === selectedMonth);
    } else if (selectedPG === 'PG 2') {
        pgData = incomes.pg2.filter(income => income.month === selectedMonth);
    }

    // Display rows for each income entry with Edit and Delete buttons
    pgData.forEach((income, index) => {
        const electricBill = Number(income.electricBill || 0);
        const commonBill = Number(income.commonBill || 0);
        const rent = Number(income.rent || 0);
        const utilities = Number(income.utilities || 0);
        const totalBill = electricBill + commonBill + rent + utilities;

        tableHTML += `
            <tr>
                <td>${income.name}</td>
                <td>${income.room}</td>
                <td>${selectedPG}</td>
                <td>₹${electricBill.toFixed(2)}</td>
                <td>₹${commonBill.toFixed(2)}</td>
                <td>₹${rent.toFixed(2)}</td>
                <td>₹${utilities.toFixed(2)}</td>
                <td>₹${totalBill.toFixed(2)}</td>
                <td>${income.date}</td>
                <td>
                    <button onclick="editIncome('${selectedPG}', ${index})">Edit</button>
                    <button onclick="deleteIncome('${selectedPG}', ${index})">Delete</button>
                </td>
            </tr>
        `;
    });

    // Calculate and display total income for the selected PG type and month
    const totalIncome = pgData.reduce((sum, income) => 
        sum + Number(income.electricBill || 0) + Number(income.commonBill || 0) + Number(income.rent || 0) + Number(income.utilities || 0), 0);

    tableHTML += `
        <tr>
            <td colspan="8"><strong>Total Income ${selectedPG}</strong></td>
            <td colspan="2">₹${totalIncome.toFixed(2)}</td>
        </tr>
    `;

    tableHTML += `</tbody></table>`;
    incomeTableContainer.innerHTML = tableHTML;
}

// Edit income entry
// Edit income entry with validation

function getPgKey(pg) {
    return pg.replace(" ", "").toLowerCase();
}

function editIncome(pg, index) {
    const pgKey = getPgKey(pg); // Convert "PG 1" to "pg1"
    if (!incomes[pgKey]) {
        console.error(`Invalid PG value: ${pgKey}`);
        return;
    }

    const income = incomes[pgKey][index];
    document.getElementById('pg').value = pg;
    document.getElementById('guestName').value = income.name;
    document.getElementById('roomNumber').value = income.room;
    document.getElementById('rent').value = income.rent;
    document.getElementById('electricBill').value = income.electricBill;
    document.getElementById('commonBill').value = income.commonBill;
    document.getElementById('utilities').value = income.utilities;
    document.getElementById('date').value = income.date;
    document.getElementById('monthFilter').value = income.month;

    incomes[pgKey].splice(index, 1);
    saveIncomes();
}

function deleteIncome(pg, index) {
    const pgKey = getPgKey(pg);
    if (!incomes[pgKey]) {
        console.error(`Invalid PG value: ${pgKey}`);
        return;
    }

    if (confirm("Are you sure you want to delete this entry?")) {
        incomes[pgKey].splice(index, 1);
        saveIncomes();
        displayIncomeTable();
    }
}




function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Retrieve selected PG and month
    const selectedPG = document.getElementById('pg').value;
    const selectedMonth = document.getElementById('monthFilter').value;

    // Retrieve dynamic income data and filter by selected PG and month
    const incomes = JSON.parse(localStorage.getItem('incomes')) || { pg1: [], pg2: [] };
    const incomeData = incomes[selectedPG === 'PG 1' ? 'pg1' : 'pg2']
        .filter(income => income.month === selectedMonth)
        .map(income => ({
            ...income,
            totalIncome: (income.electricBill || 0) + (income.rent || 0) + (income.commonBill || 0) + (income.utilities || 0)
        }));

    // Calculate total income for the selected PG and month
    const totalIncome = incomeData.reduce((sum, income) => sum + income.totalIncome, 0);

    // Define colors based on PG type
    const headerColor = selectedPG === 'PG 1' ? [135, 206, 250] : [255, 140, 66]; // Blue for PG 1, Orange for PG 2
    const footerColor = selectedPG === 'PG 1' ? [70, 130, 180] : [255, 160, 87]; // Darker blue/orange for footer

    // Header with PG type and month
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // White text
    doc.setFillColor(...headerColor);
    doc.rect(0, 0, 210, 30, 'F'); // Full-width gradient header background

    doc.text(`Guest Income Report`, 14, 15);
    doc.setFontSize(12);
    doc.text(`PG: ${selectedPG} | Month: ${selectedMonth}`, 14, 25);

    // Define table columns
    const columns = [
        { header: 'Name', dataKey: 'name' },
        { header: 'Room', dataKey: 'room' },
        { header: 'Electric Bill', dataKey: 'electricBill' },
        { header: 'Rent', dataKey: 'rent' },
        { header: 'Common Bill', dataKey: 'commonBill' },
        { header: 'Utilities', dataKey: 'utilities' },
        { header: 'Date', dataKey: 'date' },
        { header: 'Month', dataKey: 'month' },
        { header: 'Total Income', dataKey: 'totalIncome' }
    ];

    // Generate table with dynamic data
    doc.autoTable({
        columns: columns,
        body: incomeData,
        startY: 40,
        theme: 'grid',
        styles: {
            fillColor: [255, 255, 255], // White for cell background
            textColor: 0, // Black text
            fontSize: 10
        },
        headStyles: {
            fillColor: headerColor, // Header color based on PG type
            textColor: [255, 255, 255] // White text for headers
        },
        didDrawPage: (data) => {
            // Total income footer
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(...footerColor);
            doc.rect(0, data.cursor.y + 10, 210, 10, 'F'); // Full-width footer background
            doc.text(`Total Income (${selectedPG}, ${selectedMonth}): ₹${totalIncome.toFixed(2)}`, 14, data.cursor.y + 18);
        }
    });

    // Save the PDF
    doc.save(`Guest_Income_Report_${selectedPG}_${selectedMonth}.pdf`);
}


function downloadCSV() {
    const incomeTable = document.getElementById('incomeTableContainer').getElementsByTagName('table')[0];
    let csvContent = "";
    
    // Get the headers
    Array.from(incomeTable.rows[0].cells).forEach(cell => {
        csvContent += cell.textContent + ",";
    });
    csvContent += "\n";

    // Get each row
    Array.from(incomeTable.rows).slice(1).forEach(row => {
        Array.from(row.cells).forEach(cell => {
            csvContent += cell.textContent + ",";
        });
        csvContent += "\n";
    });

    // Create a downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Income_Report.csv');
    a.click();
}
