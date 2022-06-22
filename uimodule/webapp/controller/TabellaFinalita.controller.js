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
  'sap/ui/core/library',
  "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, Filter, FilterOperator, MessageToast, manutenzioneTable, coreLibrary, Validator) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;
  var ValueState = coreLibrary.ValueState;
  return Controller.extend("PM030.APP1.controller.TabellaFinalita", {
    Validator: Validator,
    onInit: function () {
      sap.ui.core.BusyIndicator.show();
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      this.getOwnerComponent().getRouter().getRoute("TabellaFinalita").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: async function () {
      Validator.clearValidation();
      var aT_TP_MAN1 = {};
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_TP_MAN1);
      this.getView().setModel(oModel, "T_TP_MAN1");
      this._mViewSettingsDialogs = {};
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaFinalita"), componentName: "Piani", persoService: manutenzioneTable }).activate();

      this.getValueHelp();
    },
    getValueHelp: async function () {
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_TP_MAN1: {},
        T001W: {},
        T_RAGGR: {}
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
      oModelHelp.setProperty("/T_RAGGR/Raggruppamento", aArray.filter(a => a.Raggruppamento));
      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },

    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: async function () {
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

      var model = this.getView().getModel("T_TP_MAN1");
      var tableFilters = await this._getTableNoError("/T_TP_MAN1", aFilters);
      if (tableFilters.length === 0) {
        MessageBox.error("Nessun record trovato");
        model.setData({});
      }
      model.setData(tableFilters);
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
        return new Filter({filters: aFilter, bAnd: false});
      }
    },
    onNuovo: function () {
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
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
      var ControlValidate = Validator.validateView();
      if (ControlValidate) {
        var line = JSON.stringify(this.getView().getModel("sDetail").getData());
        line = JSON.parse(line);
        var msg = "",
          sURL;
        msg = await this.ControlIndex(line);
        if (msg !== "") {
          MessageBox.error(msg);
        } else {
          var line = JSON.stringify(this.getView().getModel("sDetail").getData());
          line = JSON.parse(line);

          if (line.ID === "New") {
            delete line.ID;
            // get Last Index
            var sFinalita = this.FinalitaModel(line);
            await this._saveHana("/T_TP_MAN1", sFinalita);
          } else {
            var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
            await this._updateHana(sURL, line);
          }
          var aT_RAGRR = await this._getTable("/T_TP_MAN1", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_RAGRR);
          this.getView().setModel(oModel, "T_TP_MAN1");
          this.byId("navCon").back();
        }
      }
    },
    FinalitaModel: function (sValue) {
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
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
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
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
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
      var selIndex = this.getView().byId("tbTabellaFinalita").getSelectedItems();

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      if (selIndex.length >= 1) {
        var aArray = [];
        for (let i = 0; i < selIndex.length; i++) {
          var oContext = selIndex[i].getBindingContext("T_TP_MAN1").getObject()
          aArray.push(oContext);
        }
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aArray,
          fileName: "TabellaFinalita.xlsx",
          worker: false
        }
      } else {
        var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aFilters,
          fileName: "TabellaFinalita.xlsx",
          worker: false
        };
      }

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
        }
        for (let i = 0; i < rows.length; i++) {
          var sFinalitaEx = this.FinalitaExcelModel(rows[i]);
          sURL = this.componiCancelURL(sFinalitaEx)
          var result = await this._updateHanaNoError(sURL, sFinalitaEx);
          if (result.length === 0) {
            await this._saveHanaNoError("/T_ATTPM", sFinalitaEx);
          }
        }
        MessageBox.success("Excel Caricato con successo");
        this.getValueHelp();
      }
      var aT_ATTPM = await this._getTable("/T_ATTPM", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ATTPM);
      this.getView().setModel(oModel, "T_ATTPM");
      sap.ui.getCore().byId("UploadTable").close();
      sap.ui.core.BusyIndicator.hide(0);
    },
    FinalitaExcelModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        TipoGestione1: (sValue[oResources.getText("Finalita")] === undefined) ? undefined : sValue[oResources.getText("Finalita")].toString(),
        Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        DesTipoGest1: (sValue[oResources.getText("DescrizioneFinalita")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneFinalita")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue;
    },
    handleChangeCb: function (oEvent) {
      var oValidatedComboBox = oEvent.getSource(),
        sSelectedKey = oValidatedComboBox.getSelectedKey(),
        sValue = oValidatedComboBox.getValue();

      if (!sSelectedKey && sValue) {
        oValidatedComboBox.setValueState(ValueState.Error);
      } else {
        oValidatedComboBox.setValueState(ValueState.None);
      }
    },
    handleChangeIn: function (oEvent) {
      var oValidatedInput = oEvent.getSource(),
        sSuggestion = oEvent.getSource().getSuggestionRows(),
        sValue = oValidatedInput.getValue();
      if (!_.contains(sSuggestion, sValue)) {
        oValidatedInput.setValueState(ValueState.Error);
      } else {
        oValidatedInput.setValueState(ValueState.None);
      }
    },
    initModel: function () {
      var sData = {
        TipoGestione1: "",
        Divisione: "",
        DesTipoGest1: "",
        Raggruppamento: ""
      }
      return sData;
    },
    ControlIndex: function (sData) {

      if (sData.TipoGestione1 === "" || sData.TipoGestione1 === undefined || sData.TipoGestione1 === null) {
        return "Inserire Finalità";
      }
      if (sData.Divisione === "" || sData.Divisione === undefined || sData.Divisione === null) {
        return "Inserire Divisione";
      }
      return "";
    },
  });
});
