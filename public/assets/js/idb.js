//create var to hold db connection
let db;
//establish connection to indexeddb db called pizzahunt and set it to version 1
const request = indexedDB.open('pizza-hunt', 1);

request.onupgradeneeded = function(event) {
  //save ref to db
  const db = event.target.result;
  //create object store, auto incrementing primary key
  db.createObjectStore('new_pizza', {autoIncrement: true});
}

//upon successful connection
request.onsuccess = function(event) {
  //save ref to db in global var now that its created
  db = event.target.result;

  //check if app is online, if yes call uploadPizza
  if(navigator.onLine) {
    uploadPizza();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

//executed if attempt to create new pizza w no internet connection
function saveRecord(record) {
  //open new transaction w db w read&write permissions
  const transaction = db.transaction(['new_pizza'], 'readwrite');

  //access object store for new pizza
  const pizzaObjectStore = transaction.objectStore('new_pizza');

  //add record to your store w add method
  pizzaObjectStore.add(record);
}

function uploadPizza() {
  //open db transaction
  const transaction = db.transaction(['new_pizza'], 'readwrite');
  
  //access your objt store
  const pizzaObjectStore = transaction.objectStore('new_pizza');

  //get all record from store
  const getAll = pizzaObjectStore.getAll();

  //upon successful getall, run this
  getAll.onsuccess = function() {
    //if data, send to api server
    if(getAll.result.length > 0) {
      fetch('/api/pizzas', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_pizza'], 'readwrite');
          // access the new_pizza object store
          const pizzaObjectStore = transaction.objectStore('new_pizza');
          // clear all items in your store
          pizzaObjectStore.clear();

          alert('All saved pizza has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    } 
  }
}

//listen for app coming back online
window.addEventListener('online', uploadPizza);