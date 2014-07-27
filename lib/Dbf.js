var fs = require('fs'),
Promise = require('promise');

// http://www.clicketyclick.dk/databases/xbase/format/dbf.html
function Dbf(fileName) {

	this._fileName = fileName;
	var self = this;
	this._promise = new Promise(function(resolve, reject) {

		fs.open(fileName, 'r', function(err, fd) {
			if (err)
				reject(err);
			else {
				fs.read(fd, new Buffer(32), 0, 0x20, 0, function(err, bytes, buffer) {
					if (err)
						reject(err);
					else if (bytes === 0x20) {
						try {
							self._parse(fd, buffer, resolve, reject);
						} catch (e) {
							reject(e);
						}
					} else
						reject(new Error('Invalid file length'));
				});
			}
		});
	});

}

Dbf.prototype.get = function(index, callback) {
	var self = this;

	if (null == index) {
		callback(new Error('Invalid Index'));
		return;
	}

	this._promise.then(
		function() {
			try {
				self._get(index, function(err, record) {
					process.nextTick(function() {
						callback(err, record);
					});
				});
			} catch (e) {
				callback(e);
			}
		},
		function(err) {
			callback(err);
		}
	);
};

Dbf.prototype._get = function(index, callback) {
	if (index < 0 || index >= this._header.records)
		return callback(new RangeError('Invalid index'));

	var offset = this._header.headerLength + index * this._header.recordLength;

	var self = this;
	fs.read(this._fd, new Buffer(this._header.recordLength), 0, this._header.recordLength, offset, function(err, bytes, buffer) {
		if (err)
			callback(err);
		else {
			try {
				self._parseRecord(bytes, buffer, callback);
			} catch (e) {
				callback(e);
			}
		}
	});
};

Dbf.prototype._parse = function(fd, buffer, resolve, reject) {
	this._fd = fd;
	var header = {
		version: buffer.readUInt8(0),
		records: buffer.readUInt32LE(4),
		headerLength: buffer.readUInt16LE(8),
		recordLength: buffer.readUInt16LE(10),
		encryption: buffer.readUInt8(15)
	};

	if (header.recordLength <= 0)
		throw new Error('Invalid record length');

	if (header.records <= 0)
		throw new Error('Invalid number of records');

	var columns = header.columns = {}, self = this;

	function mkColumns(err, bytes, buffer) {
		if (bytes !== header.headerLength - 32)
			reject(new Error('Loading columns definitions error!'));
		else {
			var column, coffset = 1;
			for (var offset = 0; offset + 1 < buffer.length; offset += 0x20) {
				column = {
					name: buffer.toString('utf8', offset, offset + 10).replace(/\u0000+/, ''),
					type: String.fromCharCode(buffer[offset + 11]),
					length: buffer[offset + 16],
					offset: coffset
				};

				coffset += column.length;

				if (!READERS[column.type])
					return reject(new Error('Unsupported data type ' + column.type));
					
				column.read = READERS[column.type](column, buffer.slice(0, 0x20));

				columns[column.name] = column;
			}

			self._header = header;
			resolve(fd);
		}
	}

	fs.read(fd, new Buffer(header.headerLength - 32), 0, header.headerLength - 32, 0x20, function() {
		try {
			mkColumns.apply(this, arguments);
		} catch (e) {
			reject(e);
		}
	});

};

Dbf.prototype._parseRecord = function(bytes, buffer, callback) {

	if (bytes !== this._header.recordLength)
		callback(new Error('Loading record error'));
	else {
		var record = {}, column;
		for (var name in this._header.columns) {
			column = this._header.columns[name];
			record[name] = column.read(buffer, column);
		}

		try {
			callback(null, record);
		} catch (e) {
			// TODO: Something to do?
		}
	}

};


module.exports = Dbf;

var READERS = {
	C: function() {
		return STATIC_READERS.C;
	},

	N: function(column, buffer) {
		if (buffer[17]) {
			// decimal
			column.decimalCount = buffer[17];
		}
		return STATIC_READERS.N;
	}
};


var iconv = new require('iconv').Iconv('iso-8859-1', 'utf8');

var STATIC_READERS = {
	C: function(buffer, meta) {
		buffer = buffer.slice(meta.offset, meta.offset + meta.length);
		buffer = iconv.convert(buffer);
		return buffer.toString('utf8').replace(/\u0000+/, '').trim();
	},

	N: function(buffer, meta) {
		return parseFloat(buffer.toString('ascii', meta.offset,  meta.offset + meta.length));
	}
};