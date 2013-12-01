/// <reference path="matrixEditor.ts" />

interface ICell {
    row: number;
    col: number;
}


// used to create a matrix like an html table
class TableBuilder {
    parentElement: HTMLElement;
    tableElement: HTMLTableElement;
    headerRow: HTMLElement;
    leftTopElement: HTMLElement;
    lastAddedCell: ICell;
    currentRow: HTMLElement;

    constructor(public dimension, public parentElementId, public editor: MatrixEditor) {
        this.parentElement = document.getElementById(parentElementId);
        this.tableElement = this.createTable();
        this.headerRow = this.createRow();
        this.leftTopElement = this.createHeaderElement(this.headerRow);
        this.setHeaderElementValue(this.leftTopElement, dimension + "/" + dimension);
        this.lastAddedCell = {row: 0, col: 0};
        this.currentRow = null;
    }

    // create table
    createTable () {
        var result = document.createElement("table");
        this.parentElement.appendChild(result);
        return result;
    }

    // create row
    createRow(isUpdateMatrixElement = false) {
        var result = document.createElement("tr");
        this.tableElement.appendChild(result);
        if (this.lastAddedCell) {
            this.lastAddedCell.row++;
            this.createRowCaption(result);
        }
        return result;
    }

    // create row caption
    createRowCaption(parent) {
        var cell = document.createElement("th");
        parent.appendChild(cell);
        cell.innerText = this.lastAddedCell.row.toString();
    }

    // create cell
    createCell(parent, isUpdateMatrixElement = false) {

        if ((this.lastAddedCell.row == 1) && (this.lastAddedCell.col < this.dimension)) {
            var cell = document.createElement("th");
            this.headerRow.appendChild(cell);
            cell.innerText = (this.lastAddedCell.col + 1).toString();
        }

        var result = document.createElement("td");
        parent.appendChild(result);

        this.lastAddedCell.col++
        return result;
    }

    // create header
    createHeaderElement (parent) {
        var result = document.createElement("th");
        parent.appendChild(result);
        return result;
    }

    setHeaderElementValue(element, value) {
        element.innerHTML = value;
    }

    addCell(value, isUpdateMatrixElement = false) {
        if ((this.lastAddedCell == null) || (this.lastAddedCell == undefined)) {
            this.lastAddedCell = {row: 0, col: 0};
        }
        if ((this.lastAddedCell.row == 0) || (this.lastAddedCell.col == this.dimension)) {
            this.currentRow = this.createRow();
            this.lastAddedCell.col = 0;
            if (isUpdateMatrixElement) {
                this.editor.matrix.elements.push([]);
            }
        }

        var cell = this.createCell(this.currentRow);
        if (isUpdateMatrixElement) {
            this.editor.matrix.elements[this.lastAddedCell.row - 1].push(value);
        }
        this.setCellStyle(cell, value);
        this.setCellEvents(cell);

        cell.id = this.getCellId(this.lastAddedCell.row, this.lastAddedCell.col);

        cell.innerHTML = parseFloat(value).toFixed(4);
    }

    // set cell style according to cell data
    // background color is calculating by next rules:
    // value in [-1;0) set rgba(255, 140, 0, abs(value))
    // text color is rgb(0,0,0)
    // value equal to 0 set rgb(255, 255, 255)
    // text color is rgb(0,0,0)
    // value in (0;1] set rgba(0, 0, 0, abs(value))
    // text color is calculating by getCellTextColor
    setCellStyle (cell, value) {
        cell.setAttribute("contenteditable", "true");
        var alpha = Math.abs(value);
        if (value < 0) {
            cell.style.background = "rgba(255, 140, 0," + alpha + ")";
            cell.style.color = "rgb(0,0,0)";
        } else if (value == 0) {
            cell.style.background = "rgb(255, 255, 255)";
            cell.style.color = "rgb(0,0,0)";
        }else {
            cell.style.background = "rgba(0, 0, 0," + alpha + ")";
            cell.style.color = this.getCellTextColor(value);
        }
        cell.width = "10";
        cell.setAttribute("align","right");
    }

    // returns cell text color by cell value
    getCellTextColor (value) {
        if (value > 0.6) {
            return "rgb(255, 140, 0)";
        } else if (value > 0.3) {
            return "rgb(255, 255, 0)";
        } else {
            return "rgb(0, 130, 0)";
        }
    }

    getCellId(rowIdx, colIdx) {
        return "id" + rowIdx + "_" + colIdx;
    }

    setCellEvents(cell) {
        var context = this;

        // onfocus occured than user select cell
        cell.onfocus = function(e) {
            if (context.editor.collapsed) { return ;}
            context.editor.currentSelectedValue = (<any>e.target).innerText;
        };

        // onblur occured than cell left focus
        cell.onblur = function (e) {

            if (context.editor.collapsed) {
                // if matrix collapsed - prevent edit values
                (<any>e.target).innerText = "";
                return ;
            }
            
            if (context.isCorrectNumber((<any>e.target).innerText)) {
                // if value is edited - change cell style
                var value = parseFloat((<any>e.target).innerText);
                (<any>e.target).innerText = value.toFixed(4);
                context.setCellStyle(e.target, value);

                var colIdx = (<any>e.target).cellIndex-1;
                var rowIdx = ((<any>e.target).parentNode).sectionRowIndex-1;
                context.editor.matrix.elements[rowIdx][colIdx] = value;
            } else {
                (<any>e.target).innerText = context.editor.currentSelectedValue;
            }
        }
    }

    // check if number is correct and between -1 and 1
    isCorrectNumber (value) {
        var mask = /(-|\+)?[1]|(-|\+)?[0]|^(-|\+)?([0]|[1])[.]?(?:\d{1,4}|\d+)$/;
        return mask.test(value) && (value >= -1) && (value <= 1);
    }

    // reduce matrix dimension
    reduceDimension(newValue) {
        this.editor.matrix.elements = this.editor.matrix.elements.splice(0, newValue)
        for (var i = this.editor.matrix.dimension; i >= 0; i--) {
            if (i > newValue) {
                this.tableElement.deleteRow(i);
            } else {
                if (i > 0) {
                    this.editor.matrix.elements[i - 1] = (<any>this.editor.matrix.elements[i - 1]).splice(0, newValue)
                }
                for (var j = this.editor.matrix.dimension; j > newValue; j--) {
                    (<HTMLTableRowElement>this.tableElement.rows[i]).deleteCell(j);
                }
            }
        }
        this.editor.matrix.dimension = newValue;
        this.dimension = newValue;
        this.leftTopElement.innerText = newValue + "/" + newValue;
    }

    // increase matrix dimension
    increaseDimension(newValue) {
        for (var i = 0; i < newValue; i++) {
            var colStart = this.editor.matrix.dimension;
            if (i >= this.editor.matrix.dimension) {
                this.editor.matrix.elements.push([]);
                colStart = 0;
            }
            for (var j = colStart; j < newValue; j++) {
                this.editor.matrix.elements[i].push("0.0000");
            }
        }
        this.editor.matrix.dimension = newValue;
        this.dimension = newValue;
        this.leftTopElement.innerText = newValue + "/" + newValue;
    }
}
