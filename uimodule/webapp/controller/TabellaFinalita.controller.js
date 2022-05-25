sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/TablePersoController",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
  'sap/ui/core/routing/History',
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  'sap/m/MessageToast',
  "PM030/APP1/util/manutenzioneTable",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, Filter, FilterOperator, MessageToast, manutenzioneTable, ) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.TabellaFinalita", {
    onInit: function () {
      sap.ui.core.BusyIndicator.show();
      this.getOwnerComponent().getRouter().getRoute("TabellaFinalita").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: async function () {
      var aT_TP_MAN1 = await this._getTable("/T_TP_MAN1", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_TP_MAN1);
      this.getView().setModel(oModel, "T_TP_MAN1");
      this._mViewSettingsDialogs = {};
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaFinalita"), componentName: "Piani", persoService: manutenzioneTable }).activate();

      this.getValueHelp();
    },
    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_TP_MAN1: {},
        T001W: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_TP_MAN1 = await this._getTable("/T_TP_MAN1", []);
      var aArray = [];
      sData.T_TP_MAN1.forEach(el => {
        if (!aArray.find(item => item.Divisione === el.Divisione)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN1/Divisione", aArray.filter(a => a.Divisione));

      aArray = [];
      sData.T_TP_MAN1.forEach(el => {
        if (!aArray.find(item => item.TipoGestione1 === el.TipoGestione1)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN1/TipoGestione1", aArray.filter(a => a.TipoGestione1));
      aArray = [];
      sData.T_TP_MAN1.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN1/Raggruppamento", aArray.filter(a => a.Raggruppamento));

      sData.DIVISIONENew = await this.Shpl("T001W", "CH");
      oModelHelp.setProperty("/T001W/DivisioneNew", sData.DIVISIONENew);

      sData.aRAGGRUPPAMENTO = await this._getTable("/T_RAGGR", []);
      aArray = [];
      sData.aRAGGRUPPAMENTO.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_TP_MAN1/Raggruppamento", aArray.filter(a => a.Raggruppamento));

      // oModelHelp.setData(sData);
      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },
    Shpl: async function (ShplName, ShplType) {
      var aFilter = [];
      aFilter.push(new Filter("ShplName", FilterOperator.EQ, ShplName));
      aFilter.push(new Filter("ShplType", FilterOperator.EQ, ShplType));

      var result = await this._getTable("/dySearch", aFilter);
      if (result[0].ReturnFieldValueSet) {
        result = result[0].ReturnFieldValueSet.results;
        result.splice(0, 1);
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
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Divisione"));
      }
      if (this.getView().byId("cbFinalita").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbFinalita").getSelectedKeys(), "TipoGestione1"));
      }
      if (this.getView().byId("cbRaggruppamento").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbRaggruppamento").getSelectedKeys(), "Raggruppamento"));
      }

      this.byId("tbTabellaFinalita").getBinding("items").filter(aFilters);
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
    onNuovo: function () {
      debugger
      this.getView().getModel().setProperty("/Enabled", true);
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
    onSave: async function () {
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);

      if (line.ID === "New") {
        delete line.ID;
        // get Last Index
        // var sDestUsr = this.DESTUSERModel(line);
        var sFinalita = this.FinalitaModel(line);
        await this._saveHana("/T_TP_MAN1", sFinalita);
        var aT_RAGRR = await this._getTable("/T_TP_MAN1", []);
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_RAGRR);
        this.getView().setModel(oModel, "T_TP_MAN1");
      } else {
        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._updateHana(sURL, line);
        aT_RAGRR = await this._getTable("/T_TP_MAN1", []);
        oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_RAGRR);
        this.getView().setModel(oModel, "T_TP_MAN1");
      }
      this.byId("navCon").back();

    },
    FinalitaModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        TipoGestione1: (sValue[oResources.getText("TipoGest")] === undefined) ? undefined : sValue[oResources.getText("TipoGest")].toString(),
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        DesTipoGest1: (sValue[oResources.getText("Descrizione")] === undefined) ? undefined : sValue[oResources.getText("Descrizione")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue;
    },
    onModify: function () {
      debugger
      this.getView().getModel().setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbTabellaFinalita").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_TP_MAN1").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_TP_MAN1").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbTabellaFinalita").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_TP_MAN1").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onCancel: async function () {
      var sel = this.getView().byId("tbTabellaFinalita").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_TP_MAN1").getObject());
        line = JSON.parse(line);
        // line = this.RaggruppamentoCancelModel(line);
        var sURL = this.componiCancelURL(line);
        await this._removeHana(sURL);
      }
      this.getView().byId("tbTabellaFinalita").removeSelections();
      var aT_RAGRR = await this._getTable("/T_TP_MAN1", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_RAGRR);
      this.getView().setModel(oModel, "T_TP_MAN1");
    },
    componiCancelURL: function (line) {
      var sURL = "/T_TP_MAN1(" + "TipoGestione1=" + "'" + line.TipoGestione1 + "'," +
        "Divisione=" + "'" + line.Divisione + "'" + ")";
      return sURL;
    },
    onDataExport: function () {
      var selectedTab = this.byId("tbTabellaFinalita");

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
        fileName: "TabellaFinalita.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbTabellaFinalita").getColumns().map((c) => {
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
        var oTable = this.byId("tbTabellaFinalita");
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
    handleUploadPress: async function () {
      debugger
      var oResource = this.getResourceBundle();
      if (sap.ui.getCore().byId("fileUploader").getValue() === "") {
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
            var sFinalitaEx = this.FinalitaExcelModel(rows[i]);
            if (sFinalitaEx.TipoGestione1.startsWith("C-")) { //Creazione                  
              // sDestUsr.Werks = await this._getLastItemData("/T_DEST_USR", "", "Divisione");

              await this._saveHana("/T_TP_MAN1", sFinalitaEx);
            } else { // Modifica
              sURL = this.componiCancelURL(sFinalitaEx)
              await this._updateHana(sURL, sFinalitaEx);
            }
          }
          MessageBox.success("Excel Caricato con successo");
          sap.ui.core.BusyIndicator.hide(0);
          var aT_TP_MAN1 = await this._getTable("/T_TP_MAN1", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_TP_MAN1);
          this.getView().setModel(oModel, "T_TP_MAN1");
          sap.ui.getCore().byId("UploadTable").close();
        }
      }
    },
    FinalitaExcelModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        TipoGestione1: (sValue[oResources.getText("Finalita")] === undefined) ? undefined : sValue[oResources.getText("Finalita")].toString(),
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        DesTipoGest1: (sValue[oResources.getText("DescrizioneFinalita")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneFinalita")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue;
    },

  });
});
