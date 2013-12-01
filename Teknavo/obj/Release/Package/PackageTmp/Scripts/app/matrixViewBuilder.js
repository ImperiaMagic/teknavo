/// <reference path="../typings/jquery.d.ts" />
/// <reference path="matrixEditor.ts" />
/// <reference path="matrixDialogController.ts" />
/// <reference path="serverProxy.ts" />
// MatrixViewBuilder - build Matrix Editor View
// set controls event handlers using options
// set controls tool tip values
var MatrixViewBuilder = (function () {
    function MatrixViewBuilder(options) {
        this.options = options;
        // register controls
        var iDs = options.controls;
        var serverProxy = new ServerProxy();
        var deleteBtn = document.getElementById(iDs.del);
        var matrixEditor = new MatrixEditor(iDs.matrix, serverProxy, deleteBtn);
        this.dialogController = new MatrixDialogController(document.getElementById(iDs.editView), matrixEditor, serverProxy, deleteBtn);

        this.controls = {
            fileLoader: document.getElementById(iDs.fileLoader),
            create: document.getElementById(iDs.create),
            loadFromFile: document.getElementById(iDs.loadFromFile),
            loadFromSite: document.getElementById(iDs.loadFromSite),
            save: document.getElementById(iDs.save),
            clear: document.getElementById(iDs.clear),
            del: deleteBtn,
            edit: document.getElementById(iDs.edit),
            collapse: document.getElementById(iDs.collapse),
            matrixEditor: matrixEditor,
            editView: this.dialogController.createEditMatrixDialog(),
            listView: this.dialogController.createListMatrixDialog()
        };

        ($(this.controls.editView)).modal({ show: false });

        // set controls tooltips
        ($(this.controls.create)).tooltip({ title: "Create matrix", placement: "bottom" });
        ($(this.controls.loadFromFile)).tooltip({ title: "Load matrix from file", placement: "bottom" });
        ($(this.controls.loadFromSite)).tooltip({ title: "Load matrix from site", placement: "bottom" });
        ($(this.controls.save)).tooltip({ title: "Save matrix to site", placement: "bottom" });
        ($(this.controls.clear)).tooltip({ title: "Clear matrix", placement: "bottom" });
        ($(this.controls.edit)).tooltip({ title: "Edit matrix unique and dimension", placement: "bottom" });
        ($(this.controls.collapse)).tooltip({ title: "Collapse or expand matrix", placement: "bottom" });
        ($(this.controls.del)).tooltip({ title: "Delete matrix from site", placement: "bottom" });

        // set control event handlers
        var context = this;

        // set event handler for file select event
        this.controls.fileLoader.addEventListener("change", function (e) {
            var file = context.controls.fileLoader.files[0];
            context.controls.matrixEditor.loadFileHandler(e, file);
            context.controls.fileLoader.value = null;
            $(deleteBtn).hide();
        }, false);

        // imitates click on a hidden fileBtn button
        // this control used to select a file
        this.controls.loadFromFile.addEventListener('click', function (e) {
            var fileInput = document.getElementById('fileBtn');
            fileInput.click();
        }, false);

        // set event handler for click on collapse button
        this.controls.collapse.addEventListener('click', function (e) {
            context.controls.matrixEditor.collapseHandler(e);
        }, false);

        // set event handler for click on create button
        this.controls.create.addEventListener('click', function (e) {
            context.dialogController.showCreateDialog();
        }, false);

        // set event handler for click on load from site button
        this.controls.loadFromSite.addEventListener('click', function (e) {
            context.dialogController.showMatrixListDialog();
        }, false);

        // set event handler for click on save matrix button
        this.controls.save.addEventListener('click', function (e) {
            serverProxy.saveMatrix(context.controls.matrixEditor.matrix);
        }, false);

        // set event handler for click on clear matrix button
        this.controls.clear.addEventListener('click', function (e) {
            context.controls.matrixEditor.clearValues();
        }, false);

        // set event handler for click on edit matrix button
        this.controls.edit.addEventListener('click', function (e) {
            context.dialogController.showEditDialog(context.controls.matrixEditor.matrix);
        }, false);

        this.controls.del.addEventListener('click', function (e) {
            serverProxy.deleteMatrix(context.controls.matrixEditor.matrix.matrixId);
            context.controls.matrixEditor.remove();
            var parent = document.getElementById(iDs.matrix);
            var messageElement = document.createElement("h2");
            messageElement.innerText = "Matrix deleted";
            parent.appendChild(messageElement);
            $(deleteBtn).hide();
        }, false);

        // show matrix data
        var matrix = {
            elements: options.data,
            dimension: options.data.length,
            description: "Data Generated " + Math.round(new Date().getTime() / 1000)
        };

        this.controls.matrixEditor.init(matrix);
    }
    return MatrixViewBuilder;
})();
