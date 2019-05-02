'use strict';

const request = require('supertest');
const ap = require('./app');
const authCallback = ap.authCallback,
	serial = ap.serial,
	deserial = ap.deserial,
	logout = ap.logout,
	details = ap.details,
	search = ap.search,
	passUse = ap.passUse;
const app = ap.app;


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

describe('Test the /logout', () => {

	test('GET /logout returns 302 to indicate it removed login session and redirected', () => {

		return request(app)
			.get('/logout')
			.expect(302);

	});

	let res = {sendStatus: jest.fn((inp) => inp)};
	let req = {
		session: { destroy: jest.fn((callback) => {

			callback('TEST_ERROR');

		})}
	};

	test('Test /logout error', async () => {

		await logout(req, res);
		expect(res.sendStatus.mock.calls.length).toEqual(1);

	});

});

describe('Test the /details', () => {

	test('GET /details returns 204 as no auth', () => {

		return request(app)
			.get('/details')
			.expect(204);

	});

	let req = {isAuthenticated: jest.fn( () => true), user: {
		user: {
			_json:{
				display_name: 'TEST_NAME', external_urls: {
					spotify: 'TEST_LINK'}
			}
		}
	}};
	let res = {status: jest.fn((inp) => inp), send: jest.fn((input) => input)};

	test('Test /details with simulating some details returns 200', async () => {

		await details(req, res);
		expect(res.status.mock.results[0].value).toEqual(200);

	});

	test('Test /details returns JSON type', async () => {

		await details(req, res);
		expect(typeof(res.send.mock.results[0].value)).toEqual('object');

	});

	test('Test /details with simulating some details returns "TEST_NAME"', async () => {

		await details(req, res);
		expect(res.send.mock.results[0].value['display_name']).toEqual('TEST_NAME');

	});

	test('Test /details with simulating some details returns "TEST_LINK"', async () => {

		await details(req, res);
		expect(res.send.mock.results[0].value['link']).toEqual('TEST_LINK');

	});

});

describe('Test the /search', () => {

	test('GET /search returns 500 to indicate there is no auth', () => {

		return request(app)
			.get('/search')
			.expect(500);

	});

	let req = {user: {accessToken: 'TEST_TOKEN', user : {country: 'TEST_COUNTRY'}}, get: jest.fn((inp) => {

		if (inp === 'text') {

			return 'TEST_SEARCH';

		} else if (inp === 'Type') {

			return 'TEST_TYPE';

		}

	})};
	let res = {status: jest.fn((inp) => inp), send: jest.fn((input) => input)};

	test('Test search function with mocking authentication sends status 200 to show it has run getHttp()', async () => {

		await search(req, res);
		expect(res.status.mock.results[0].value).toEqual(200);

	});

	test('Test search function with mocking authentication sends the error from getHttp() with invalid access token for 401', async () => {

		await search(req, res);
		expect(JSON.parse(res.send.mock.results[0].value).error.status).toEqual(401);

	});

	test('Test search function with mocking authentication sends the error from getHttp() with invalid access token with message "invalid access token"', async () => {

		await search(req, res);
		expect(JSON.parse(res.send.mock.results[0].value).error.message).toEqual('Invalid access token');

	});

});

describe('Test the login workflow', () => {

	test('GET /auth/spotify returns 302 to indicate there is a redirect', () => {

		return request(app)
			.get('/auth/spotify')
			.expect(302);

	});

	test('GET /auth/spotify/callback returns 302 to indicate redirect', () => {

		return request(app)
			.get('/auth/spotify/callback')
			.expect(302);

	});

});

// Got inspiration from https://stackoverflow.com/a/49143644

describe('Test the authCallback function', () => {

	test('Expect the redirect to be called once', async () => {

		let res = {
			redirect: jest.fn()
		};

		await authCallback(null, res);
		expect(res.redirect.mock.calls.length).toEqual(1);

	});

});

describe('Test the serial and deserial functions both work', () => {

	let done = jest.fn();

	test('Testing serial()', async () => {

		await serial(null, done);
		expect(done.mock.calls.length).toEqual(1);

	});

	test('Testing deserial()', async () => {

		await deserial(null, done);
		expect(done.mock.calls.length).toEqual(2);

	});

});

describe('Test the passport.use function', () => {

	let accessToken = 'TEST_ACCESS',
		refreshToken = 'TEST_REFRESH',
		expires_in = 'TEST_EXPIRES',
		profile = {user: 'TEST'},
		done = jest.fn((ignore, obj) => obj);

	test('Test that user profile is TEST', async () => {

		await passUse(accessToken, refreshToken, expires_in, profile, done);
		expect(done.mock.results[0].value['user']['user']).toEqual('TEST');

	});

	test('Test that accessToken is as expected', async () => {

		await passUse(accessToken, refreshToken, expires_in, profile, done);
		expect(done.mock.results[0].value['accessToken']).toEqual('TEST_ACCESS');

	});

	test('Test that refreshToken is as expected', async () => {

		await passUse(accessToken, refreshToken, expires_in, profile, done);
		expect(done.mock.results[0].value['refreshToken']).toEqual('TEST_REFRESH');

	});

});