/// <reference path="tableBuilder.ts" />
/// <reference path="serverProxy.ts" />

interface IMatrix {
    dimension: number;
    description: string;
    elements: any[][];
}


// implements matrix create/update/delete/load logic
class MatrixEditor {

    matrixParent: HTMLElement; // reference to parent div
    tableElement: HTMLTableElement;
    matrix: IMatrix; // current matrix data
    collapsed: boolean; //
    currentSelectedValue: any;
    topLeftCellId: string; 
    tableBuilder: TableBuilder;

    constructor(public parentElement, public serverProxy: ServerProxy, public deleteBtn) {
        this.matrixParent = document.getElementById(parentElement);
        this.collapsed = false;
        this.topLeftCellId = "topLeftCell";
    }

    init(matrix: IMatrix) {
        this.matrix = matrix;
        this.remove();
        this.tableBuilder = new TableBuilder(matrix.dimension, this.parentElement, this);
        for (var i=0; i<matrix.dimension; i++ ) {
            for (var j = 0; j < matrix.dimension; j++) {
                var value = matrix.elements == null ? 0 : parseFloat(<any>matrix.elements[i][j]);
                this.tableBuilder.addCell(value);
            }
        }
    }

    // used to clear data in view
    remove() {
        var children = this.matrixParent.childNodes;
        while(children.length) {
            this.matrixParent.removeChild(children[0])
        }
    }

    // Collapse/Expand button handler
    collapseHandler (e) {
        if (!this.collapsed) {
            var elements = document.getElementsByTagName('td');
            var l = elements.length;
            for (var i=0; i<l; i++) {
                var element = elements[i];
                (<any>element).innerText = "";
            }
            this.collapsed = true;
        } else {
            var l = this.matrix.elements.length;
            for (var i = 0; i < l; i++) {
                for (var j = 0; j < l; j++) {
                    var value = <any>this.matrix.elements[i][j];
                    if (typeof value === "string") {
                        value = parseFloat(value).toFixed(4);
                    } else {
                        value = value.toFixed(4);
                    }
                    document.getElementById(this.getCellId(i+1, j+1)).innerText = value;
                }
            }
            this.collapsed = false;
        }
    }

    // handler for file select event
    loadFileHandler (event, file) {

        var context = this;
        var description = "Loaded from file (" + file.name + ")";
        var callback = function(fileString) {
            var data = context.getDataFromFileString(fileString)
            context.init({ elements: data, dimension: data.length, description: description });
        };

        var reader = new FileReader();

        reader.readAsText(file, "UTF-8");

        reader.onload = function loaded(evt) {
            var fileString = evt.target.result;
            callback(fileString);
        }
    }

    // convert data loaded from file to matrix array
    getDataFromFileString(fileString) {
        var data = fileString.split(/\r?\n+/);
        var result = [];
        var l = data.length;
        for (var i=0; i<l; i++) {
            var row = data[i].split(" ");
            for (var j = 0; j < l; j++) {
                row[j] = parseFloat(row[j]);
            }
            result.push(row);
        }
        return result;
    }

    getCellId(rowIdx, colIdx) {
        return "id" + rowIdx + "_" + colIdx;
    }

    clearValues() {
        var l = this.matrix.elements.length;
        for (var i=0; i<l; i++) {
            for (var j=0; j<l; j++) {
                this.matrix.elements[i][j] = 0;
            }
        }
        this.init(this.matrix);
    }

    update(matrix: IMatrix) {

        this.matrix.description = matrix.description;

        var oldValue = typeof this.matrix.dimension === "string" ? parseInt(this.matrix.dimension.toString()) : <number>this.matrix.dimension;
        var newValue = typeof matrix.dimension === "string" ? parseInt(matrix.dimension.toString()) : <number>matrix.dimension;
        if (newValue == this.matrix.dimension) {return; }
        if (newValue < this.matrix.dimension) {
            (<any>this.tableBuilder).reduceDimension(newValue);
        } else {
            this.increaseDimension(newValue);
            this.init(this.matrix);
        }
    }

    // increase matrix dimension
    increaseDimension(newValue) {
        for (var i = 0; i < newValue; i++) {
            var colStart = this.matrix.dimension;
            if (i >= this.matrix.dimension) {
                this.matrix.elements.push([]);
                colStart = 0;
            }
            for (var j = colStart; j < newValue; j++) {
                this.matrix.elements[i].push(0);
            }
        }
        this.matrix.dimension = newValue;
    }


    loadMatrixFromSite(matrix: IMatrix) {
        this.matrix = matrix;
        this.remove();
        this.tableBuilder = new TableBuilder(matrix.dimension, this.parentElement, this);

        var context = this;
        var callback = function (data) {
            for (var i = 0; i < data.length; i++) {
                context.tableBuilder.addCell(data[i].value, true);
            }
            var lastAddedCell = context.tableBuilder.lastAddedCell;
            var lastIdx = (lastAddedCell.row - 1) * matrix.dimension + lastAddedCell.col;
            if (lastIdx < matrix.dimension * matrix.dimension) {
                context.serverProxy.getElements((<any>matrix).matrixId, lastIdx, callback);
            } else {
                $(context.deleteBtn).show();
            }
        };
        this.serverProxy.getElements((<any>matrix).matrixId, 0, callback);
    }
}