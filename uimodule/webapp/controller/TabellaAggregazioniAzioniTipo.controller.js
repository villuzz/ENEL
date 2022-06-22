sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/TablePersoController",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
  'sap/ui/core/routing/History',
  'sap/m/MessageToast',
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  "PM030/APP1/util/manutenzioneTable",
  'sap/ui/core/library',
  "PM030/APP1/util/Validator"
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, MessageToast, Filter, FilterOperator, manutenzioneTable, coreLibrary, Validator) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;
  var ValueState = coreLibrary.ValueState;
  return Controller.extend("PM030.APP1.controller.TabellaAggregazioniAzioniTipo", {
    Validator: Validator,
    onInit: function () {
      sap.ui.core.BusyIndicator.show();
      this.getOwnerComponent().getRouter().getRoute("TabellaAggregazioniAzioniTipo").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: async function () {
      Validator.clearValidation();
      var aT_AGGREG = {};
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_AGGREG);
      this.getView().setModel(oModel, "T_AGGREG");
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      this.getValueHelp();
    },
    getValueHelp: async function () {
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_AGGREG: {},
        H_T001W_C: {},
        T_ACT_SYST: {},
        T_ACT_CLAS: {}
      })
      oModelHelp.setSizeLimit(2000);
      sData.T_AGGREG = await this._getTable("/T_AGGREG", []);
      var aArray = [];
      sData.T_AGGREG.forEach(el => {
        if (!aArray.find(item => item.Werks === el.Werks)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_AGGREG/Divisione", aArray.filter(a => a.Werks));

      aArray = [];
      sData.T_AGGREG.forEach(el => {
        if (!aArray.find(item => item.Sistema === el.Sistema)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_AGGREG/Sistema", aArray.filter(a => a.Sistema));

      aArray = [];
      sData.T_AGGREG.forEach(el => {
        if (!aArray.find(item => item.Classe === el.Classe)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_AGGREG/Classe", aArray.filter(a => a.Classe));

      aArray = [];
      sData.T_AGGREG.forEach(el => {
        if (!aArray.find(item => item.ProgAggr === el.ProgAggr)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_AGGREG/ProgAggr", aArray.filter(a => a.ProgAggr));

      aArray = [];
      sData.T_AGGREG.forEach(el => {
        if (!aArray.find(item => item.AggrActTitle === el.AggrActTitle)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_AGGREG/AggrActTitle", aArray.filter(a => a.AggrActTitle));

      aArray = [];
      sData.T_AGGREG.forEach(el => {
        if (!aArray.find(item => item.AggrActComponent === el.AggrActComponent)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_AGGREG/AggrActComponent", aArray.filter(a => a.AggrActComponent));

      sData.DIVISIONENew = await this.Shpl("H_T001W", "SH");
      sData.DIVISIONENew.forEach(el => {
        if (!aArray.find(item => item.Fieldname1 === el.Fieldname1)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/H_T001W_C/DIVISIONENew", aArray.filter(a => a.Fieldname1));

      aArray = [];
      sData.SISTEMANew = await this._getTable("/T_ACT_SYST", []);
      sData.SISTEMANew.forEach(el => {
        if (!aArray.find(item => item.Sistema === el.Sistema)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_SYST/SISTEMANew", aArray.filter(a => a.Sistema));

      aArray = [];
      sData.CLASSENew = await this._getTable("/T_ACT_CL", []);
      sData.CLASSENew.forEach(el => {
        if (!aArray.find(item => item.Classe === el.Classe)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_CLAS/SISTEMANew", aArray.filter(a => a.Classe));


      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },

    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: async function () {
      var aFilters = [];
      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Werks"));
      }
      if (this.getView().byId("cbSistema").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbSistema").getSelectedKeys(), "Sistema"));
      }
      if (this.getView().byId("cbClasse").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbClasse").getSelectedKeys(), "Classe"));
      }
      if (this.getView().byId("cbDescNProAggr").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDescNProAggr").getSelectedKeys(), "ProgAggr"));
      }
      if (this.getView().byId("cbTitoloAzioneAggregativo").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbTitoloAzioneAggregativo").getSelectedKeys(), "AggrActTitle"));
      }
      if (this.getView().byId("cbComponenteAzioneAggregativo").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbComponenteAzioneAggregativo").getSelectedKeys(), "AggrActComponent"));
      }
      var model = this.getView().getModel("T_AGGREG");
      var tableFilters = await this._getTableNoError("/T_AGGREG", aFilters);
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
    onDataExport: function () {
      var selectedTab = this.byId("tbTabellaAggregazioniAzioniTipo");
      var selIndex = this.getView().byId("tbTabellaAggregazioniAzioniTipo").getSelectedItems();

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      if (selIndex.length >= 1) {
        var aArray = [];
        for (let i = 0; i < selIndex.length; i++) {
          var oContext = selIndex[i].getBindingContext("T_AGGREG").getObject()
          aArray.push(oContext);
        }
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aArray,
          fileName: "TabellaAggregazioniAzioniTipo.xlsx",
          worker: false
        };
      } else {
        var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aFilters,
          fileName: "TabellaAggregazioniAzioniTipo.xlsx",
          worker: false
        };
      }


      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbTabellaAggregazioniAzioniTipo").getColumns().map((c) => {
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


    onNuovo: function () {
      sap.ui.core.BusyIndicator.show();
      this.resetValueState();
      var oModel = new sap.ui.model.json.JSONModel();
      var sIndex = {},
        sIndex = this.initModel()
      oModel.setData(sIndex);
      this.getView().setModel(oModel, "sSelect");
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
      sap.ui.core.BusyIndicator.show();
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({ ID: "New" });
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },
    resetValueState: function () {
      //Get All fields
      var allRegisteredControls = sap.ui.getCore().byFieldGroupId("");
      var aComboBox = allRegisteredControls.filter(c => c.isA("sap.m.ComboBox"));

      for (var i = 0; i < aComboBox.length; i++) {
        if (aComboBox[i].getValueState() === sap.ui.core.ValueState.Error) {
          aComboBox[i].setValueState("None")
        }
      }
    },

    onModify: function () {
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbTabellaAggregazioniAzioniTipo").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_AGGREG").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_AGGREG").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
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
          if (line.ID === "New") {
            // get Last Index
            delete line.ID;
            // line = this.AggregCancelModel(line);
            await this._saveHana("/T_AGGREG", line);
          } else {
            // line = this.DestinatariModelSave(line);
            delete line.__metadata
            var sURL = this.componiURL(line);
            // var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];

            await this._updateHana(sURL, line);
          }
          var aT_AGGREG = await this._getTable("/T_AGGREG", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_AGGREG);
          this.getView().setModel(oModel, "T_AGGREG");
          this.getValueHelp();
          this.byId("navCon").back();
        }
      }
    },
    AggregModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Classe: (sValue[oResources.getText("Classe")] === undefined) ? undefined : sValue[oResources.getText("Classe")].toString(),
        ProgAggr: (sValue[oResources.getText("NProAggre")] === undefined) ? undefined : sValue[oResources.getText("NProAggre")].toString(),
        AggrActTitle: (sValue[oResources.getText("TitoloAzioneAggregativo")] === undefined) ? undefined : sValue[oResources.getText("TitoloAzioneAggregativo")].toString(),
        AggrActComponent: (sValue[oResources.getText("ComponenteAzioneAggregativo")] === undefined) ? undefined : sValue[oResources.getText("ComponenteAzioneAggregativo")].toString(),
      };
      return rValue;
    },
    componiURL: function (line) {
      var sURL = `/T_AGGREG(Werks='${line.Werks}',Sistema='${line.Sistema}',Classe='${line.Classe}',ProgAggr='${line.ProgAggr}')`;

      // return encodeURIComponent(sURL);
      return sURL;
    },
    onCancel: async function () {
      var sel = this.getView().byId("tbTabellaAggregazioniAzioniTipo").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_AGGREG").getObject());
        line = JSON.parse(line);
        line = this.AggregCancelModel(line);
        var sURL = this.componiURL(line);
        await this._removeHana(sURL);
      }
      this.getView().byId("tbTabellaAggregazioniAzioniTipo").removeSelections();
      var aT_AGGREG = await this._getTable("/T_AGGREG", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_AGGREG);
      this.getView().setModel(oModel, "T_AGGREG");
    },


    onBackDetail: function () {
      this.byId("navCon").back();
    },
    AggregCancelModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Werks")] === undefined) ? undefined : sValue[oResources.getText("Werks")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Classe: (sValue[oResources.getText("Classe")] === undefined) ? undefined : sValue[oResources.getText("Classe")].toString(),
        ProgAggr: (sValue[oResources.getText("ProgAggr")] === undefined) ? undefined : sValue[oResources.getText("ProgAggr")].toString(),
        AggrActTitle: (sValue[oResources.getText("AggrActTitle")] === undefined) ? undefined : sValue[oResources.getText("AggrActTitle")].toString(),
        AggrActComponent: (sValue[oResources.getText("AggrActComponent")] === undefined) ? undefined : sValue[oResources.getText("AggrActComponent")].toString(),
      };
      return rValue;
    },
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
      var items = this.getView().byId("tbTabellaAggregazioniAzioniTipo").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_AGGREG").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
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
          var sAggregazioni = this.AggregExcelModel(rows[i]);
          sURL = this.componiURL(sAggregazioni)
          var result = await this._updateHanaNoError(sURL, sAggregazioni);
          if (result.length === 0) {
            await this._saveHanaNoError("/T_AGGREG", sAggregazioni);
          }
        }
        MessageBox.success("Excel Caricato con successo");
      }
      var aT_AGGREG = await this._getTable("/T_AGGREG", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_AGGREG);
      this.getView().setModel(oModel, "T_AGGREG");
      this.getValueHelp();
      sap.ui.getCore().byId("UploadTable").close();
      sap.ui.core.BusyIndicator.hide(0);
    },
    AggregExcelModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Classe: (sValue[oResources.getText("Classe")] === undefined) ? undefined : sValue[oResources.getText("Classe")].toString(),
        ProgAggr: (sValue[oResources.getText("NProAggr")] === undefined) ? undefined : sValue[oResources.getText("NProAggr")].toString(),
        AggrActTitle: (sValue[oResources.getText("TitoloAzioneAggregativo1")] === undefined) ? undefined : sValue[oResources.getText("TitoloAzioneAggregativo1")].toString(),
        AggrActComponent: (sValue[oResources.getText("ComponenteAzioneAggregativo1")] === undefined) ? undefined : sValue[oResources.getText("ComponenteAzioneAggregativo1")].toString(),
      };
      return rValue;
    },
    onCloseFileUpload: function () {
      // this.onSearch();
      this._oValueHelpDialog.destroy();
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
        Werks: "",
        Sistema: "",
        Classe: "",
        ProgAggr: "",
        AggrActTitle: "",
        AggrActComponent: ""
      }
      return sData;
    },
    ControlIndex: function (sData) {

      if (sData.Werks === "" || sData.Werks === undefined || sData.Werks === null) {
        return "Inserire Divisione";
      }
      if (sData.Sistema === "" || sData.Sistema === undefined || sData.Sistema === null) {
        return "Inserire Sistema";
      }
      if (sData.Classe === "" || sData.Classe === undefined || sData.Classe === null) {
        return "Inserire Classe";
      }
      if (sData.ProgAggr === "" || sData.ProgAggr === undefined || sData.ProgAggr === null) {
        return "Inserire ProgAggr";
      }
      return "";
    },
  });
});
