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


describe('Test the /details', () => {

	test('GET /details returns 204 as no auth', () => {

		return request(app)
			.get('/details')
			.expect(204);

	});

});

describe('Test the /logout', () => {

	test('GET /logout returns 200 to indicate it removed login session', () => {

		return request(app)
			.get('/logout')
			.expect(200);

	});

});

describe('Test the /search', () => {

	test('GET /search returns 500 to indicate there is no auth', () => {

		return request(app)
			.get('/search')
			.expect(500);

	});

});

describe('Test the login workflow', () => {

	test('GET /auth/spotify returns 302 to indicate there is a redirect', () => {

		return request(app)
			.get('/auth/spotify')
			.expect(302);

	});

	test('GET /auth/spotify location is correct', () => {

		return request(app)
			.get('/auth/spotify')
			.expect('Location', 'https://accounts.spotify.com/authorize?show_dialog=true&response_type=code&redirect_uri=https%3A%2F%2Fsearch-spotify-better.herokuapp.com%2Fauth%2Fspotify%2Fcallback&scope=user-read-email%20user-read-private&client_id=8f456770a0c5460eaff16e6476344bc5');

	});

	test('GET /auth/spotify/callback returns 302 to indicate redirect', () => {

		return request(app)
			.get('/auth/spotify/callback')
			.expect(302);

	});

	test('GET /auth/spotify/callback location is correct', () => {

		return request(app)
			.get('/auth/spotify/callback')
			.expect('location', 'https://accounts.spotify.com/authorize?response_type=code&redirect_uri=https%3A%2F%2Fsearch-spotify-better.herokuapp.com%2Fauth%2Fspotify%2Fcallback&client_id=8f456770a0c5460eaff16e6476344bc5');

	});

});