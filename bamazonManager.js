// •	Create a new Node application called bamazonManager.js. Running this application will:
// o	List a set of menu options:
// o	View Products for Sale
// o	View Low Inventory
// o	Add to Inventory
// o	Add New Product
// o	If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
// o	If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
// o	If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
// o	If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.


//node modules or npm packages installed
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

//establish SQL connectivity
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "Bamazon"
});

connection.connect(function(err){
	if (err) throw err;
	console.log("connected as: " + connection.threadID);
		managerOptions();
	});//close connection 


//manager has options to select from menu
//create function for managerOptions 
//the menu for what the manager wants to do will utilize switch and case that matches one of the choices
//The switch expression is evaluated once.
// The value of the expression is compared with the values of each case.
// If there is a match, the associated block of code is executed.

function managerOptions(){
 inquirer.prompt([
	      {
	      name: 'choice',
	      type: 'list',
	      message: 'Select from menu',
	      choices: ["View Products for Sale","View Low Inventory", "Add to Inventory", "Add New Product"]
	      } 
  ]).then(function(user){
	    console.log(user.choice);
	    switch(user.choice) {
	    	case "View Products for Sale":
	    		  viewProdForSale(function(){
	    		  managerOptions();
	    		  });
	    	break;

	    	case "View Low Inventory":
	    		  viewLowInventory(function(){
	    		  managerOptions();
	    		  });
	    	break;

	    	case "Add to Inventory":
	    		  addInventory();	    		  
	    	break;

	    	case "Add New Product":
	    		  addNewProduct();	    		  
	    	break;

	    	case 'Exit':
	              connection.end();
	        break; 

      	}
	    });
	}

//function to list out all items to the console, uses npm module cli-table. 
//It's the same function as listItems for the customer view.
//And uses same table schema as in the customer view.
function viewProdForSale(cb){

	console.log("================================== BAMAZON MANAGER ACCESS =====================================");
	 //create CLI-table, instantiate
	  var table = new Table({
	   	  head: ['ID Number', 'Product', 'Department', 'Price', 'Quantity Available']
	  });
	  //query SQL to get rows from the Products table
	  connection.query('SELECT * FROM Products', function(err, res){
	   	 if (err) throw err;
	    //add the rows to the cli-table
	   	 for (var i = 0; i < res.length; i++) {
	     	 table.push([res[i].itemID, res[i].productName, res[i].departmentName, '$' + res[i].price.toFixed(2), res[i].stockQuantity]);
	    	}
	    //log the table to the console
	   	 console.log(table.toString());
	    //callback the managerOption function to prompt the user want to go back to menu do anything else.
	    cb();
	    });
	  }

//view items with inventory count liwer than 5
function viewLowInventory(cb){

	 //query mysql database to retrieve rows with stockQuantity lower than 5
	 connection.query('SELECT * FROM Products WHERE stockQuantity < 5',
	 function(err, res){
	    if(err) throw err;
	    //if no items StockQuantity is less than 5 alert the user and run the callback function
	    if (res.length === 0) {
	      console.log('There are no items with low inventory.');
	      //callback the managerPrompt function to see if the user wants to do anything else
	      cb();
	    } else {
	      //if some items do have StockQuantity less than 5 create a table to show those items
	      var table = new Table({
	        head: ['ID Number', 'Product', 'Department', 'Price', 'Quantity Available']
	      });
	      for (var i = 0; i < res.length; i++) {
	        table.push([res[i].itemID, res[i].productName, res[i].departmentName, '$' + res[i].price.toFixed(2), res[i].stockQuantity]);
	      }
	      //log the table to the console
	      console.log(table.toString());
	      console.log('Low inventory items listed.');
	      //callback the managerPrompt function to see if the user wants to do anything else
	      cb();
	    }
	  });
	}



//function to add more inventory to items
	function addInventory(){
	  var items = [];
	  //query mysql database to get all ProductNames
	  connection.query('SELECT productName FROM Products', function(err, res){
	    if (err) throw err;
	    //push all the product names to the items array
	    for (var i = 0; i < res.length; i++) {
	      items.push(res[i].productName)
	    }
	    //ask the user which items from the items array they would like tp update inventory for
	    inquirer.prompt([
	      {
	      name: 'choices',
	      type: 'checkbox',
	      message: 'Which products are you adding inventory to?',
	      choices: items
	      }
	    ]).then(function(user){
	      //if the user doesn't select anything run the managerPrompt again to ask what they would like to do
	        if (user.choices.length === 0) {
	          console.log(' You did not select items to add inventory to.');
	          managerOptions();
	        } else {
	          //run the stockInventory function with the users choices as an argument
	          quantityInventory(user.choices);
	        }
	      });
	  });
	}

	//Prompt how much of each item to add to stockQuantity
	//expect an array of item names to edit quantity (arg)
	function quantityInventory(itemNames){
	//set the item to the first element of the array and remove that element from the array
	  var item = itemNames.shift();
	  var itemStock;
	  //query mysql to get the current stock quantity of the selected item
	  connection.query('SELECT stockQuantity FROM Products WHERE ?', {
	    productName: item
	  }, function(err, res){
	    if(err) throw err;
	    itemStock = res[0].stockQuantity;
	    itemStock = parseInt(itemStock)
	  });
	  //ask user how many of the selected item(s) to add to StockQuantity
	  inquirer.prompt([
	    {
	    name: 'amount',
	    type: 'text',
	    message: 'How many ' + item + ' would you like to add?',
	    //validate that the input is a number
	    validate: function(str){
	        if (isNaN(parseInt(str))) {
	          console.log('\nThat was not a valid number!');
	          return false;
	        } else {
	          return true;
	        }
	      }
	    }
	  ]).then(function(user){
	    var amount = user.amount
	    amount = parseInt(amount);
	    //update mysql database to reflect the new stockQuantity of item
	    connection.query('UPDATE Products SET ? WHERE ?', [
	    {
	      stockQuantity: itemStock += amount
	    },
	    {
	      productName: item
	    }], function(err){
	      if(err) throw err;
	    });
	    //create loop on the case there are other items in the itemNames array, run the quantityInventory function again
	    if (itemNames.length != 0) {
	        quantityInventory(itemNames);
	      } else {
	        //if there are no more items to be updated run the managerPrompt function again
	        console.log('Inventory updated.');
	        managerOptions();
	      }
	    });
	}



//add a new product to the Products table
	function addNewProduct(){
	  var departments = [];
	  //get all of the department names from Departments table
	  connection.query('SELECT departmentName FROM Departments', function(err, res){
	    if(err) throw err;
	    for (var i = 0; i < res.length; i++) {
	      departments.push(res[i].departmentName);
	    }
	  });

	  //prompt user info for the new product
	  inquirer.prompt([
	    {
	    name: 'item',
	    type: 'text',
	    message: 'Provide product name you would like to add.'
	    },
	    {
	    name: 'department',
	    type: 'list',
	    message: 'Provide department name. If not available, contact the Supervisor to add a department.',
	    choices: departments
	    },
	    {
	    name: 'price',
	    type: 'text',
	    message: 'Provide retail price of the item.'
	    },
	    {
	    name: 'stock',
	    type: 'text',
	    message: 'Provide the quantity now in stock.' 
	       }


	  ]).then(function(user){
	      //create an object with all of the items properties
	      var item = {
	        productName: user.item,
	        departmentName: user.department,
	        price: user.price,
	        stockQuantity: user.stock
	      }
	      //inset the new item into the mysql database
	      connection.query('INSERT INTO Products SET ?', item,
	      function(err){
	        if(err) throw err;
	        console.log(item.productName + ' has been added to the inventory.');
	        //run managerOptions function again to see what the user would like to do
	        managerOptions();
	      });
	    });
	}
