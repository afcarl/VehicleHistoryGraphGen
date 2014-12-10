var Chance = require('chance');
var chance = new Chance();
var Promise = require('bluebird');

exports.createTransaction = function(db, automobile, buyer, seller, date, price, certified){
	return db.insert().into('Transaction').set({
		date: date.toISOString().substr(0,10),
		price: price,
		certified: certified,
		bookValue: price - chance.integer({min: 0, max: Math.abs(price - 2000)})
	}).one()
		.then(function(txn){
			//create the Bought edge
			return Promise.all([
				db.edge.from(buyer).to(txn).create('Bought'),
				db.edge.from(seller).to(txn).create('Sold'),
				db.edge.from(automobile).to(txn).create('Purchased')
			])
		})
};