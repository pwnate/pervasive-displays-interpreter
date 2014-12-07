pervasive-displays-interpreter
==============================

A Node module to take in a stream of bits representing image data and interpret it to send directly to a pervasive displays e-paper screen.

This module is able to write the device code to update only a section of the screen.

## Usage

```js
var pervDisp = require('pervasive-displays-interpreter')
var options = {
	screenSize : {
		height: 176,
		width: 264
	},
	updateSize : {
		height: 20,
		width: 80
	},
	updatePosition : {
		x : 96,
		y : 244,
	}
}

fs.createReadStream('img.mono')
  .pipe(pervDisp(options))
  .pipe(fs.createWriteStream('imgout'))
```
