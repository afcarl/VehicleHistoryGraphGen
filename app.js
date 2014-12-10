//Modules
var Oriento = require('oriento');
var Moment = require('moment');
var Promise = require('bluebird');

//Settings
var totalPeople = 2000;
var totalModels = 500;
var totalAutomobiles = 200;

var server = Oriento({
	host: 'localhost',
	port: 2424,
	username: 'root',
	password: 'hello'
});

var db = server.use({
	name: 'VehicleHistoryGraph',
	username: 'admin',
	password: 'admin'
});

var Person = require('./modules/person.js');

//begin generating data
//generate people
Person.generatePeople(totalPeople, db)
	.then(function(people){
		//generate modeles / makes
		var Model = require('./modules/model.js');
		return Model.generateModels(totalModels, db);
	})
	.then(function(models){
		//generate automobiles
		var Automobile = require('./modules/automobile.js');
		return Automobile.generateAutomobiles(totalAutomobiles, db);
	})
	.then(function(automobiles){
		//create an ownership history for each automobile
		var History = require('./modules/history.js');
		return History.generateHistories(db)
			.then(function(){
				console.log('Data has finished generating');
				process.exit(code = 0);
			})
	})

<<<<<<< HEAD


=======
>>>>>>> 4054ff018ce233b6d1fd1a56b102f90aea8f7aa1

	//Manufacturer purchase
	//subsequent randomized purchases
