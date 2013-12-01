/// <reference path="../typings/jquery.d.ts" />
/// <reference path="matrixEditor.ts" />
/// <reference path="serverProxy.ts" />
var MatrixDialogController = (function () {
    function MatrixDialogController(parent, matrixEditor, serverProxy, deleteBtn) {
        this.parent = parent;
        this.matrixEditor = matrixEditor;
        this.serverProxy = serverProxy;
        this.deleteBtn = deleteBtn;
        this.controls = {
            title: "#titleId",
            description: "#matrixDescription",
            dimension: "#matrixDimension",
            okBtn: "#okBtn",
            list: "matricesListId"
        };
    }
    // create edit matrix properties dialog
    MatrixDialogController.prototype.createEditMatrixDialog = function () {
        // some comment
        var result = document.createElement("div");
        this.entityDialog = result;
        result.className = "modal fade";
        result.id = "modalDialogId";
        this.parent.appendChild(result);

        result.innerHTML = '<div class="modal-dialog">' + '<div class="modal-content">' + '<div class="modal-header">' + '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + '<h4 class="modal-title" id="titleId">Create Matrix</h4>' + '</div>' + '<div class="modal-body">' + '<form role="form">' + '<div class="form-group">' + '<label for="matrixDescription">Description</label>' + '<input type="text" class="form-control" id="matrixDescription" placeholder="Enter Matrix Description">' + '</div>' + '<div class="form-group">' + '<label for="matrixDimension">Dimension</label>' + '<input type="number" class="form-control" id="matrixDimension" placeholder="Enter Matrix Dimension">' + '</div>' + '</form>' + '</div>' + '<div class="modal-footer">' + '<button type="button" class="btn btn-primary" data-dismiss="modal" id="okBtn">Ok</button>' + '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' + '</div>' + '</div><!-- /.modal-content -->' + '</div><!-- /.modal-dialog -->';
        return result;
    };

    // create matrix list properties dialog
    MatrixDialogController.prototype.createListMatrixDialog = function () {
        // some comment
        var result = document.createElement("div");
        this.entityListDialog = result;
        result.className = "modal fade";
        result.id = "modalDialogId";
        this.parent.appendChild(result);

        result.innerHTML = '<div class="modal-dialog">' + '<div class="modal-content">' + '<div class="modal-header">' + '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + '<h4 class="modal-title">List of Matrices</h4>' + '</div>' + '<div class="modal-body">' + '<form role="form">' + '<div class="form-group" style="overflow-y: auto;max-height: 300px;" id="matricesListId">' + '</div>' + '</form>' + '</div>' + '<div class="modal-footer">' + '<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' + '</div>' + '</div><!-- /.modal-content -->' + '</div><!-- /.modal-dialog -->';
        return result;
    };

    // Show matrix list dialog
    MatrixDialogController.prototype.showMatrixListDialog = function () {
        var context = this;

        // item click handler
        var itemClickHandler = function (matrix) {
            return function () {
                ($(context.entityListDialog)).modal('hide');
                context.matrixEditor.loadMatrixFromSite(matrix);
            };
        };

        // matrix list get success handler
        var getMatrixListHandler = function (items) {
            var l = items.length;
            for (var i = 0; i < l; i++) {
                var br = document.createElement("br");
                var item = document.createElement("a");
                item.innerText = items[i].description;
                parent.appendChild(item);
                parent.appendChild(br);
                var matrix = {
                    matrixId: items[i].id,
                    description: items[i].description,
                    dimension: items[i].dimension,
                    elements: []
                };
                item.onclick = itemClickHandler(matrix);
            }
        };

        // remove old elements
        var parent = document.getElementById(this.controls.list);
        var children = parent.childNodes;
        while (children.length) {
            parent.removeChild(children[0]);
        }

        // ajax get data
        var matrixList = (this.serverProxy).getMatrixList(getMatrixListHandler);

        // show dialog
        ($(this.entityListDialog)).modal('show');
    };

    // Show create dialog
    MatrixDialogController.prototype.showCreateDialog = function () {
        var context = this;

        $(this.controls.title).html("Create Matrix");
        $(this.controls.dimension).val("");
        $(this.controls.description).val("");

        ($(this.entityDialog)).modal('show');
        $(this.controls.okBtn).unbind('click');
        $(this.controls.okBtn).click(function () {
            context.okCreateHandler();
        });
    };

    // Show edit dialog
    MatrixDialogController.prototype.showEditDialog = function (matrix) {
        var context = this;
        $(this.controls.title).html("Edit Matrix");
        $(this.controls.dimension).val(matrix.dimension);
        $(this.controls.description).val(matrix.description);
        ($(this.entityDialog)).modal('show');
        $(this.controls.okBtn).unbind('click');
        $(this.controls.okBtn).click(function () {
            context.okEditHandler();
        });
    };

    // handler for Create dialog Ok button
    MatrixDialogController.prototype.okCreateHandler = function () {
        $(this.deleteBtn).hide();
        var dimension = parseInt($(this.controls.dimension).val());
        var description = $(this.controls.description).val();
        var elements = [];

        for (var i = 0; i < dimension; i++) {
            elements.push([]);
            for (var j = 0; j < dimension; j++) {
                elements[i].push(0);
            }
        }

        this.matrixEditor.init({ dimension: dimension, description: description, elements: elements });
    };

    // handler for Edit dialog Ok button
    MatrixDialogController.prototype.okEditHandler = function () {
        this.matrixEditor.update({
            dimension: $(this.controls.dimension).val(),
            description: $(this.controls.description).val(),
            elements: null
        });
    };
    return MatrixDialogController;
})();
