var Promise = require('promise');

var Dbf = module.exports = function(fileName) {
	this._fileName = fileName;
};


Dbf.prototype.get = function(index, callback) {
	var self = this;
	this._ready(
		function(fd) {

		},
		function(err) {

		});
};


Dbf.prototype._ready = function(success, fail) {
	if (!this._readyPromise) {
		var self = this._fileName;

		this._readyPromise = new Promise(function(resolve, reject) {
			fs.open(self._readyPromise, 'r', function(err, fd) {
				if (!err)
					fs.read(fd, new Buffer(32), 0, 32, null, function(err, bytes, buffer) {
						if (!err)
							self._loadHeader(fd, bytes, buffer, resolve, reject);
						else
							reject(err);
					});
				else
					reject(err);
			});
		});
	}

	return this._readyPromise.then(success, fail);
};

Dbf.prototype.toString = function() {
	return 'DBF[' + this._fileName + ']';
};

Dbf.prototype._loadHeader = function(fd, bytes, buffer, resolve, reject) {
	if (bytes !== 32)
		reject(new RangeError(this + ' unexpect header length'));

	this._header = {
		version: buffer[0],
		hLength: buffer.readUInt16(8),
		rLength: buffer.readUInt16(10)
	};

	var self= this;
	fs.read(fd, new Buffer(this._header.hLength - 32), 0, this._header.hLength - 32, null, function(err, bytes, buffer) {
		if (!err)
			self._processFields(fd, bytes, buffer, resolve, reject);
		else
			reject(err);
	});
};

Dbf.prototype._processFields = function(fd, bytes, buffer, resolve, reject) {
	var fields = this._header.fields = [], field;
	for (var cursor = 0, l = this._header.hLength - 32; cursor < l; cursor += 32) {
		fields.push(field = {
			name: buffer.toString('ascii', cursor, cursor + 10),
			type: buffer[cursor + 11],
			length: buffer[cursor + 12],
			dCount: buffer[cursor + 13],
		});

		field.parse = PARSERS[field.type];
		if (!field.parse) {
			reject(new TypeError(this + ' unsupported Type' + field.type + '@' + field.name));
			return;
		}
	}

	resolve(fd);
};