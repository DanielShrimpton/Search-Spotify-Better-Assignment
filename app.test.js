'use strict';

const request = require('supertest');
const app = require('./app');


describe('Test the Home page', () => {

	test('GET / succeeds', () => {

		return request(app)
			.get('/')
			.expect(200);

	});

	test('GET / returns HTML', () => {

		return request(app)
			.get('/')
			.expect('Content-type', /html/);

	});

});


describe('Test the /details section', () => {

	test('GET /details succeeds', () => {

		return request(app)
			.get('/details')
			.expect(200);

	});

	test('GET /details return JSON', () => {

		return request(app)
			.get('/details')
			.expect('Content-type', /json/);

	});

	test('GET /details includes details', () => {

		return request(app)
			.get('/details')
			.expect(checkContent);

	});

});

/**
 * @param {*} res idk
 */
function checkContent(res) {

	const jContent = res.body;
	if (typeof jContent !== 'object') {

		throw new Error('not an object');

	}
	if (jContent['display_name']) {

		console.log(jContent['display_name']);

	} else {

		console.log(jContent['display_name']);
		throw new Error('display_name should be the user');

	}


}