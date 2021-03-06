var path = require('path');
var Dbf = require('../index').Dbf;
var expect = require('chai').expect;

describe('Dbf.js', function() {


	before(function(done) {

		this.timeout(1000 * 60 * 10);
		var downloads = [{
			url: 'https://copy.com/Y0KcopGoEBmfrFuT/Public/br.dbf.zip?download=1',
			name: 'br.dbf.zip',
			test: 'br.dbf'
		}];


		var each = require('each-async'),
		download = require('download'),
		fs = require('fs');

		each(downloads, function(down, index, next) {

			if (!fs.existsSync(path.join(__dirname, 'data',  down.test))) {
				console.log('Downloading %s', down.url);
				//new download(down, path.join(__dirname, 'data'), {extract: true}).on('close',next);
				new download({extract: true}).get(down.url).dest(path.join(__dirname, 'data')).run(function(err, files) {
					next(err);
				});
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
			expect(record.ID_OBJETO).to.equal(46007);
			expect(record.NOME).to.equal('Vassouras');
			done();
		}));
	});

	context('br.dbf', 'retrieve Lavras record', function(dbf, done) {

		dbf.get(3104, fix(function(err, record) {
			expect(err).to.not.exist;
			expect(record).to.be.eql({
				ID_OBJETO: 41462,
				NOME: "Lavras",
				GEOCODIGO: "3138203",
				GEOMETRIAA: "Não"
			});

			done();
		}));
	});


	context('br.dbf', 'error negative index', function(dbf, done) {
		dbf.get(-222, fix(function(err, record) {
			expect(record).to.not.exist;
			expect(err).to.be.instanceOf(RangeError);

			done();
		}));
	});

	context('br.dbf', 'error out of bound index', function(dbf, done) {
		dbf.get(1000 * 1000, fix(function(err, record) {
			expect(record).to.not.exist;
			expect(err).to.be.instanceOf(RangeError);

			done();
		}));
	});

	context('br.dbf', 'retrieve Sertãozinho', function(dbf, done) {
		dbf.get(4171, fix(function(err, record) {
			expect(err).to.not.exist;
			expect(record).to.be.eql({
				ID_OBJETO: 46632,
				NOME: "Sertãozinho",
				GEOCODIGO: "2515930",
				GEOMETRIAA: "Não"
			});

			done();
		}));
	});


	context('br.dbf', 'forEach', function(dbf, done) {

		var lastIndex = -1, count = 0;

		function iterator(record, index, next) {
			count++;

			expect(record).to.exist;
			expect(index).to.equal(lastIndex + 1);
			lastIndex = index;
			expect(next, 'Next must be a function!').to.be.an.instanceof(Function);
			next();
		}

		function end(err) {
			expect(count).to.equal(5566);
			expect(err).to.not.exist;
			done();
		}

		dbf.forEach(fix(iterator), fix(end));

	});

});