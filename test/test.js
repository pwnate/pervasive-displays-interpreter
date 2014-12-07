var test = require('tap').test
var fs = require('fs')
var PervasiveDisplaysInterpreter = require('../index.js')

var options = {
	screenSize : {
		height: 176,
		width: 264
	},
	updateArea : {
		height: 20,
		width: 80,
		xPos : 96,
		yPos : 244
	}
}

var pervDisp = new PervasiveDisplaysInterpreter(options)



test('need to write this test :-)', function (t) {
	fs.createReadStream('img.mono')
		.pipe(pervDisp)
		.pipe(fs.createWriteStream('imgout'))
})
