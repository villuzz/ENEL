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

  return Controller.extend("PM030.APP1.controller.Strategia", {
    onInit: function () {

      this.getOwnerComponent().getRouter().getRoute("Strategia").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbStrategia"), persoService: manutenzioneTable }).activate();
    },
    _onObjectMatched: function () {
      this.byId("navCon").back();
    },
    onSearchResult: function () {
      this.onSearchFilters();
    },
   
    onSearchFilters: function () {
      var aFilters = [];

      if (this.getView().byId("cbSTRATEGIA").getSelectedKeys().length !== 0) {
        aFilters = this.multiFilterNumber(this.getView().byId("cbSTRATEGIA").getSelectedKeys(), "ID");
      }
      this.byId("tbStrategia").getBinding("items").filter(aFilters);
    },
    multiFilterNumber: function (aArray, vName) {

      var aFilter = [];
      if (aArray.length === 0) {
          return new Filter(vName, FilterOperator.EQ, "");
      } else if (aArray.length === 1) {
          return new Filter(vName, FilterOperator.EQ, Number(aArray[0]));
      } else {
          for (var i = 0; i < aArray.length; i++) {
              aFilter.push(new Filter(vName, FilterOperator.EQ, Number(aArray[i])));
          }
          return aFilter;
      }
    },
    onDataExport: function () {
      var selectedTab = this.byId("tbStrategia");

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
        fileName: "Strategia.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = [], sCols = {};
      var oColumns = this.byId("tbStrategia").getColumns();
      var oCells = this.getView().byId("tbStrategia").getBindingInfo('items').template.getCells();
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
      oModel.setData({ ID: "New"});
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbStrategia").getSelectedItems();
      if (items.length === 1) {
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData( items[0].getBindingContext().getObject());
          oModel.getData().ID = "New";
          this.getView().setModel(oModel, "sDetail");
          this.byId("navCon").to(this.byId("Detail"));
      } else {
          MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onModify: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbStrategia").getSelectedItems();
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
      if (line.ID === "New"){
        // get Last Index
        line.ID = await this._getLastItemData("/Strategia", "", "ID");
        line.ID++;
        await this._saveHana("/Strategia", line);
      } else {
        var sURL = "/Strategia/" + line.ID;
        delete line.__metadata;
        delete line.modifiedBy;
        delete line.modifiedAt;
        delete line.createdBy;
        delete line.createdAt;
        await this._updateHana(sURL, line);
      }
      this.byId("navCon").back();
    },
    onCancel: async function () {
      var sel = this.getView().byId("tbStrategia").getSelectedItems();
      for (var i =( sel.length - 1); i >= 0; i--) {
          var line = sel[i].getBindingContext().getObject();
          await this._removeHana("/Strategia/" + line.ID);
      }
      this.getView().getModel().refresh();
      this.getView().byId("tbStrategia").removeSelections();
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

        // controllo Dati Indice
        /*for (i = 0; i < rows.length; i++) {

            var sStrategia = this.StrategiaModel(rows[i]);
            if (!aStrategia.includes(sStrategia.INDEX)) {
                aStrategia.push(sStrategia.INDEX);
                msg = await this.ControlStrategia(sStrategia);

                if (msg !== "") {
                    msg = msg + ", riga Excel n° " + (
                        i + 2
                    );
                    break;
                }
            }
        }*/

        if (msg !== "") {
            sap.ui.core.BusyIndicator.hide(0);
            MessageBox.error(msg);
        } else {
            for (i = 0; i < rows.length; i++) {
                var sStrategia = this.StrategiaModel(rows[i]);
                if (sStrategia.ID.startsWith("C-")) { //Creazione                  
                    sStrategia.ID = await this._getLastItemData("/Strategia", "", "ID");
                    sStrategia.ID = Number(sStrategia.ID);
                    sStrategia.ID++;
                    await this._saveHana("/Strategia", sStrategia);
                } else { // Modifica
                    sURL = "/Strategia/" + sStrategia.ID;
                    sStrategia.ID = Number(sStrategia.ID);
                    await this._updateHana(sURL, sStrategia);
                }
            }
            MessageBox.success("Excel Caricato con successo");
            sap.ui.core.BusyIndicator.hide(0);
            this.getView().getModel().refresh();
            this.byId("UploadTable").close();
      }
    }
  },
  StrategiaModel: function (sValue) {
    var oResource = this.getResourceBundle();
    var rValue = {
        ID: (sValue[oResource.getText("ID")] === undefined) ? undefined : sValue[oResource.getText("ID")].toString(),
        STRATEGIA: (sValue[oResource.getText("STRATEGIA")] === undefined) ? undefined : sValue[oResource.getText("STRATEGIA")].toString(),
        STRATEGIA_DESC: (sValue[oResource.getText("STRATEGIA_DESC")] === undefined) ? undefined : sValue[oResource.getText("STRATEGIA_DESC")].toString(),
    };
    return rValue;
  },
  });
});
