/// <reference path="tableBuilder.ts" />
/// <reference path="serverProxy.ts" />
// implements matrix create/update/delete/load logic
var MatrixEditor = (function () {
    function MatrixEditor(parentElement, serverProxy, deleteBtn) {
        this.parentElement = parentElement;
        this.serverProxy = serverProxy;
        this.deleteBtn = deleteBtn;
        this.matrixParent = document.getElementById(parentElement);
        this.collapsed = false;
        this.topLeftCellId = "topLeftCell";
    }
    MatrixEditor.prototype.init = function (matrix) {
        this.matrix = matrix;
        this.remove();
        this.tableBuilder = new TableBuilder(matrix.dimension, this.parentElement, this);
        for (var i = 0; i < matrix.dimension; i++) {
            for (var j = 0; j < matrix.dimension; j++) {
                var value = matrix.elements == null ? 0 : parseFloat(matrix.elements[i][j]);
                this.tableBuilder.addCell(value);
            }
        }
    };

    // used to clear data in view
    MatrixEditor.prototype.remove = function () {
        var children = this.matrixParent.childNodes;
        while (children.length) {
            this.matrixParent.removeChild(children[0]);
        }
    };

    // Collapse/Expand button handler
    MatrixEditor.prototype.collapseHandler = function (e) {
        if (!this.collapsed) {
            var elements = document.getElementsByTagName('td');
            var l = elements.length;
            for (var i = 0; i < l; i++) {
                var element = elements[i];
                (element).innerText = "";
            }
            this.collapsed = true;
        } else {
            var l = this.matrix.elements.length;
            for (var i = 0; i < l; i++) {
                for (var j = 0; j < l; j++) {
                    var value = this.matrix.elements[i][j];
                    if (typeof value === "string") {
                        value = parseFloat(value).toFixed(4);
                    } else {
                        value = value.toFixed(4);
                    }
                    document.getElementById(this.getCellId(i + 1, j + 1)).innerText = value;
                }
            }
            this.collapsed = false;
        }
    };

    // handler for file select event
    MatrixEditor.prototype.loadFileHandler = function (event, file) {
        var context = this;
        var description = "Loaded from file (" + file.name + ")";
        var callback = function (fileString) {
            var data = context.getDataFromFileString(fileString);
            context.init({ elements: data, dimension: data.length, description: description });
        };

        var reader = new FileReader();

        reader.readAsText(file, "UTF-8");

        reader.onload = function loaded(evt) {
            var fileString = evt.target.result;
            callback(fileString);
        };
    };

    // convert data loaded from file to matrix array
    MatrixEditor.prototype.getDataFromFileString = function (fileString) {
        var data = fileString.split(/\r?\n+/);
        var result = [];
        var l = data.length;
        for (var i = 0; i < l; i++) {
            var row = data[i].split(" ");
            for (var j = 0; j < l; j++) {
                row[j] = parseFloat(row[j]);
            }
            result.push(row);
        }
        return result;
    };

    MatrixEditor.prototype.getCellId = function (rowIdx, colIdx) {
        return "id" + rowIdx + "_" + colIdx;
    };

    MatrixEditor.prototype.clearValues = function () {
        var l = this.matrix.elements.length;
        for (var i = 0; i < l; i++) {
            for (var j = 0; j < l; j++) {
                this.matrix.elements[i][j] = 0;
            }
        }
        this.init(this.matrix);
    };

    MatrixEditor.prototype.update = function (matrix) {
        this.matrix.description = matrix.description;

        var oldValue = typeof this.matrix.dimension === "string" ? parseInt(this.matrix.dimension.toString()) : this.matrix.dimension;
        var newValue = typeof matrix.dimension === "string" ? parseInt(matrix.dimension.toString()) : matrix.dimension;
        if (newValue == this.matrix.dimension) {
            return;
        }
        if (newValue < this.matrix.dimension) {
            (this.tableBuilder).reduceDimension(newValue);
        } else {
            (this.tableBuilder).increaseDimension(newValue);
        }
    };

    MatrixEditor.prototype.loadMatrixFromSite = function (matrix) {
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
                context.serverProxy.getElements((matrix).matrixId, lastIdx, callback);
            } else {
                $(context.deleteBtn).show();
            }
        };
        this.serverProxy.getElements((matrix).matrixId, 0, callback);
    };
    return MatrixEditor;
})();
