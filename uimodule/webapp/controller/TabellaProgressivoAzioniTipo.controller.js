sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/TablePersoController",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
  'sap/ui/core/routing/History',
  "PM030/APP1/util/manutenzioneTable",
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  'sap/m/MessageToast',
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, Filter, FilterOperator, MessageToast) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.TabellaProgressivoAzioniTipo", {
    onInit: function () {
      this.getOwnerComponent().getRouter().getRoute("TabellaProgressivoAzioniTipo").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbProgressivoAzioni"), componentName: "Piani", persoService: manutenzioneTable }).activate();

    },
    _onObjectMatched: async function () {
      debugger
    var T_ACT_PROG = await this._getTable("/T_ACT_PROG", []);
    var oModel = new sap.ui.model.json.JSONModel();
    oModel.setData(T_ACT_PROG);
    this.getView().setModel(oModel, "T_ACT_PROG");
    var oData = {
      "Enabled": true
    };
    var oModelEnabled = new JSONModel(oData);
    this.getView().setModel(oModelEnabled, "oDataModel");
    this.getValueHelp();
    },

    getValueHelp: async function(){
      debugger
      var sData = {};
        var oModelHelp = new sap.ui.model.json.JSONModel();
        sData.T_ACT_PROG = await this._getTableDistinct("/T_ACT_PROG", [], "Divisione");
        sData.DIVISIONE = new Set(sData.T_ACT_PROG.map(item => item.Werks));
        sData.DIVISIONENew = await this.Shpl("H_T001W", "SH");
        // sData.SISTEMANew = await this._getTableDistinct("ZPM4R_T_ACT_SYST", [], "CH");
        sData.SISTEMANew = await this._getTable("/T_ACT_SYST", []);
        // sData.COMPONENTE = await this._getTable("ZPM4R_T_ACT_PROG", []);
        // sData.COMPONENTE = await this.Shpl("/T_ACT_PROG", "SH");
        oModelHelp.setData(sData);
        this.getView().setModel(oModelHelp, "sHelp");
    },
    Shpl: async function (ShplName, ShplType) {
        var aFilter = [];
        aFilter.push(new Filter("ShplName", FilterOperator.EQ, ShplName));
        aFilter.push(new Filter("ShplType", FilterOperator.EQ, ShplType));

        var result = await this._getTable("/dySearch", aFilter);
        if (result[0].ReturnFieldValueSet) {
          result = result[0].ReturnFieldValueSet.results;
          result.splice(0,1);
        } else {
          result = [];
        }
        return result;
    },
    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: function () {
      debugger
      var aFilters = [];
      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Werks"));
      }
      if (this.getView().byId("cbSistema").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbSistema").getSelectedKeys(), "Sistema"));
      }
      if (this.getView().byId("cbProgressivo").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbProgressivo").getSelectedKeys(), "Progres"));
      }
      if (this.getView().byId("cbDescrizioneProgressivo").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDescrizioneProgressivo").getSelectedKeys(), "Txt"));
      }
      if (this.getView().byId("cbComponentTipo").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbComponentTipo").getSelectedKeys(), "ComponentTipo"));
      }
      this.byId("tbProgressivoAzioni").getBinding("items").filter(aFilters);
    },

    multiFilterNumber: function (aArray, vName) {
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
      var selectedTab = this.byId("tbProgressivoAzioni");

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
        fileName: "TabellaProgressivoAzioniTipo.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = [], sCols = {};
      var oColumns = this.byId("tbProgressivoAzioni").getColumns();
      var oCells = this.getView().byId("tbProgressivoAzioni").getBindingInfo('items').template.getCells();
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
      oModel.setData({ ID: "New" });
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },
    onBackDetail: function () {
      this.byId("navCon").back();
    },
    onModify: function () {
      debugger
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_ACT_PROG").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ACT_PROG").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ACT_PROG").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCancel: async function () {
      debugger
      var sel = this.getView().byId("tbProgressivoAzioni").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_ACT_PROG").getObject());
        line = JSON.parse(line);
        

        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._removeHana(sURL);
      }
      this.getView().byId("tbProgressivoAzioni").removeSelections();
      var T_ACT_PROG = await this._getTable("/T_ACT_PROG", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(T_ACT_PROG);
      this.getView().setModel(oModel, "T_ACT_PROG");
    },

    handleNav: function (evt) {
      var navCon = this.byId("navCon");
      var target = evt.getSource().data("target");
      if (target) {
        var oTable = this.byId("tbManutenzione");
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
      this.byId("UploadTable").open();
    },
    onCloseFileUpload: function () {
      // this.onSearch();
      this.byId("UploadTable").close();
    },
    handleUploadPress: async function () {
      debugger
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
            var sAzioni = this.AzioniModel(rows[i]);
            if (sAzioni.Werks.startsWith("C-")) { //Creazione                  
              await this._saveHana("/T_ACT_PROG", sAzioni);
            } else { // Modifica
              // sAzioni.CONTATORE = await this._getLastItemData("/Azioni", "", "CONTATORE");
              // sURL = "/Azioni/" + sAzioni.CONTATORE;

               sURL = this.componiURL(sAzioni);
              // sAzioni.DIVISIONE = Number(sAzioni.DIVISIONE);
              await this._updateHana(sURL, sAzioni);
            }
          }
          MessageBox.success("Excel Caricato con successo");
          sap.ui.core.BusyIndicator.hide(0);
          this.getView().getModel().refresh();
          this.byId("UploadTable").close();
        }
      }


    },
    AzioniModel: function(sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Progres: (sValue[oResources.getText("Progressivo")] === undefined) ? undefined : sValue[oResources.getText("Progressivo")].toString(),
        Txt: (sValue[oResources.getText("DescrizioneProgressivo")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneProgressivo")].toString(),
        ComponentTipo: (sValue[oResources.getText("ComponenteTipo")] === undefined) ? undefined : sValue[oResources.getText("ComponenteTipo")].toString()
      };
      return rValue;
    },
    
 

    componiURL: function (line) {
      debugger
      var sURL = `/T_ACT_PROG(Werks='${line.Werks}',Sistema='${line.Sistema}',Progres='${line.Progres}')`;

      return sURL;
    },
    
    

    onSave: async function () {
      debugger
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);
      if (line.ID === "New") {
        // get Last Index
        delete line.ID;
        var sURL = this.componiURL(line);
        // var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._saveHana("/T_ACT_PROG", sURL);
        var T_ACT_PROG = await this._getTable("/T_ACT_PROG", []);
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(T_ACT_PROG);
        this.getView().setModel(oModel, "T_ACT_PROG");
      } else {
        var sURLM = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._updateHana(sURLM, line);
        var T_ACT_PROGM = await this._getTable("/T_ACT_PROG", []);
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(T_ACT_PROGM);
        this.getView().setModel(oModel, "T_ACT_PROG");
      }
      this.byId("navCon").back();
    },
    AzioniModelSave: function(sValue) {
      debugger
      var rValue = {
        ID: (sValue.ID === "") ? "" : sValue.ID,
        CONTATORE: (sValue.CONTATORE === "") ? "" : sValue.CONTATORE,
        SISTEMA: (sValue.SISTEMA === "") ? "" : sValue.SISTEMA,
        PROGRES: (sValue.PROGRES === "") ? "" : sValue.PROGRES,
        DESC_PROG: (sValue.DESC_PROG === "") ? "" : sValue.DESC_PROG,
        DES_COMPONENTE: (sValue.DES_COMPONENTE === "") ? "" : sValue.DES_COMPONENTE,
        DIVISIONE: (sValue.DIVISIONE === "") ? "" : sValue.DIVISIONE
    };
    return rValue;
    }
  });
});
