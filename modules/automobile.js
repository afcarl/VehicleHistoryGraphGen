var Chance = require('chance');
var chance = new Chance();
var Moment = require('moment');
var Promise = require('bluebird');

exports.selectModel = function(db){
	return db.query('select from Model');
};

exports.writeAutomobile = function(db) {
	//Choose a random model to build from
	return db.query('select from Model')
		.then(function(models){
			var model = models[chance.integer({min: 0, max: Math.abs(models.length - 1)})];
			var colors = ['Blue', 'Light Blue', 'Brown', 'Beige', 'Burgandy', 'Maroon', 'Red', 'Green', 'Light Green', 'Dark Blue', 'Black', 'Silver', 'Yellow', 'Gray', 'White', 'Champagne', 'Dark Brown', 'Dark Gray', 'Aqua'];
			return Promise.all([db.insert().into('Automobile').set({
				color: colors[chance.integer({min:0, max: Math.abs(colors.length - 1)})],
				convertible: chance.bool(),
				emissions: chance.birthday({ year: chance.year({ min: model.modelYear, max: new Date().getFullYear() + 2})}).toISOString().substr(0,10),
				safety:    chance.birthday({ year: chance.year({ min: model.modelYear, max: new Date().getFullYear() + 2}) }).toISOString().substr(0,10),
				trailerHitch: chance.bool({likelihood: 20}),
				VIN: chance.hash({casing: 'upper'})
			}).one(), model]);
		})
		.then(function(data){
			//create the isModel edge
			return db.edge.from(data[0]['@rid'].toString()).to(data[1]['@rid'].toString()).create('isModel');
		})
};

exports.generateAutomobiles = function(howMany, db){
	var allAutomobiles = [];
	for(var i = 0; i < howMany; i++){
		allAutomobiles.push(this.writeAutomobile(db));
	}
	return Promise.all(allAutomobiles);
};