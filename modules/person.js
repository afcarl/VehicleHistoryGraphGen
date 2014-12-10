var Chance = require('chance');
var chance = new Chance();
var Moment = require('moment');
var Promise = require('bluebird');

exports.makePerson = function() {
	var gender = chance.bool() ? "Male" : "Female";
	var firstName = chance.first({gender: gender});
	var lastName = chance.last();
	personObj = {
		firstName: firstName,
		lastName: lastName,
		fullName: firstName + " " + lastName,
		birthday: Moment().subtract(chance.integer({min: 16, max: 88}), 'years').format('YYYY-MM-DD'),
		gender: gender
	};
	return personObj;
};

exports.personWrite = function(db){
	var person = this.makePerson();
	return db.insert().into('Person').set({
		firstName: person.firstName,
		lastName: person.lastName,
		fullName: person.fullName,
		gender: person.gender,
		birthday: person.birthday
	}).one();
};

exports.generatePeople = function(howMany, db){
	var allPeople = [];
	for(var i = 0; i < howMany; i++){
		allPeople.push(this.personWrite(db));
	}
	return Promise.all(allPeople)
};

exports.getRandomPerson = function(db){
	return db.query('SELECT FROM Person')
		.then(function(people){
			return Promise.resolve(people[chance.integer({min:0, max: Math.abs(people.length -1)})]);
		})
}