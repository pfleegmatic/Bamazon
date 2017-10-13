
DROP DATABASE IF EXISTS Bamazon;

--Create a My SQL Database called bamazon.
CREATE DATABASE Bamazon;

Use Bamazon;


-- Create table called "products", to contain the store item inventory

CREATE TABLE Products (
	itemID INTEGER(10) AUTO_INCREMENT NOT NULL,
	productName VARCHAR(100) NOT NULL,
	departmentName VARCHAR(40) NOT NULL,
	price INTEGER(10) NOT NULL,
    stockQuantity INTEGER(10) NOT NULL,
	PRIMARY KEY (itemID)
);


--populate database with around 10 different products
--by insert "mock" data into the "products" table 
	INSERT INTO Products (productName, departmentName, price, stockQuantity)
	VALUES  ('Go Pro', 'Technology', 100.00, 100),
			('Airstream trailer', 'Home', 140000.25, 10),
			('Xtracycle Cargo Bike', 'Transportation', 599.00, 100),
			('Solo Wheel', 'Transportation', 399.00, 100),
			('DJ Mavic Pro', 'Technology', 800.00, 30),
			('Mitchells Grasshopper Pie (pint)', 'Grocery', 5.99, 200),
			('Watermelon', 'Produce', 2.75, 150),
			('Limes', 'Produce', 0.50, 2000),
			('Corona Beer', 'Recreation', 1.50, 2000),
			('Coleman cooler', 'Recreation', 99.00, 75),
			('Hammock', 'Recreation', 39.99, 30),
			('Fishing Kayak', 'Recreation', 729.95, 49),
			('Celestron 114EQ Telescope', 'Recreation', 199.99, 84);

			


CREATE TABLE Departments (
	    DepartmentID INTEGER(11) AUTO_INCREMENT NOT NULL,
	    departmentName VARCHAR(40) NOT NULL,
	    OverHeadCosts FLOAT(7, 2) NOT NULL,
	    TotalSales FLOAT(7, 2) NOT NULL,
	    PRIMARY KEY (DepartmentID)
	);
	
	INSERT INTO Departments (departmentName, OverHeadCosts, TotalSales)
	VALUES ('Technology', 12000, 0),
		   ('Transportation', 13000, 0),
	       ('Recreation', 2400, 0),
	       ('Home', 15000, 0),
	       ('Produce', 200, 0),
	       ('Grocery', 200, 0);
            





