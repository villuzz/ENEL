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

  return Controller.extend("PM030.APP1.controller.TabellaDestinatariUtenti", {
    onInit: function () {

      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      this.getOwnerComponent().getRouter().getRoute("TabellaDestinatariUtenti").attachPatternMatched(this._onObjectMatched, this);
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaDestinatariUtenti"), componentName: "Piani", persoService: manutenzioneTable }).activate();


    },
    _onObjectMatched: async function () {
      debugger
      sap.ui.core.BusyIndicator.show();
      var aT_DEST_USR = await this._getTable("/T_DEST_USR", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_DEST_USR);
      this.getView().setModel(oModel, "T_DEST_USR");

      this.getValueHelp();
    },
    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_DEST_USR: {},
        T001W: {},
        ZPM4R_H_DEST_URS: {},
        ZPM4R_H_RAG: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_DEST_USR = await this._getTableDistinct("/T_DEST_USR", []);
      var aArray = [];
      sData.T_DEST_USR.forEach(el => {
        if (!aArray.find(item => item.Werks === el.Werks)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST_USR/Werks", aArray.filter(a => a.Werks));

      aArray = [];
      sData.T_DEST_USR.forEach(el => {
        if (!aArray.find(item => item.Arbpl === el.Arbpl)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST_USR/Arbpl", aArray.filter(a => a.Arbpl));

      aArray = [];
      sData.T_DEST_USR.forEach(el => {
        if (!aArray.find(item => item.Destinatario === el.Destinatario)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST_USR/Destinatario", aArray.filter(a => a.Destinatario));

      aArray = [];
      sData.T_DEST_USR.forEach(el => {
        if (!aArray.find(item => item.Raggruppamento === el.Raggruppamento)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST_USR/Raggruppamento", aArray.filter(a => a.Raggruppamento));

      aArray = [];
      sData.T_DEST_USR.forEach(el => {
        if (!aArray.find(item => item.Uname === el.Uname)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_DEST_USR/Uname", aArray.filter(a => a.Uname));
      sData.DIVISIONENew = await this.Shpl("T001W", "CH");
      oModelHelp.setProperty("/T001W/DivisioneNew", sData.DIVISIONENew);
      sData.aDESTINATARIO = await this.Shpl("ZPM4R_H_DEST_URS", "SH");
      aArray = [];
      sData.aDESTINATARIO.forEach(el => {
        if (!aArray.find(item => item.Fieldname3 === el.Fieldname3)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/ZPM4R_H_DEST_URS/aDESTINATARIO", aArray.filter(a => a.Fieldname3));
      aArray = [];
      sData.aRAGGRUPPAMENTO = await this.Shpl("ZPM4R_H_RAG", "SH");
      oModelHelp.setProperty("/ZPM4R_H_RAG/aRAGGRUPPAMENTO", sData.aRAGGRUPPAMENTO.filter(a => a.Fieldname1));

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
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDivisione").getSelectedKeys(), "Werks"));
      }
      if (this.getView().byId("cbCdlavoro").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbCdlavoro").getSelectedKeys(), "Arbpl"));
      }
      if (this.getView().byId("cbDestinatario").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbDestinatario").getSelectedKeys(), "Destinatario"));
      }
      if (this.getView().byId("cbRaggruppamento").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbRaggruppamento").getSelectedKeys(), "Raggruppamento"));
      }
      if (this.getView().byId("cbUtente").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbUtente").getSelectedKeys(), "Uname"));
      }
      this.byId("tbTabellaDestinatariCdl").getBinding("items").filter(aFilters);
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
      var selectedTab = this.byId("tbTabellaDestinatariUtenti");

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
        fileName: "TabellaDestinatariUtenti.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },


    _createColumnConfig: function () {
      var oCols = this.byId("tbTabellaDestinatariUtenti").getColumns().map((c) => {
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
            var sDestUsr = this.DESTUSERModel(rows[i]);
            if (sDestUsr.Werks.startsWith("C-")) { //Creazione                  
              // sDestUsr.Werks = await this._getLastItemData("/T_DEST_USR", "", "Divisione");

              await this._saveHana("/T_DEST_USR", sDestUsr);
            } else { // Modifica
              sURL = this.componiURLExcel(sDestUsr)
              await this._updateHana(sURL, sDestUsr);
            }
          }
          MessageBox.success("Excel Caricato con successo");
          sap.ui.core.BusyIndicator.hide(0);
          var aT_DEST_USR = await this._getTable("/T_DEST_USR", []);
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(aT_DEST_USR);
          this.getView().setModel(oModel, "T_DEST_USR");
          this.byId("UploadTable").close();
        }
      }
    },
    DESTUSERModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Arbpl: (sValue[oResources.getText("CentroDiLavoro")] === undefined) ? undefined : sValue[oResources.getText("CentroDiLavoro")].toString(),
        Destinatario: (sValue[oResources.getText("Destinatario")] === undefined) ? undefined : sValue[oResources.getText("Destinatario")].toString(),
        Uname: (sValue[oResources.getText("Utente")] === undefined) ? undefined : sValue[oResources.getText("Utente")].toString(),
        Object: (sValue[oResources.getText("AOP")] === undefined) ? undefined : sValue[oResources.getText("AOP")].toString(),
        Id: (sValue[oResources.getText("AF")] === undefined) ? undefined : sValue[oResources.getText("AF")].toString(),
        Auto: (sValue[oResources.getText("ZAP")] === undefined) ? undefined : sValue[oResources.getText("ZAP")].toString(),
        Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
      };
      return rValue;
    },
    componiURLExcel: function (line) {
      debugger
      var sURL = `/T_DEST_USR(Werks='${line.Werks}',Arbpl='${line.Arbpl}',Destinatario='${line.Destinatario}',Uname='${line.Uname}',Object='${line.Object}',Id='${line.Id}',Auto='${line.Auto}')`;

      return sURL;
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
        var oTable = this.byId("tbTabellaDestinatariUtenti");
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
      this._oValueHelpDialog.destroy();

    },


    onSave: async function () {
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);

      if (line.ID === "New") {
        delete line.ID;
        // get Last Index
        // var sDestUsr = this.DESTUSERModel(line);
        await this._saveHana("/T_DEST_USR", line);
        var aT_RAGRR = await this._getTable("/T_DEST_USR", []);
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_RAGRR);
        this.getView().setModel(oModel, "T_DEST_USR");
      } else {
        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._updateHana(sURL, line);
        aT_RAGRR = await this._getTable("/T_DEST_USR", []);
        oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(aT_RAGRR);
        this.getView().setModel(oModel, "T_DEST_USR");
      }
      this.byId("navCon").back();

    },
    onNuovo: function () {
      debugger
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
    onCopy: function () {
      sap.ui.core.BusyIndicator.show();
      this.getView().getModel("oDataModel").setProperty("/Enabled", true);
      var items = this.getView().byId("tbTabellaDestinatariUtenti").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_DEST_USR").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onModify: function () {
      debugger
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbTabellaDestinatariUtenti").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_DEST_USR").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_DEST_USR").getObject());
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },

  });
});
