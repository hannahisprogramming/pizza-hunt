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
    //uploadPizza();
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