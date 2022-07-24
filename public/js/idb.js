//variable to hold db connection
let db;

//establish connection to IndexDB
const request = indexedDB.open('budget_tracker', 1);

//request object (if bd version changes)
request.onupgradeneeded = function(event) {
    //save reference to the database
    const db = event.target.result;

    //create an object store and set it to auto increment primary key
    db.createObjectStore('new_budget', {autoIncrement: true});
}

//upon success
request.onsuccess = function(event){
    //when db is successfully created with its object store
    //save reference to db in global variable
    db = event.target.result;

    //check if app is online, if yes run function to send all local db data to api
    if(navigator.online){
        uploadBudget();
    }
};

//if an error
request.onerror = function(event){
    //log error here
    console.log(event.target.errorCode);
};

//this function will be executed if we attempt to submit and there's no internet connection
function saveRecord(record){
    //open a new transaction with read/write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    //access the object store

    const budgetObjectStore = transaction.objectStore('new_budget');

    //add record to the store with add method
    budgetObjectStore.add(record)
}

//function to upload data 
function uploadBudget(){
    //open a transaction to the db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    //access the object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    //get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();

    //upon a successful .getAll(), run this function
    getAll.onsuccess = function() {
        //if there was data in the indexedDb's store, send it to the api server
        if (getAll.result.length > 0){
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message){
                    throw new Error(serverResponse)
                }

                //open one more transaction
                const transaction = db.transaction(['new_budget'], 'readwrite');
                //access the object store
                const budgetObjectStore = transaction.objectStore('new_budget');
                //clear all items in your store
                budgetObjectStore.clear();

                alert('All saved budgets have been submitted!')
            })
            .catch(err => {
                console.log(err)
            });
        };
    }
}

//listens to see if the browser has connected to the internet
window.addEventListener('online', uploadBudget);