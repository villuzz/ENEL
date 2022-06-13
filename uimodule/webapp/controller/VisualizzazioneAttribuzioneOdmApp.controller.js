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
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, MessageToast, Filter, FilterOperator, manutenzioneTable, ) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.VisualizzazioneAttribuzioneOdmApp", {
    onInit: function () {
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      sap.ui.core.BusyIndicator.show();
      this.getOwnerComponent().getRouter().getRoute("VisualizzazioneAttribuzioneOdmApp").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbVisualizzazioneAttribuzioneOdmApp"), componentName: "Piani", persoService: manutenzioneTable }).activate();

    },
    _onObjectMatched: async function () {
      var aT_APP_WO = await this._getTable("/T_APP_WO", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_APP_WO);
      this.getView().setModel(oModel, "T_APP_WO");
      this.getValueHelp();
    },

    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_APP_WO: {},
        T001W: {},
        ZPM4R_H_RAG: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_APP_WO = await this._getTable("/T_APP_WO", []);
      var aArray = [];
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.IndexOdm === el.IndexOdm)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/IndexOdm", aArray.filter(a => a.IndexOdm));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Zcount === el.Zcount)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Zcount", aArray.filter(a => a.Zcount));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Appuntam === el.Appuntam)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Appuntam", aArray.filter(a => a.Appuntam));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Aufpl === el.Aufpl)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Aufpl", aArray.filter(a => a.Aufpl));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.StatoOdm === el.StatoOdm)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/StatoOdm", aArray.filter(a => a.StatoOdm));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.DettConf === el.DettConf)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/DettConf", aArray.filter(a => a.DettConf));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Aplzl === el.Aplzl)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Aplzl", aArray.filter(a => a.Aplzl));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Aplzl1 === el.Aplzl1)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Aplzl1", aArray.filter(a => a.Aplzl1));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Aplzl2 === el.Aplzl2)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Aplzl2", aArray.filter(a => a.Aplzl2));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Aplzl3 === el.Aplzl3)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Aplzl3", aArray.filter(a => a.Aplzl3));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Aplzl4 === el.Aplzl4)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Aplzl4", aArray.filter(a => a.Aplzl4));

      aArray = []
      sData.T_APP_WO.forEach(el => {
        if (!aArray.find(item => item.Aplzl5 === el.Aplzl5)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_APP_WO/Aplzl5", aArray.filter(a => a.Aplzl5));

      this.getView().setModel(oModelHelp, "sHelp");
      sap.ui.core.BusyIndicator.hide();
    },
    

    onSearchResult: function () {
      this.onSearchFilters();
    },
    onSearchFilters: function () {
      debugger
      var aFilters = [];
      if (this.getView().byId("cbIndex").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbIndex").getSelectedKeys(), "IndexOdm"));
      }
      if (this.getView().byId("cbCont").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbCont").getSelectedKeys(), "Zcount"));
      }
      if (this.getView().byId("cbAppuntamenti").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbAppuntamenti").getSelectedKeys(), "Appuntam"));
      }
      if (this.getView().byId("cbOdm").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbOdm").getSelectedKeys(), "Aufpl"));
      }
      if (this.getView().byId("cbStatoODM").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbStatoODM").getSelectedKeys(), "StatoOdm"));
      }
      if (this.getView().byId("cbDettaglioConferma").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDettaglioConferma").getSelectedKeys(), "DettConf"));
      }
      this.byId("tbVisualizzazioneAttribuzioneOdmApp").getBinding("items").filter(aFilters);
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
      var selectedTab = this.byId("tbVisualizzazioneAttribuzioneOdmApp");

      var aCols,
        oRowBinding,
        oSettings,
        oSheet;

      aCols = this._createColumnConfig(selectedTab);
      oRowBinding = selectedTab.getBinding("items");
      var aFilters = oRowBinding.aIndices.map((i)=> selectedTab.getBinding("items").oList[i]);
      oSettings = {
        workbook: {
          columns: aCols
        },
        dataSource: aFilters,
        fileName: "VisualizzazioneAttribuzioneOdmApp.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbVisualizzazioneAttribuzioneOdmApp").getColumns().map((c) => {
        var templ = "";
        var typ = EdmType.String;
        //var prop = c.mAggregations.header.getText(); 
        var prop = c.getCustomData()[0].getValue();

        if (prop === "DataPianificazione") {
          typ = EdmType.Date;
        }
        if (prop === "FineCardine") {
          typ = EdmType.Date;
        }
        if (prop === "ScadNaturale") {
          typ = EdmType.Date;
        }

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
        var oTable = this.byId("tbVisualizzazioneAttribuzioneOdmApp");
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

    // onSave: function (oEvent) {
    //   var dataP = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts.mManutenzione.getObject().DataPianificazione;
    //   var finCar = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts.mManutenzione.getObject().FineCardine;
    //   var scadNat = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts.mManutenzione.getObject().ScadNaturale;
    //   if (dataP) {
    //     dataP.setHours(2);
    //   }
    //   if (finCar) {
    //     finCar.setHours(2);
    //   }
    //   if (scadNat) {
    //     scadNat.setHours(2);
    //   }
    //   this.byId("navCon").back();
    // }
    onNuovo: function () {

      sap.ui.core.BusyIndicator.show();
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({ ID: "New" });
      this.getView().setModel(oModel, "sDetail");
      this.byId("navCon").to(this.byId("Detail"));
      sap.ui.core.BusyIndicator.hide();
    },
    onSave: async function () {
      debugger
      // // sap.ui.core.BusyIndicator.show();
      // var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      // line = JSON.parse(line);
      var line = Object.assign({}, this.getView().getModel("sDetail").getData());
      line = this.VisualizzazioneModel(line);
      // var metadata = line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length -1];
      if (line.ID === "New") {
        // get Last Index
        delete line.ID;
        await this._saveHana("/T_APP_WO", line);
      } else {
        // line = this.DestinatariModelSave(line);
        // delete line.__metadata
        var sURL = this.componiURL(line);
        // var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];

        await this._updateHana(sURL, line);
      }
      var aT_APP_WO = await this._getTable("/T_APP_WO", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_APP_WO);
      this.getView().setModel(oModel, "T_APP_WO");
      this.getValueHelp();
      this.byId("navCon").back();
    },
    // VisualizzazioneModel: function (sValue) {
    //   debugger
    //   var oResources = this.getResourceBundle();
    //   var rValue = {
    //     Zcount: (sValue[oResources.getText("Contatore1")] === undefined) ? undefined : sValue[oResources.getText("Contatore1")].toString(),
    //     IndexOdm: (sValue[oResources.getText("Index")] === undefined) ? undefined : sValue[oResources.getText("Index")].toString(),
    //     Appuntam: (sValue[oResources.getText("Appuntamenti")] === undefined) ? undefined : sValue[oResources.getText("Appuntamenti")].toString(),
    //     Aufnr: (sValue[oResources.getText("Odm")] === undefined) ? undefined : sValue[oResources.getText("Odm")].toString(),
    //     NOper: (sValue[oResources.getText("NoOper")] === undefined) ? undefined : sValue[oResources.getText("NoOper")].toString(),
    //     NOper1: (sValue[oResources.getText("NoOper1")] === undefined) ? undefined : sValue[oResources.getText("NoOper1")].toString(),
    //     NOper2: (sValue[oResources.getText("NoOper2")] === undefined) ? undefined : sValue[oResources.getText("NoOper2")].toString(),
    //     NOper3: (sValue[oResources.getText("NoOper3")] === undefined) ? undefined : sValue[oResources.getText("NoOper3")].toString(),
    //     NOper4: (sValue[oResources.getText("NoOper4")] === undefined) ? undefined : sValue[oResources.getText("NoOper4")].toString(),
    //     NOper5: (sValue[oResources.getText("NoOper5")] === undefined) ? undefined : sValue[oResources.getText("NoOper5")].toString(),
    //     Qmnum: (sValue[oResources.getText("Werks")] === undefined) ? undefined : sValue[oResources.getText("Werks")].toString()
    //   };
    //   return rValue
    // },
    VisualizzazioneModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      // var a = "2022-01-01T23:01:00.UTC";
      // var a = new Date().toISOString();
      var a = "2016-12-01T23:00:00+00:00";
      var rValue = {
        Zcount: (sValue[oResources.getText("Zcount")] === undefined) ? undefined : sValue[oResources.getText("Zcount")].toString(),
        IndexOdm: (sValue[oResources.getText("IndexOdm")] === undefined) ? undefined : sValue[oResources.getText("IndexOdm")].toString(),
        Appuntam: (sValue[oResources.getText("Appuntam")] === undefined) ? undefined : sValue[oResources.getText("Appuntam")].toString(),
        Aufnr: (sValue[oResources.getText("Aufnr")] === undefined) ? undefined : sValue[oResources.getText("Aufnr")].toString(),
        Aufpl: (sValue[oResources.getText("Aufpl")] === undefined) ? undefined : sValue[oResources.getText("Aufpl")].toString(),
        Aplzl: (sValue[oResources.getText("Aplzl")] === undefined) ? undefined : sValue[oResources.getText("Aplzl")].toString(),
        Aplzl1: (sValue[oResources.getText("Aplzl1")] === undefined) ? undefined : sValue[oResources.getText("Aplzl1")].toString(),
        Aplzl2: (sValue[oResources.getText("Aplzl2")] === undefined) ? undefined : sValue[oResources.getText("Aplzl2")].toString(),
        Aplzl3: (sValue[oResources.getText("Aplzl3")] === undefined) ? undefined : sValue[oResources.getText("Aplzl3")].toString(),
        Aplzl4: (sValue[oResources.getText("Aplzl4")] === undefined) ? undefined : sValue[oResources.getText("Aplzl4")].toString(),
        Aplzl5: (sValue[oResources.getText("Aplzl5")] === undefined) ? undefined : sValue[oResources.getText("Aplzl5")].toString(),
        Qmnum: (sValue[oResources.getText("Qmnum")] === undefined) ? undefined : sValue[oResources.getText("Qmnum")].toString(),
        NumIntervento: (sValue[oResources.getText("NumIntervento")] === undefined) ? undefined : sValue[oResources.getText("NumIntervento")].toString(),
        StatoOdm: (sValue[oResources.getText("StatoOdm")] === undefined) ? undefined : sValue[oResources.getText("StatoOdm")].toString(),
        DettConf: (sValue[oResources.getText("DettConf")] === undefined) ? undefined : sValue[oResources.getText("DettConf")].toString(),
        DataPian: (sValue[oResources.getText("DataPian")] === undefined) ? undefined : a,
        DataFineCard: (sValue[oResources.getText("DataFineCard")] === undefined) ? undefined : a,
        DataPianNatur: (sValue[oResources.getText("DataPianNatur")] === undefined) ? undefined : a,
        Aggregatore: (sValue[oResources.getText("Aggregatore")] === undefined) ? undefined : sValue[oResources.getText("Aggregatore")].toString(),
        DescAggregatore: (sValue[oResources.getText("DescAggregatore")] === undefined) ? undefined : sValue[oResources.getText("DescAggregatore")].toString(),
      };
      return rValue
    },
    componiURL: function (line) {
      var sURL = `/T_APP_WO(Zcount='${line.Zcount}',IndexOdm='${line.IndexOdm}',Appuntam=${line.Appuntam},Aufnr='${line.Aufnr}',Aufpl='${line.Aufpl}',Aplzl='${line.Aplzl}',Aplzl1='${line.Aplzl1}',Aplzl2='${line.Aplzl2}',Aplzl3='${line.Aplzl3}',Aplzl4='${line.Aplzl4}',Aplzl5='${line.Aplzl5}',Qmnum='${line.Qmnum}')`;
      return sURL;
    },
    onBackDetail: function () {
      this.byId("navCon").back();
    },
    onModify: function () {
      debugger
      this.getView().getModel().setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbVisualizzazioneAttribuzioneOdmApp").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_APP_WO").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_APP_WO").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
  });
});
