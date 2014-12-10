var Chance = require('chance');
var chance = new Chance();
var Moment = require('moment');
var Promise = require('bluebird');
var AutoData = require('./data.js');

exports.makeModel = function() {
	return AutoData.data[chance.integer({min: 0, max: AutoData.data.length})];
};

exports.modelWrite = function(db){
	var model = this.makeModel();
	//insert the make if not existing
	return db.query('UPDATE Make SET name = :make RETURN AFTER UPSERT WHERE name = :make', {
		params: {
			make: model.make
		}
	})
		.then(function(make){
			//write the model
			return Promise.all([db.insert().into('Model').set({
				name: model.model,
				cylinders: model.cylinders,
				displacement: model.displ,
				drive: model.drive,
				fuelCost: model.fuelCost,
				fuelType: model.fuelType,
				transmission: model.trany,
				cityMPG: model.UCity,
				highwayMPG: model.UHighway,
				modelYear: model.year
			}).one(), make[0]]);
		})
		.then(function(data){
			//create the isMake edge from model
			return db.edge.from(data[0]['@rid'].toString()).to(data[1]['@rid'].toString()).create('isMake');
		})
};

exports.generateModels = function(howMany, db){
	var allModels = [];
	for(var i = 0; i < howMany; i++){
		allModels.push(this.modelWrite(db));
	}
	return Promise.all(allModels);
};