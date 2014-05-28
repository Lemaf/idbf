var path = require('path');

module.exports = {

	resolve: function(pathh) {
		return path.join(__dirname, pathh);
	}
};