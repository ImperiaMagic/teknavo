/*

Sample of correct string in loaded file:
"0.7234 0.9042 -0.8750 0.7114 -0.9701 -0.2390 0.4899 0.1632 0.8872 -0.9370";

*/


//returns random integere value in set [min; max]
function getRandomIntArbitary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

// returns random matrix
function getDataRandom() {
    var dimension = getRandomIntArbitary(1, 10);
	var result = new Array(dimension);
	for (var i=0; i<dimension; i++) {
		var row = new Array(dimension);
		for (var j=0; j<dimension; j++) {
			var v = Math.random();
			var sign = v > 0.5 ? 1 : -1;
			var value = Math.random() * sign;
			row[j] = value.toFixed(4);
		}
		result[i] = row;
	}
	return result;
}


// returns serie of values in matrix
function getDataSeries() {
	var dimension = 31;
	var result = new Array(dimension);
	var step = (1 - 1/(31*31)) / (31 * 31);
	var value = 0;
	for (var i=0; i<dimension; i++) {
		var row = new Array(dimension);
		for (var j=0; j<dimension; j++) {
			value += step;
			row[j] = value.toFixed(4);
		}
		result[i] = row;
	}
	return result;
}


// initialize some randome data
var data = getDataRandom();

// set matrix view options
var matrixViewControls = {
    fileLoader: "fileBtn",                 // hidden element to load files
    create: "createMatrixBtn",             // create matrix element 
    loadFromFile: "selectFileBtn",         // select file element 
    loadFromSite: "loadMatrixBtn",         // load matrix from site element 
    save: "saveMatrixBtn",                 // save matrix element 
    clear: "clearMatrixBtn",               // clear matrix element 
    del: "deleteMatrixBtn",                // delete matrix element 
    edit: "editMatrixBtn",                 // edit matrix element 
    collapse: "collapseBtn",               // collapse/expand matrix element 
    matrix: "matrixView",                  // matrix holder 
    editView: "editMatrixPropsView"        // dialogs holder 
};

var options = {
    controls: matrixViewControls,
    data: data
};

var matrixViewBuilder = new MatrixViewBuilder(options);
