const readline = require('readline');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const DATA_FILE = 'account_data.json';
const CSV_FILE = 'transactions.csv';
const TXT_FILE = 'transactions.txt';

// Initialize data storage
let balance = 0;
let transactions = [];

// Load existing data if available
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    balance = data.balance;
    transactions = data.transactions;
  }
}

// Save data to JSON, CSV, and text files
function saveData() {
  // Save to JSON file
  const data = { balance, transactions };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // Save to CSV
  csvWriter.writeRecords(transactions)
    .then(() => console.log('Transactions saved to transactions.csv'));

  // Save to text file
  const summary = transactions.map(t => `${t.date} - ${t.type}: ₱${t.amount} (${t.description})`).join('\n');
  fs.writeFileSync(TXT_FILE, summary);
}

// Initialize CSV writer
const csvWriter = createCsvWriter({
  path: CSV_FILE,
  header: [
    { id: 'type', title: 'Type' },
    { id: 'amount', title: 'Amount' },
    { id: 'description', title: 'Description' },
    { id: 'date', title: 'Date' }
  ]
});

// Create interface for command input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to format and save transaction
function addTransaction(type, amount, description) {
  const date = new Date().toLocaleString();
  const transaction = { type, amount, description, date };

  transactions.push(transaction);
  if (type === 'Cash-In') {
    balance += amount;
  } else if (type === 'Cash-Out') {
    balance -= amount;
  }

  saveData();
}

// Function to display account statement
function viewAccountStatement() {
  console.log("\nAccount Statement:");
  console.table(transactions);
  console.log(`Current Balance: ₱${balance.toFixed(2)}`);
  console.log("\ndeveloper: Rai Gelverio");
}

// Function to reset account
function resetAccount() {
  balance = 0;
  transactions = [];
  saveData();
  console.log("Account has been reset.");
}

// Start listening for commands
console.log("Commands: 'cash-in <amount> <description>', 'cash-out <amount> <description>', 'view-account-statement', 'reset-account', 'exit'.");

loadData();

rl.on('line', (input) => {
  const [command, amountStr, ...descArr] = input.split(" ");
  const description = descArr.join(" ");
  const amount = parseFloat(amountStr);

  if (command === 'cash-in' && !isNaN(amount) && description) {
    addTransaction('Cash-In', amount, description);
    console.log(`Cash-In: ₱${amount} - ${description}`);
  } else if (command === 'cash-out' && !isNaN(amount) && description) {
    addTransaction('Cash-Out', amount, description);
    console.log(`Cash-Out: ₱${amount} - ${description}`);
  } else if (command === 'view-account-statement') {
    viewAccountStatement();
  } else if (command === 'reset-account') {
    resetAccount();
  } else if (command === 'exit') {
    rl.close();
    viewAccountStatement();
  } else {
    console.log("Invalid command. Please try again.");
  }
});

rl.on('close', () => {
  console.log("Exiting and saving data...");
});
