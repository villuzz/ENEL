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

  return Controller.extend("PM030.APP1.controller.TabellaClasseAzioneTipo", {
    onInit: function () {
      var oData = {
        "Enabled": false
      };
      var oModelEnabled = new JSONModel(oData);
      this.getView().setModel(oModelEnabled, "oDataModel");
      sap.ui.core.BusyIndicator.show();
      this.getOwnerComponent().getRouter().getRoute("TabellaClasseAzioneTipo").attachPatternMatched(this._onObjectMatched, this);

    },
    _onObjectMatched: async function () {
      var aT_ACT_CL = await this._getTable("/T_ACT_CL", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ACT_CL);
      this.getView().setModel(oModel, "T_ACT_CL");
      this._oTPC = new TablePersoController({ table: this.byId("tbTabellaClasseAzioneTipo"), componentName: "Piani", persoService: manutenzioneTable }).activate();
      this.getValueHelp();
    },
    getValueHelp: async function () {
      debugger
      var sData = {};
      var oModelHelp = new sap.ui.model.json.JSONModel({
        T_ACT_CL: {},
        H_T001W: {},
        T_ACT_SYST: {},
        T_ACT_CLAS: {}
      });
      oModelHelp.setSizeLimit(2000);
      sData.T_ACT_CL = await this._getTableDistinct("/T_ACT_CL", []);
      var aArray = [];
      sData.T_ACT_CL.forEach(el => {
        if (!aArray.find(item => item.Werks === el.Werks)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_CL/Divisione", aArray.filter(a => a.Werks));

      aArray = [];
      sData.T_ACT_CL.forEach(el => {
        if (!aArray.find(item => item.Sistema === el.Sistema)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_CL/Sistema", aArray.filter(a => a.Sistema));
     
      aArray = [];
      sData.T_ACT_CL.forEach(el => {
        if (!aArray.find(item => item.Classe === el.Classe)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_CL/Classe", aArray.filter(a => a.Classe));
      
      aArray = [];
      sData.T_ACT_CL.forEach(el => {
        if (!aArray.find(item => item.Txt === el.Txt)) {
          aArray.push(el);
        }
      });
      oModelHelp.setProperty("/T_ACT_CL/Txt", aArray.filter(a => a.Txt));
      sData.DIVISIONENew = await this.Shpl("H_T001W", "SH");
      oModelHelp.setProperty("/H_T001W/DivisioneNew", sData.DIVISIONENew);

  
            
      sData.T_ACT_CL = await this._getTable("/T_ACT_SYST", []);
      aArray = [];
      sData.T_ACT_CL.forEach(el => {
        if (!aArray.find(item => item.Sistema === el.Sistema)) {
          aArray.push(el)
        }
      });
      oModelHelp.setProperty("/T_ACT_SYST/Sistema", aArray.filter(a => a.Sistema))


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
      if (this.getView().byId("cbTesto").getSelectedKeys().length !== 0) {
        aFilters.push(this.multiFilterNumber(this.getView().byId("cbTesto").getSelectedKeys(), "Txt"));
      }
      this.byId("tbTabellaClasseAzioneTipo").getBinding("items").filter(aFilters);
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
      var selectedTab = this.byId("tbTabellaClasseAzioneTipo");

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
        fileName: "TabellaClasseAzioneTipo.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbTabellaClasseAzioneTipo").getColumns().map((c) => {
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
        var oTable = this.byId("tbTabellaClasseAzioneTipo");
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
    onBackDetail: function () {
      this.byId("navCon").back();
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
    onModify: function () {
      debugger
      this.getView().getModel("oDataModel").setProperty("/Enabled", false);
      debugger
      sap.ui.core.BusyIndicator.show();
      var items = this.getView().byId("tbTabellaClasseAzioneTipo").getSelectedItems();
      if (items.length === 1) {
        this.byId("Detail").bindElement({ path: items[0].getBindingContext("T_ACT_CL").getPath() });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ACT_CL").getObject());
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
      var items = this.getView().byId("tbTabellaClasseAzioneTipo").getSelectedItems();
      if (items.length === 1) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(items[0].getBindingContext("T_ACT_CL").getObject());
        oModel.getData().ID = "New";
        this.getView().setModel(oModel, "sDetail");
        this.byId("navCon").to(this.byId("Detail"));
      } else {
        MessageToast.show("Seleziona una riga");
      }
      sap.ui.core.BusyIndicator.hide();
    },
    onSave: async function () {
      
      debugger
      var line = JSON.stringify(this.getView().getModel("sDetail").getData());
      line = JSON.parse(line);

      if (line.ID === "New") {
        delete line.ID;
        delete line.__metadata
        // get Last Index
        await this._saveHana("/T_ACT_CL", line);
      } else {
        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._updateHana(sURL, line);
      }
      sap.ui.core.BusyIndicator.show();
      var aT_ACT_CL = await this._getTable("/T_ACT_CL", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ACT_CL);
      this.getView().setModel(oModel, "T_ACT_CL");
      this.getValueHelp();
      sap.ui.core.BusyIndicator.hide();
      this.byId("navCon").back();
    },

    componiURL: function (line) {
      var sURL = `/T_ACT_CL(Werks='${line.Divisione}',Sistema='${line.Sistema}',Classe='${line.Classe}')`;
      return sURL;
    },
    onCancel: async function () {
      debugger
      var sel = this.getView().byId("tbTabellaClasseAzioneTipo").getSelectedItems();
      for (var i = (sel.length - 1); i >= 0; i--) {
        var line = JSON.stringify(sel[i].getBindingContext("T_ACT_CL").getObject());
        line = JSON.parse(line);
        // line = this.DestinatariCancelModel(line);
        // var sURL = this.componiURL(line);
        var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
        await this._removeHana(sURL);
      }
      this.getView().byId("tbTabellaClasseAzioneTipo").removeSelections();
      var aT_ACT_CL = await this._getTable("/T_ACT_CL", []);
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData(aT_ACT_CL);
      this.getView().setModel(oModel, "T_ACT_CL");
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
            var sAzione = this.AzioneModel(rows[i]);
            if (sAzione.Werks.startsWith("C-")) { //Creazione                  
              await this._saveHana("/T_ACT_CL", sAzione);
            } else { // Modifica
              // sAzioni.CONTATORE = await this._getLastItemData("/Azioni", "", "CONTATORE");
              // sURL = "/Azioni/" + sAzioni.CONTATORE;

              sURL = this.componiURLExcel(sAzione);
              // sAzioni.DIVISIONE = Number(sAzioni.DIVISIONE);
              await this._updateHana(sURL, sAzione);
            }
          }
          MessageBox.success("Excel Caricato con successo");
          sap.ui.core.BusyIndicator.hide(0);
          this.getView().getModel().refresh();
          this.byId("UploadTable").close();
        }
      }
    },
    AzioneModel: function (sValue) {
      debugger
      var oResources = this.getResourceBundle();
      var rValue = {
        Classe: (sValue[oResources.getText("Classe")] === undefined) ? undefined : sValue[oResources.getText("Classe")].toString(),
        Werks: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
        Sistema: (sValue[oResources.getText("Sistema")] === undefined) ? undefined : sValue[oResources.getText("Sistema")].toString(),
        Txt: (sValue[oResources.getText("Testo")] === undefined) ? undefined : sValue[oResources.getText("Testo")].toString(),
         };
      return rValue;
    },
    componiURLExcel: function (line) {
      var sURL = `/T_ACT_CL(Werks='${line.Werks}',Sistema='${line.Sistema}',Classe='${line.Classe}')`;
      return sURL;
    },
  });
});
