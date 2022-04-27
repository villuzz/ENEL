sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/TablePersoController",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
  'sap/ui/core/routing/History',
  "PM030/APP1/util/manutenzioneTable",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, ) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.CaricaTabellaM", {
    onInit: function () {
      this.getView().setModel(
        new JSONModel({
          editEnabled: false,
        }),
        "tabCheckModel"
      );
      // leggere i modelli che ci servono
      var sPiani = [
        {
          Divisione: "123",
        }, {
          Divisione: "23",
        },
      ];
      var oManutenzione = new sap.ui.model.json.JSONModel();
      oManutenzione.setData(sPiani);
      this.getView().setModel(oManutenzione, "mManutenzione");
      this._oTPC = new TablePersoController({ table: this.byId("tbCaricaTabellaM"), persoService: manutenzioneTable }).activate();
      this.getOwnerComponent().getRouter().getRoute("CaricaTabellaM").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: function () {
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({
        DataEsecuzione: new Date()
      });
      this.getView().setModel(oModel, "FilterModel");

      this._mViewSettingsDialogs = {};
     
    },
    onSearchResult: function (oEvent) {
      debugger;
      var oModel = this.getView().getModel("FilterModel");
      this.onSearchFilters();
    },
    onSearchFilters: function () {
      var model = this.getModel("FilterModel");
      var oData = model.getData();

      var oBinding = this.byId("tbCaricaTabellaM").getBinding("items");
      if (oBinding.isSuspended()) {
        oBinding.resume();
      }

      var filterArray = [];

      oData.IndexAzioni.map((ind) => {
        filterArray.push(new sap.ui.model.Filter("IndexAzioni", sap.ui.model.FilterOperator.EQ, ind));
      });
      oData.Materiale.map((mat) => {
        filterArray.push(new sap.ui.model.Filter("Materiale", sap.ui.model.FilterOperator.EQ, mat));
      });
      oData.Divisione.map((d) => {
        filterArray.push(new sap.ui.model.Filter("Divisione", sap.ui.model.FilterOperator.EQ, d));
      });


      var self = this;
      var oDataModel = self.getModel();

      oDataModel.read("", {
        filters: filterArray,
        success: function (response) { // debugger;

        },
        error: function () { // debugger;
        }
      });
    },
    onDataExport: function () {
      var selectedTab = this.byId("tbCaricaTabellaM");

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      oSettings = {
        workbook: {
          columns: aCols
        },
        dataSource: oRowBinding,
        fileName: "CaricaTabellaM.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbCaricaTabellaM").getColumns().map((c) => {
        var templ = "";
        var typ = EdmType.String;
        //var prop = c.mAggregations.header.getText(); 
        var prop = c.getCustomData()[0].getValue();
        return {
          label: c.getHeader().getText(),
          property: prop,
          type: typ,
          format: (value) => { },
          template: templ
        };
      }) || [];
      return oCols;
    },

    onBack: function () {
      var sPreviousHash = History.getInstance().getPreviousHash();
      if (sPreviousHash !== undefined) {
        history.go(-1);
      } else {
        this.getRouter().navTo("ViewPage", {}, true);
      }
    },

    handleNav: function (evt) {
      var navCon = this.byId("navCon");
      var target = evt.getSource().data("target");
      if (target) {
        var oTable = this.byId("tbCaricaTabellaM");
        var SelectItem = oTable.getSelectedItem();
        var oContext = SelectItem.getBindingContext("mManutenzione");
        var sPath = oContext.getPath();
        var oDett = this.byId(target);
        oDett.bindElement({ path: sPath, model: "mManutenzione" });
        navCon.to(this.byId(target));
      } else {
        navCon.back();
      }
    },
    onPersoButtonPressed: function () {
      this._oTPC.openDialog();
    },
    onSelectRow: function () {
      this.getView().getModel("tabCheckModel").setProperty("/editEnabled", true);
    },

    handleUploadPiani: function () {
      this._oValueHelpDialog = sap.ui.xmlfragment("PM030.APP1.view.fragment.UploadTable", this);
      this.getView().addDependent(this._oValueHelpDialog);
      this.getView().setModel(this.oEmployeeModel);
      this._oValueHelpDialog.open();

    },
    onCloseFileUpload: function () {
      // this.onSearch();
      this._oValueHelpDialog.destroy();

    },

    onSave: function () {
      this.byId("navCon").back();
    }
    // onBack: function () {
    // sap.ui.core.UIComponent.getRouterFor(this).navTo("TilePage");
    // }

  });
});
