
// Create Node application bamazonCustomer.js. This application will:
// 1) Display all of the items available for sale.
// 2) Prompts users w/ 2 messages 
//		Ask them the ID of wproduct they would like to purchase.
// 		Asks how many units they would like to buy.

//3) After customer places order, the app should sheck if store has enough in inventory to meet the request.
// 		If there is not enough of the product in stock, it will tell the user "Insufficient quantity in stock".
//		Prevent order from going through
// 
//		If the store has enough, fill the customer's order
//		Update SQL database to reflect remaining (stock) quantity.
//		Once update goes through, show customer the total cost of their purchase
//  	It will also update the product sales in the department table.


//Create package.json
//Steps:
//cd into directory
//npm init
//name in and whatever
//is this ok? say y
//ls and see that package.json has been created
//npm install --save inquirer //this will appends stuff to package.json
//ls and node_modules inidicates 3rd party stuff is attached
//cat package.json to see what is in there
//run userprompt.js
//cat user prompt.js - to see what is in there already

//Installed packages:
//npm install inquirer
//npm install mysql
//npm install cli-table


//node modules or npm packages installed
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

//establish SQL connectivity
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "Impetus2Chaos#",
	database: "Bamazon"
});

//variables
var shoppingCart = [];
var totalCost = 0;

//connect  to run main function
//from the library, you can now get the connection id of a connection
//doesn't matter if "undefined", app won't run without this
connection.connect(function(err){
	if (err) throw err;
	console.log("connected as: " + connection.threadID);
	listItems(function() {
		//callback to user selecting items when prompted
		userSelectsItem();
	});//close listItems

});//close of connection

//function to list all items, 
//uses npm install cli-table
//instructions from https://www.npmjs.com/package/cli-table
//instantiate

//function to list out all items to the console, uses npm module cli-table
function listItems(cb){
	console.log("=============================== WELCOME TO BAMAZON! ===================================");
	 //create CLI-table, instantiate
	  var table = new Table({
	   	  head: ['ID Number', 'Product', 'Department', 'Price', 'Quantity Available']
	  });
	  //get all rows from the Products table
	  connection.query('SELECT * FROM Products', function(err, res){
	   	 if (err) throw err;
	    //add all of the rows to the cli-table
	   	 for (var i = 0; i < res.length; i++) {
	     	 table.push([res[i].itemID, res[i].productName, res[i].departmentName, '$' + res[i].price.toFixed(2), res[i].stockQuantity]);
	    	}
	    //log the table to the console
	   	 console.log(table.toString());
	    //callback the userSelectsItem function to prompt the user to add items to cart
	    cb();
	    });
	  }
	
//Create function to prompt users to add items to their cart
function userSelectsItem(){
	  var items = []; //array to 
	  //get all product names from the Products table
	  connection.query('SELECT productName FROM Products', function(err, res){
	   	 if (err) throw err;
	    //push all product names into the item array
	    for (var i = 0; i < res.length; i++) {
	      	items.push(res[i].productName)
	    	}
	    //prompt the user to select items from the items array
	 	 inquirer.prompt([
	      {
	      name: 'choices',
	      type: 'checkbox',
	      message: 'Add products to your cart. Navigate with arrow keys. Use Spacebar to select items. Press Enter to proceed to next steps.',
	      choices: items
	      }
	    ]).then(function(user){
	      //alert the user if they did not select anything and run function again
	      if (user.choices.length === 0) {
	        console.log('You didn\'t select any items.');
	        //if the user doesn't select anything ask if they want to keep shopping or leave
	  	 inquirer.prompt([
	          {
	          name: 'choice',
	          type: 'list',
	          message: 'Your cart is empty. Would you like to keep shopping or leave?',
	          choices: ['Keep Shopping', 'Leave']
	          }
	        ]).then(function(user){
	            //if user wants to keep shopping, list again the items and prompt the user to select items again
	            if (user.choice === 'Keep Shopping') {
	              	listItems(function(){
	                	userSelectsItem();
	              });
	            } else {
	              //if leave is selected exit the program
	              	console.log('Bye, thanks for visiting our site!');
	              		connection.end();
	            }
	        });
	      } else {
	        //run the howManyItems function with all of the items the user selected as an argument
	        howManyItems(user.choices)
	      }
	      });
	  });
	}
	



//function to prompt the user as to how many of each item they want
function howManyItems(itemNames){
	  //set item equal to the first element of the array and remove that element from the array
	  var item = itemNames.shift();
	  var itemStock;
	  var department;
	  //query mysql to get the current stock, price, and department of the item
	  connection.query('SELECT stockQuantity, price, departmentName FROM Products WHERE ?', {
	     productName: item
	 	 }, function(err, res){
	   		 if(err) throw err;
	   		 //set stock, price, and department in a variable
	    	itemStock = res[0].stockQuantity;
	 	    itemCost = res[0].price;
	  	    department = res[0].departmentName;
	  });
	  //prompt the user to ask how many of the item they would like
	 inquirer.prompt([
	    	{
	    	name: 'amount',
	    	type: 'text',
	    	message: 'How many ' + item + ' would you like to purchase?',
	   	   //validate user input is a number and quantity of item inputted is in stock
	   	   validate: function(str){
	       	   if (parseInt(str) <= itemStock) {
	       	   return true
	      	  } else {
	          //if not, let user know what inventory is, and ask for input again
	          console.log('There are only have ' + itemStock + ' in stock inventory.');
	          return false;
	        }
	      }
	    }
	  ]).then(function(user){
	    var amount = user.amount;
	    //create an object for the item and push it to the shoppingCart
	    shoppingCart.push({
	     	item: item,
	      	amount: amount,
	      	itemCost: itemCost,
	      	itemStock: itemStock,
	      	department: department,
	      	total: itemCost * amount
	    });
	    //if there are items remaining in the itemNames array, run the function again
	    if (itemNames.length != 0) {
	      howManyItems(itemNames);
	    } else {
	      //if no items remain in the itemNames array run checkout function
	      checkout();
	    }
	    });
	}
	
//function that allows user to edit shoppingCart before checkout and updating database
function checkout(){
	  //ensure there are items in the shoppingCart
	  if (shoppingCart.length != 0) {
	    var grandTotal = 0;
	    //show the user all of the items in their shoppingCart
	    console.log('===============CHECKOUT======================');
	    console.log('Here is your cart. Are you ready to checkout?');
	    for (var i = 0; i < shoppingCart.length; i++) {
	      var item = shoppingCart[i].item;
	      var amount = shoppingCart[i].amount;
	      var cost = shoppingCart[i].itemCost.toFixed(2);
	      var total = shoppingCart[i].total.toFixed(2);
	      var itemCost = cost * amount;
	      grandTotal += itemCost;
	      console.log(amount + ' ' + item + ' ' + '$' + total);
	    }
	    //show the total for the entire cart
	    console.log('Total: $' + grandTotal.toFixed(2));
	    //prompt the user if they are ready to checkout or need to edit the cart
	    inquirer.prompt([
	      {
	        name: 'checkout',
	        type: 'list',
	        message: 'Ready to checkout?',
	        choices: ['Checkout', 'Edit Cart']
	      }
	    ]).then(function(res){
	        //if the user is ready to checkout run the updateDB function to update database
	        if (res.checkout === 'Checkout') {
	            updateDB(grandTotal);
	        } else {
	          //if the user wants to edit the cart run the edit cart function
	          editCart();
	        }
	      });
	  } else {
	    //if the shoppingCart is empty alert the user and ask if they want to keep shopping or leave
	    inquirer.prompt([
	      {
	      name: 'choice',
	      type: 'list',
	      message: 'Your cart is empty. Would you like to keep shopping or leave?',
	      choices: ['Keep Shopping', 'Leave']
	      }
	    ]).then(function(user){
	        //if keep shopping is selected list the items and prompt the user to select items again
	        if (user.choice === 'Keep Shopping') {
	          listItems(function(){
	            userSelectsItem();
	          });
	        } else {
	          //if leave is selected exit the program
	          console.log('Bye, thanks for visitng our site.');
	          connection.end();
	        }
	    });
	
	  }
	}
	
	//function to update the mysql database, takes grandTotal as an argument since it has already been totalled in checkout function
function updateDB(grandTotal){
	  //set the item to the first object in the shoppingCart array and remove that object from the array
	  var item = shoppingCart.shift();
	  var itemName = item.item;
	  var itemCost = item.itemCost
	  var userPurchase = item.amount;
	  var department = item.department;
	  var departmentTransactionSale = itemCost * userPurchase;
	  //query mysql to get the current total sales for the applicable department
	  connection.query('SELECT TotalSales from Departments WHERE ?', {
	    departmentName: department
	  }, function(err, res){
	    var departmentTotalSales = res[0].TotalSales;
	    //update the department's TotalSales in the database
	    connection.query('UPDATE Departments SET ? WHERE ?', [
	    {
	      TotalSales: departmentTotalSales += departmentTransactionSale
	    },
	    {
	      departmentName: department
	    }], function(err){
	      if(err) throw err;
	    });
	  });
	  //query mysql to get the current stockQuantity of the item in case it has changed since the user has added the item to shoppingCart
	  connection.query('SELECT stockQuantity from Products WHERE ?', {
	    productName: itemName
	  }, function(err, res){
	    var currentStock = res[0].stockQuantity;
	    //update the stockQuantity in the database
	    connection.query('UPDATE Products SET ? WHERE ?', [
	    {
	      stockQuantity: currentStock -= userPurchase
	    },
	    {
	      productName: itemName
	    }], function(err){
	      if(err) throw err;
	      //if there are still items in the shoppingCart run the function again
	      if (shoppingCart.length != 0) {
	        updateDB(grandTotal);
	      } else {
	        //if no items remain in the shoppingCart alert the user of the total and exit
	        grandTotal = grandTotal.toFixed(2);
	        console.log('Thank you for shopping at Bamazon');
	        console.log('Your total today was $' + grandTotal);
	        connection.end();
	      }
	    });
	  });
	}
	
	//function to edit the shoppingCart
function editCart(){
	  //push all product names of the items in the shoppingCart to an array
	  var items = [];
	  for (var i = 0; i < shoppingCart.length; i++) {
	    var item = shoppingCart[i].item;
	    items.push(item);
	  }
	  //prompt the user to select which items from the array they would like to edit
	  inquirer.prompt([
	    {
	    name: 'choices',
	    type: 'checkbox',
	    message: 'Select items you would like to edit.',
	    choices: items
	    }
	  ]).then(function(user){
	      if (user.choices.length === 0) {
	        console.log('You did not select item(s) to edit');
	        checkout();
	      } else {
	        //run the editItem function and pass in the users selections as an argument
	        var itemsToEdit = user.choices;
	        editItem(itemsToEdit);
	      }
	  });
	}
	
	//function to edit individual items that the user selects to edit
function editItem(itemsToEdit){
	  //ensure that there are items to edit
	  if (itemsToEdit.length != 0) {
	    //set item to the first element in the array and remove that element from the array
	    var item = itemsToEdit.shift();
	    //ask the user if they would like to remove the item from the cart or edit the quantity
	    inquirer.prompt([
	      {
	      name: 'choice',
	      type: 'list',
	      message: 'Would you like to remove ' + item + ' from your cart entirely or change the quantity?',
	      choices: ['Remove From Cart', 'Change Quanity']
	      }
	    ]).then(function(user){
	        //if remove from cart is selected remove the item from the shoppingCart array
	        if (user.choice === 'Remove From Cart') {
	          for (var i = 0; i < shoppingCart.length; i++) {
	            if (shoppingCart[i].item === item) {
	              shoppingCart.splice(i, 1);
	              console.log('Updated');
	            }
	          }
	          //run the editItem function to check if there are more items to edit
	          editItem(itemsToEdit);
	        } else {
	          //if change quantity is selected ask the user what they would like to change the quantity to
	          inquirer.prompt([
	            {
	            name: 'amount',
	            type: 'text',
	            message: 'How many ' + item + ' would you like to purchase?',
	            }
	          ]).then(function(user){
	            //update the shoppingCart with the new quantity
	            for (var i = 0; i < shoppingCart.length; i++) {
	              if (shoppingCart[i].item === item) {
	                shoppingCart[i].amount = user.amount;
	                shoppingCart[i].total = shoppingCart[i].itemCost * user.amount;
	                console.log('Updated');
	              }
	            }
	            //run the editItem function to check if there are more items to edit
	            editItem(itemsToEdit);
	          });
	        }
	      });
	  } else {
	    //if no items remain to be edited run the checkout function
	    checkout();
	  }
	}
