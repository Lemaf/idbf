var download = require('./download');
var resolve = require('./util').resolve;
var expect = require('expect.js');

var Dbf = require('../Dbf');

describe('dbf n-th reader', function() {

	this.timeout(0);

	before(function(done) {


		console.log(resolve('data'));

		download(
			[
				'https://copy.com/yzHc6aQO76ko/shp.js/br.dbf.zip?download=1'
			],
			resolve('data'),
			true
		).on('ready', function() {
			done();
		});

	});


	describe('should', function() {


		it('get 42 record', function(done) {

			var dbf = new Dbf(resolve('data/br.dbf/br.dbf'));

			dbf.get(42, function(err, record) {
				expect(err).to.ok();
				done();
			});

		});

	});

});