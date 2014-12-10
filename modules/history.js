var Chance = require('chance');
var chance = new Chance();
var Moment = require('moment');
var Promise = require('bluebird');
var moment = require('moment');
var maxTransactionDays = 9 * 365; // maximum number of days spread to choose an ownership term from

exports.selectModel = function(db){
	return db.query('select from Model');
};

exports.writeHistory = function(db, el) {
	var allPeople = [];
	return db.query('SELECT FROM Person')
		.then(function(people){
			allPeople = people;
			//make the first manufacturer transaction
			var query = 'SELECT out(isModel).out(isMake) FROM Automobile WHERE @rid = ' + el['@rid'].toString();
			var automobileId = el['@rid'].toString();
			return Promise.all([db.query(query), automobileId]);
		})
		.then(function(data){
			//get a random buyer
			var transactionParams = {
				sellerId: data[0][0].out[0].toString(),
				automobileId: data[1],
			};
			var Person = require('./person.js');
			return Promise.all([Person.getRandomPerson(db), transactionParams]);
		})
		.then(function(data){
			var transactionParams = data[1];
			transactionParams.buyerId = data[0]['@rid'].toString();
			//get the model year to set a believable start date
			return Promise.all([db.query('SELECT out(isModel).modelYear FROM Automobile WHERE @rid = ' + transactionParams.automobileId), transactionParams]);
		})
		.then(function(data){
			var txnParams =  data[1];
			var modelYear = data[0][0].out[0];
			txnParams.date = chance.birthday({year: chance.year({min: modelYear, max: modelYear + 5})});
			txnParams.price = chance.floating({min: 10000, max: 100000,fixed: 2});
			console.log('starting price: ' + txnParams.price);
			var transactions = [];
			var Transaction = require('./transaction.js');
			transactions.push(Transaction.createTransaction(db, txnParams.automobileId, txnParams.buyerId, txnParams.sellerId, txnParams.date, txnParams.price, chance.bool({likelihood: 80})));
			//build follow up transactions
			var currentTxnDate = moment(txnParams.date).add(chance.integer({min: 10, max:maxTransactionDays }), 'days');
			var buyer;
			var seller = txnParams.buyerId;
			var price = txnParams.price;

			while(currentTxnDate < new Date()){
				//Math.round(num * 100) / 100
				price = Math.round((price * chance.floating({min: 0.50, max:.99})) * 100) / 100;
				buyer = allPeople[chance.integer({min: 0, max: Math.abs(allPeople.length -1)})]['@rid'].toString();
				transactions.push(Transaction.createTransaction(db, txnParams.automobileId, buyer, seller, currentTxnDate._d, price, chance.bool({likelihood: 80})));
				seller = buyer;
				currentTxnDate.add(chance.integer({min: 10, max:maxTransactionDays }), 'days');
			}

			return Promise.all(transactions);
		})
};

exports.generateHistories = function(db){
	var allHistories = [];
	return db.query('select from Automobile')
		.then(function(automobiles){
			automobiles.forEach(function(el){
				allHistories.push(exports.writeHistory(db, el));
			})
			return Promise.all(allHistories);
		})
};