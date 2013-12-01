/// <reference path="matrixEditor.ts" />
/// <reference path="../typings/jquery.d.ts" />


// server proxy - used to call serverside methods
class ServerProxy {

    // save matrix
    saveMatrix(matrix: IMatrix) {

        // transform float values to integer
        // this values could be stored in short (16-bits) instead of float (32-bits)

        var getIntArrayFromMatrix = function (arg: number[][]) {
            var result = [];
            var l = arg.length;
            for (var i = 0; i < l; i++) {
                for (var j = 0; j < l; j++) {
                    result.push(Math.ceil(arg[i][j] * 10000));
                }
            }
            return result;
        };

        // ajax call
        // all data would be save at one moment
        $.ajax({
            url: '/Home/SaveMatrix',
            data: {                
                description: matrix.description,
                dimension: matrix.dimension,
                elements: getIntArrayFromMatrix(matrix.elements)
            },
            type: 'POST',
            traditional: true
        });
    }


    // delete matrix using matrixId
    deleteMatrix(matrixId: number) {
        $.ajax({
            url: '/Home/DeleteMatrix',
            data: { matrixId: matrixId },
            type: 'GET',
            traditional: true
        });
    }

    // get matrix list from server
    getMatrixList(callback: any) {
        $.ajax({
            url: '/Home/GetMatrixList',
            type: 'GET',
            traditional: true,
            success: function (data) { callback(data); }
        });
    }

    // get matrix elements.
    // matrixId - matrix identifier
    // lastLoadedIdx - index of last loaded element
    // callback - used to call some client code than data portion loaded
    getElements(matrixId: number, lastLoadedIdx: number, callback: any) {

        // we are store data in integer values
        // so we have to transform data to correct set [-1; 1]
        // 
        var normalizeData = function (data) {
            var l = data.length;
            for (var i = 0; i < l; i++) {
                data[i].value = data[i].value / 10000;
            }
            return data;
        }

        $.ajax({
            url: '/Home/GetElements',
            data: {
                matrixId: matrixId,
                lastLoadedIdx: lastLoadedIdx
            },
            type: 'GET',
            traditional: true,
            success: function (data) { callback(normalizeData(data)); }
        });
    }
}