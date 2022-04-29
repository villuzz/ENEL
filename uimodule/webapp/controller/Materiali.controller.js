sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/TablePersoController",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
  'sap/ui/core/routing/History',
  "PM030/APP1/util/manutenzioneTable",
  'sap/m/MessageToast',
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, MessageToast, Filter, FilterOperator ) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.Materiali", {
    onInit: function () {

      this.getOwnerComponent().getRouter().getRoute("Materiali").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbMateriali"), persoService: manutenzioneTable }).activate();
    },
    _onObjectMatched: function () {
      this.byId("navCon").back();
    },
    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: function () {
      var aFilters = [];

      if (this.getView().byId("cbMateriali").getSelectedKeys().length !== 0) {
        aFilters = this.multiFilterText(this.getView().byId("cbMateriali").getSelectedKeys(), "MATNR");
      }
      this.byId("tbMateriali").getBinding("items").filter(aFilters);
    },
    multiFilterText: function (aArray, vName) {

      var aFilter = [];
      if (aArray.length === 0) {
          return new Filter(vName, FilterOperator.EQ, "");
      } else if (aArray.length === 1) {
          return new Filter(vName, FilterOperator.EQ, aArray[0]);
      } else {
          for (var i = 0; i < aArray.length; i++) {
              aFilter.push(new Filter(vName, FilterOperator.EQ, aArray[i]));
          }
          return aFilter;
      }
    },
    onDataExport: function () {
      var selectedTab = this.byId("tbMateriali");

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
        fileName: "Materiali.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = [], sCols = {};
      var oColumns = this.byId("tbMateriali").getColumns();
      var oCells = this.getView().byId("tbMateriali").getBindingInfo('items').template.getCells();
      for (var i = 0; i < oColumns.length; i++) {
        sCols = {
          label: oColumns[i].getHeader().getText(),
          property: oCells[i].getBindingInfo('text').parts[0].path,
          type: EdmType.String,
          format: () => { },
          template: ""
        };
        oCols.push(sCols);
      }
      return oCols;
    },
    onBack: function () {
      this.navTo("ViewPage");
    },
    onNuovo: function () {
      sap.ui.core.BusyIndicator.show();
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({});
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbMateriali").getSelectedItems();
      if (items.length === 1) {
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData( items[0].getBindingContext().getObject());
          this.getView().setModel(oModel, "sDetail");
          this.byId("navCon").to(this.byId("Detail"));
      } else {
          MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onModify: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbMateriali").getSelectedItems();
      if (items.length === 1) {
          this.byId("Detail").bindElement({ path: items[0].getBindingContext().getPath() });
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData( items[0].getBindingContext().getObject());
          this.getView().setModel(oModel, "sDetail");
          this.byId("navCon").to(this.byId("Detail"));
      } else {
          MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onPersoButtonPressed: function () {
      this._oTPC.openDialog();
    },

    handleUploadPiani: function () {
      this.byId("UploadTable").open();
    },
    onCloseFileUpload: function () {
      // this.onSearch();
      this.byId("UploadTable").close();
    },
    onBackDetail: function () {
      this.byId("navCon").back();
    },
    onSave: async function () {
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);
      delete line.__metadata;
      delete line.modifiedBy;
      delete line.modifiedAt;
      delete line.createdBy;
      delete line.createdAt;

      var sURL = "/Materiali/" + line.MATNR;
      await this._updateHana(sURL, line);
      this.byId("navCon").back();
    },
    onCancel: async function () {
      var sel = this.getView().byId("tbMateriali").getSelectedItems();
      for (var i =( sel.length - 1); i >= 0; i--) {
          var line = sel[i].getBindingContext().getObject();
          await this._removeHana("/Materiali/" + line.MATNR);
      }
      this.getView().getModel().refresh();
      this.getView().byId("tbMateriali").removeSelections();
  },
  handleUploadPress: async function () {
    var oResource = this.getResourceBundle();

    if (this.getView().byId("fileUploader").getValue() === "") {
        MessageBox.warning("Inserire un File da caricare");
    } else {
        sap.ui.core.BusyIndicator.show();
        var i = 0,
            sURL,
            msg = "";
        var rows = this.getView().getModel("uploadModel").getData();

        if (msg !== "") {
            sap.ui.core.BusyIndicator.hide(0);
            MessageBox.error(msg);
        } else {
            for (i = 0; i < rows.length; i++) {
                var sMateriali = this.MaterialiModel(rows[i]);
                sURL = "/Materiali/" + sMateriali.MATNR;
                await this._updateHana(sURL, sMateriali);
            }
            MessageBox.success("Excel Caricato con successo");
            sap.ui.core.BusyIndicator.hide(0);
            this.getView().getModel().refresh();
            this.byId("UploadTable").close();
      }
    }
  },
  MaterialiModel: function (sValue) {
    var oResource = this.getResourceBundle();
    var rValue = {
        MATNR: (sValue[oResource.getText("MATNR")] === undefined) ? undefined : sValue[oResource.getText("MATNR")].toString(),
        MAKTX: (sValue[oResource.getText("MAKTX")] === undefined) ? undefined : sValue[oResource.getText("MAKTX")].toString(),
        MENGE: (sValue[oResource.getText("MENGE")] === undefined) ? undefined : sValue[oResource.getText("MENGE")].toString(),
        MEINS: (sValue[oResource.getText("MEINS")] === undefined) ? undefined : sValue[oResource.getText("MEINS")].toString(),
    };
    return rValue;
  },
  });
});
