var path = require('path');
var Dbf = require('../index').Dbf;
var expect = require('chai').expect;

describe('Dbf.js', function() {


	before(function(done) {

		this.timeout(1000 * 60 * 10);
		var downloads = [{
			url: 'https://copy.com/yzHc6aQO76ko/shp.js/br.mg.dbf.zip?download=1',
			name: 'br.mg.dbf.zip',
			test: 'br.mg.dbf'
		}, {
			url: 'https://copy.com/yzHc6aQO76ko/shp.js/br.sp.dbf.zip?download=1',
			name: 'br.sp.dbf.zip',
			test: 'br.sp.dbf'
		}, {
			url: 'https://copy.com/yzHc6aQO76ko/shp.js/br.dbf.zip?download=1',
			name: 'br.dbf.zip',
			test: 'br.dbf'
		}];


		var each = require('each-async'),
		download = require('download'),
		fs = require('fs');

		each(downloads, function(down, index, next) {

			if (!fs.existsSync(path.join(__dirname, 'data',  down.test))) {
				console.log('Downloading %s', down.url);
				download(down, path.join(__dirname, 'data'), {extract: true}).on('close',next);
			}
			else
				next();
		}, done);

	});

	function context(file, message, fn) {

		it(file + ' - ' + message, function(done) {
			var dbf = new Dbf(path.join(__dirname, 'data', file));

			fn.call(this, dbf, done);
		});

	}


	function fix(fn) {
		return function() {
			var self = this;
			var args = Array.prototype.slice.call(arguments);
			process.nextTick(function() {
				fn.apply(self, args);
			});
		};
	}


	context('br.dbf', 'retrieve 42th record', function(dbf, done) {
		dbf.get(42, fix(function(err, record) {
			expect(err).to.not.exist;
			expect(record).to.exist;
			expect(record.ID_OBJETO).to.eql(46007);
			expect(record.NOME).to.eql('Vassouras');
			done();
		}));
	});

});