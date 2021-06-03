  // create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget-tracker' and set it to version 1
const request = indexedDB.open("budget_tracker", 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object store (table) called `budget_tracker`, set it to have an auto incrementing primary key of sorts
  db.createObjectStore("transactions", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadBudget() function to send all local db data to api
  if (navigator.onLine) {
    // we haven't created this yet, but we will soon, so let's comment it out for now
    // un-comment out?
    uploadBudget();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  const transaction = db.transaction(["transactions"], "readwrite");

  // access the object store for `budget_tracker`
  const budgetObjectStore = transaction.objectStore("transactions");

  // add record to your store with add method
  budgetObjectStore.add(record);
}

function uploadBudget() {
  // open a transaction on your db
  const transaction = db.transaction(["transactions"], "readwrite");

  // access your object store
  const budgetObjectStore = transaction.objectStore("transactions");

  // get all records from store and set to a variable
  const getAll = budgetObjectStore.getAll();

  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(["transactions"], "readwrite");
          // access the budget_tracker object store
          const budgetObjectStore = transaction.objectStore("transactions");
          // clear all items in your store
          budgetObjectStore.clear();

          alert("All saved budgets has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", uploadBudget);


































// let db;
// const request = indexedDB.open('budget_tracker', 1);

// request.onupgradeneeded = function (event) {
//     const db = event.target.result;
//     db.createObjectStore('new_budget', { autoIncrement: true });
// };

// request.onsuccess = function (event) {
//     db = event.target.result;
//     if (navigator.onLine) {
//         uploadBudget();
//     }
// };

// request.onerror = function (event) {
//     console.log(event.target.errorCode);
// };

// function saveRecord(record) {
//     const transaction = db.transaction(["new_budget"], "readwrite");
//     const budgetObjectStore = transaction.objectStore("new_budget");

//     budgetObjectStore.add(record);
//     alert('Budget will update when online.')
// }

// function uploadBudget() {
//     const transaction = db.transaction(['new_budget'], 'readwrite');
//     const budgetObjectStore = transaction.objectStore('new_budget');

//     const getAll = budgetObjectStore.getAll();

//     getAll.onsuccess = function () {
//         if (getAll.result.length > 0) {
//             fetch('/api/transaction', {
//                 method: 'POST',
//                 body: JSON.stringify(getAll.result),
//                 headers: {
//                     Accept: 'application/json, text/plain, */*',
//                     'Content-Type': 'application/json'
//                 }
//             })
//                 .then(response => response.json())
//                 .then(serverResponse => {
//                     if (serverResponse.message) {
//                         throw new Error(serverResponse);
//                     }

//                     const transaction = db.transaction(['new_budget'], 'readwrite');
//                     const budgetObjectStore = transaction.objectStore('new_budget');

//                     budgetObjectStore.clear();

//                     alert('Updated.');
//                 })
//                 .catch(err => {
//                     console.log(err);
//                 });
//         }
//     };
// }

// window.addEventListener('online', uploadBudget)






































