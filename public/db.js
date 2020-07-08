// let db;
// //indexedDB
// //open connection
// //create database
// // 2 arguments, name of database, version number
// // version gets updated when data schema changes
// const dbRequest = indexedDB.open("budget", 1);

// //fires the first time OR when version changes 
// // create collections here
// // object store = collections
// dbRequest.onupgradeneeded = event => {
//   console.log("Initializing the database...")
//   // console.log(event.target)
//   const db = event.target.result;

//   db.createObjectStore("pending", { autoIncrement: true })

//   // if you want to search/get by something other than ID
//   // const store = db.createObjectStore("pending", {autoIncrement: true});
//   // store.createIndex("name-of-index", "name of field you search by");
// }

// //always fires when connecting
// dbRequest.onsuccess = event => {
//   console.log(event.target.result)
//   const db = event.target.result;
//   if (navigator.onLine) {
//     checkDatabase();
//   }
//   console.log(`Successfully opened connection to indexedDB: ${db.name}`);
// }

// dbRequest.onerror = event => {
//   console.log(`Error opening connection to indexedDB: ${event.target.error}`);
// }


// function saveRecord(record) {

//   const transaction = db.transaction(["pending"], "readwrite");
//   const store = transaction.ObjectStore("pending");

//   store.add(record);
// }

// function checkDatabase() {

//   const transaction = db.transaction(["pending"], "readwrite");
//   const store = transaction.ObjectStore("pending");

//   const request = store.getAll();

  
//   request.onsuccess = function () {

//     if (request.result.length > 0) {
//       fetch("/api/transaction/bulk", {
//         method: "POST",
//         body: JSON.stringify(request.result),
//         headers: {
//           Accept: "application/json, text/plain, */*",
//           "Content-Type" : "application/json"
//         }
//       })
//         .then(response => response.json())
//         .then(() => {
//           const transaction = db.transaction(["pending"], "readwrite");
//           const store = transaction.ObjectStore("pending");
//           store.clear();
//         })
//     }
//   }
// }

// window.addEventListener("online", checkDatabase);










let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access your pending object store
  const store = transaction.objectStore("pending");

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // if successful, open a transaction on your pending db
        const transaction = db.transaction(["pending"], "readwrite");

        // access your pending object store
        const store = transaction.objectStore("pending");

        // clear all items in your store
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
