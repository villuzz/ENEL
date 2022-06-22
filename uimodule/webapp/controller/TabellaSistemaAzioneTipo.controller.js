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
  'sap/ui/core/library',
  "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, Filter, FilterOperator, MessageToast, coreLibrary, Validator) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;
  var ValueState = coreLibrary.ValueState;
  return Controller.extend("PM030.APP1.controller.TabellaSistemaAzioneTipo", {
    Validator: Validator,
    onInit: function () {
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      sap.ui.core.BusyIndicator.show();
      this.getOwnerComponent().getRouter().getRoute("TabellaSistemaAzioneTipo").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: async function () {
      Validator.clearValidation();
      // var aT_ACT_SYST = await this._getTable("/T_ACT_SYST", []);
      // var oModel = new sap.ui.model.json.JSONModel();
      // oModel.setData(aT_ACT_SYST);
      // this.getView().setModel(oModel, "T_ACT_SYST");
      var aT_ACT_SYST = {};
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ACT_SYST);
      this.getView().setModel(oModel, "T_ACT_SYST");
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaSistemaAzioneTipo"), componentName: "Piani", persoService: manutenzioneTable }).activate();
      this.getValueHelp();
    },
    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_ACT_SYST: {},
        T001W: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_ACT_SYST = await this._getTableDistinct("/T_ACT_SYST", []);
      var aArray = [];
      sData.T_ACT_SYST.forEach(el => {
        if (!aArray.find(item => item.Werks === el.Werks)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_SYST/Divisione", aArray.filter(a => a.Werks));

      aArray = [];
      sData.T_ACT_SYST.forEach(el => {
        if (!aArray.find(item => item.Sistema === el.Sistema)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_SYST/Sistema", aArray.filter(a => a.Sistema));

      aArray = [];
      sData.T_ACT_SYST.forEach(el => {
        if (!aArray.find(item => item.Txt === el.Txt)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_SYST/Txt", aArray.filter(a => a.Txt));

      sData.DIVISIONENew = await this.Shpl("T001W", "CH");
      oModelHelp.setProperty("/T001W/DivisioneNew", sData.DIVISIONENew);

      sData.ACT_SYST = await this._getTable("/T_ACT_SYST", []);
      aArray = []
      sData.ACT_SYST.forEach(el => {
        if (!aArray.find(item => item.Sistema === el.Sistema)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_SYST/SistemaNew", aArray.filter(a => a.Sistema));


      aArray = []
      sData.ACT_SYST.forEach(el => {
        if (!aArray.find(item => item.Txt === el.Txt)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_SYST/TxtNew", aArray.filter(a => a.Txt));

      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },

    onSearchResult: function () {
      this.onSearchFilters();
    },
    onBackDetail: function () {
      this.byId("navCon").back();
    },
    onSearchFilters: async function () {
      debugger
      var aFilters = [];
      if (this.getView().byId("cbDivisione").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Werks"));
      }
      if (this.getView().byId("cbSistema").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbSistema").getSelectedKeys(), "Sistema"));
      }
      if (this.getView().byId("cbTesto").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbTesto").getSelectedKeys(), "Txt"));
      }
      var model = this.getView().getModel("T_ACT_SYST");
      var tableFilters = await this._getTableNoError("/T_ACT_SYST", aFilters);
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
        return aFilter;
      }
    },
    onDataExport: function () {
      var selectedTab = this.byId("tbTabellaSistemaAzioneTipo");
      var selIndex = this.getView().byId("tbTabellaSistemaAzioneTipo").getSelectedItems();

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      if (selIndex.length >= 1) {
        var aArray = [];
        for (let i = 0; i < selIndex.length; i++) {
          var oContext = selIndex[i].getBindingContext("T_ACT_SYST").getObject()
          aArray.push(oContext);
        }
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aArray,
          fileName: "TabellaSistemaAzioneTipo.xlsx",
          worker: false
        };
      } else {
        var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
        oSettings = {
          workbook: {
            columns: aCols
          },
          dataSource: aFilters,
          fileName: "TabellaSistemaAzioneTipo.xlsx",
          worker: false
        };
      }
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbTabellaSistemaAzioneTipo").getColumns().map((c) => {
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
      var items = this.getView().byId("tbTabellaSistemaAzioneTipo").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_ACT_SYST").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ACT_SYST").getObject());
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
      var items = this.getView().byId("tbTabellaSistemaAzioneTipo").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ACT_SYST").getObject());
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
      var sel = this.getView().byId("tbTabellaSistemaAzioneTipo").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_ACT_SYST").getObject());
        line = JSON.parse(line);
        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._removeHana(sURL);
      }
      this.getView().byId("tbTabellaSistemaAzioneTipo").removeSelections();
      var aT_ACT_SYST = await this._getTable("/T_ACT_SYST", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ACT_SYST);
      this.getView().setModel(oModel, "T_ACT_SYST");
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
            delete line.__metadata
            // get Last Index
            await this._saveHana("/T_ACT_SYST", line);
          } else {
            var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
            await this._updateHana(sURL, line);
          }
          var aT_ACT_SYST = await this._getTable("/T_ACT_SYST", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_ACT_SYST);
          this.getView().setModel(oModel, "T_ACT_SYST");
          this.getValueHelp();
          this.byId("navCon").back();
        }
      }
    },
    onCloseFileUpload: function () {
      this.byId("UploadTable").close();
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
            var sRaggruppamento = this.SistemaModel(rows[i]);
            if (sRaggruppamento.Werks.startsWith("C-")) { //Creazione                  
              // sRaggruppamento.Werks = await this._getLastItemData("/T_ACT_SYST", "", "Divisione");

              await this._saveHana("/T_ACT_SYST", sRaggruppamento);
            } else { // Modifica

              sURL = this.componiURLExcel(sRaggruppamento)
              await this._updateHana(sURL, sRaggruppamento);
            }
          }
          MessageBox.success("Excel Caricato con successo");
          sap.ui.core.BusyIndicator.hide(0);
          var sT_ACT_SYST = await this._getTable("/T_ACT_SYST", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(sT_ACT_SYST);
          this.getView().setModel(oModel, "T_ACT_SYST");
          this.byId("UploadTable").close();
        }
      }
    },
    onCloseFileUpload: function () {
      // this.onSearch();
      this._oValueHelpDialog.destroy();
    },
    componiURLExcel: function (line) {
      debugger
      var sURL = `/T_ACT_SYST(Werks='${line.Werks}',Sistema='${line.Sistema}')`;

      // return encodeURIComponent(sURL);
      return sURL;
    },
    SistemaModel: function (sValue) {
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Txt: (sValue[oResources.getText("Testo")] === undefined) ? undefined : sValue[oResources.getText("Testo")].toString()
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
        Divisione: "",
        Sistema: "",
        Txt: ""
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
      if (sData.Txt === "" || sData.Txt === undefined || sData.Txt === null) {
        return "Inserire Testo";
      }
      return "";
    },
  });
});
