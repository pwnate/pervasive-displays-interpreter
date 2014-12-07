var BlockStream = require('block-stream')


module.exports = function pervDisp (opts) {
	// do stuff with the options...I guess.
	// Test whether update area/position is outside of the screen range
 
	var chunkSize = Math.ceil(opts.updateArea.width/8)

	var f = new BlockStream(chunkSize, {nopad : true})

	var row = opts.updateArea.yPos

	f.on("data", function (data) {

		var displayRowData = new Buffer(Math.floor((opts.screenSize.width / 4) + (opts.screenSize.height / 4)))
		var shift = opts.updateArea.xPos % 8

		// if the updateArea position is not a multiple of 8, the buffer data needs to be shifted
		if (shift) {
			var tempData = new Buffer(data.length + 1)
			for (var i = 0; i < (data.length + 1); i++) {
				if (i == 0) {
					tempData[i] = data[i] >> shift
				} else if (i == data.length) {
					tempData[i] = data[i - 1] << (8 - shift)
				} else {
					tempData[i] = (data[i - 1] >> shift) | (data[i] << (8 - shift))
				}
			}
		} else {
			var tempData = data
		}

		//translate image data
		var bitIndex = 0
		for (var col = 0; col < (opts.screenSize.width / 8); col++) {
			var evenPixelByte = 0x00
			var oddPixelByte  = 0x00
			for (var bit = 0; bit < 8; bit++) {//working from left to right
				// only set pixels to black or white if they lie within the updateArea range
				if ((bitIndex >= opts.updateArea.xPos) && (bitIndex < (opts.updateArea.xPos + opts.updateArea.width))) {
					// the display expects the data for each line to be interlaced; all odd pixels, then all even pixels
					if (!(bit % 2)) {	// odd pixels (bit index is even)
						if (tempData[col - Math.floor(opts.updateArea.xPos / 8)] & (0x01 << (7 - bit))) {
							oddPixelByte = oddPixelByte | (0x03 << bit)
						} else {
							oddPixelByte = oddPixelByte | (0x02 << bit)
						}
					} else {			// even pixels (bit index is odd)
						if (tempData[col - Math.floor(opts.updateArea.xPos / 8)] & (0x01 << (7 - bit))) {
							evenPixelByte = evenPixelByte | (0x03 << (7 - bit))
						} else {
							evenPixelByte = evenPixelByte | (0x02 << (7 - bit))
						}
					}
				}
				bitIndex++
			}
			// the first (width * 3 / 16) bytes are odd pixels in descending order [D(263, y), D(261,y)...]
			displayRowData[(opts.screenSize.width / 8) - col - 1] = oddPixelByte

			// the last (width * 3 / 16) bytes are even pixels in ascending order
			displayRowData[(opts.screenSize.width / 8) + (opts.screenSize.height / 4) + col] = evenPixelByte
		}

		// (height / 4) bytes in the middle are "scan bytes" (for each line, "0b11" = write this line, "0b00" = don't write this line)
		for (var i = (opts.screenSize.width / 8); i < ((opts.screenSize.width / 8) + (opts.screenSize.height / 4)); i++) {
			if (i - (opts.screenSize.width / 8) == Math.floor(row / 4)) {
				displayRowData[i] = (0xC0 >> (2 * (row % 4)))
			} else {
				displayRowData[i] = 0x00
			}
		}

		row++

		data = displayRowData
	})

	f.on("end", function () {
		console.log("the end of the stream has been reached")
	})

	return f
}
