bamazonSupervisor.js

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
