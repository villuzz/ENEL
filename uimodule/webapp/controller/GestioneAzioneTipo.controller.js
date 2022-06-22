sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/TablePersoController",
  "sap/ui/export/Spreadsheet",
  "sap/ui/export/library",
  'sap/ui/core/routing/History',
  "PM030/APP1/util/manutenzioneTable",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, ) {
  "use strict";
  var oResource;
  oResource = new sap.ui.model.resource.ResourceModel({ bundleName: "PM030.APP1.i18n.i18n" }).getResourceBundle();
  var EdmType = exportLibrary.EdmType;

  return Controller.extend("PM030.APP1.controller.GestioneAzioneTipo", {
    onInit: function () {
    

      this.getOwnerComponent().getRouter().getRoute("GestioneAzioneTipo").attachPatternMatched(this._onObjectMatched, this);

    },
    onBeforeRendering: async function() {

    },
    _onObjectMatched: async function () {
    var T_ACT_TYPE = await this._getTable("/T_ACT_TYPE", []);
    var oModel = new sap.ui.model.json.JSONModel();
    oModel.setData(T_ACT_TYPE);
    this.getView().setModel(oModel, "T_ACT_TYPE");
    
    
    
    this.getValueHelp();
    },
    onSearchResult: function (oEvent) {
      var oModel = this.getView().getModel("FilterModel");
      var divisione = oModel.getData().Divisione;
      if (!divisione) {
        MessageBox.error(oResource.getText("MessageDivisioneObbligatoria"))
      } else {
        this.onSearchFilters();
      }
    },
    onSearchFilters: function () {
      var model = this.getModel("FilterModel");
      var oData = model.getData();

      var oBinding = this.byId("tbGestioneAzioneTipo").getBinding("items");
      if (oBinding.isSuspended()) {
        oBinding.resume();
      }

      var filterArray = [
        new sap.ui.model.Filter("InizioValidita", sap.ui.model.FilterOperator.EQ, oData.InizioValidita),
        filterArray.push(new sap.ui.model.Filter("FineValidita", sap.ui.model.FilterOperator.EQ, oData.FineValidita))
      ];
      oData.Divisione.map((d) => {
        filterArray.push(new sap.ui.model.Filter("Divisione", sap.ui.model.FilterOperator.EQ, d));
      });
      oData.Sistema.map((sis) => {
        filterArray.push(new sap.ui.model.Filter("Sistema", sap.ui.model.FilterOperator.EQ, sis));
      });
      oData.Classe.map((clas) => {
        filterArray.push(new sap.ui.model.Filter("Classe", sap.ui.model.FilterOperator.EQ, clas));
      });
      oData.Progressivo.map((pr) => {
        filterArray.push(new sap.ui.model.Filter("Progressivo", sap.ui.model.FilterOperator.EQ, pr));
      });
      oData.DescrizioneProgressivo.map((dp) => {
        filterArray.push(new sap.ui.model.Filter("DescrizioneProgressivo", sap.ui.model.FilterOperator.EQ, dp));
      });
      oData.ComponenteTipo.map((ct) => {
        filterArray.push(new sap.ui.model.Filter("ComponenteTipo", sap.ui.model.FilterOperator.EQ, ct));
      });
      oData.FlagValidita.map((fg) => {
        filterArray.push(new sap.ui.model.Filter("FlagValidita", sap.ui.model.FilterOperator.EQ, fg));
      });
      oData.TipoGestione.map((tg) => {
        filterArray.push(new sap.ui.model.Filter("TipoGestione", sap.ui.model.FilterOperator.EQ, tg));
      });
      oData.Finalita.map((fin) => {
        filterArray.push(new sap.ui.model.Filter("Finalita", sap.ui.model.FilterOperator.EQ, fin));
      });
      oData.GruppoControllo.map((gc) => {
        filterArray.push(new sap.ui.model.Filter("GruppoControllo", sap.ui.model.FilterOperator.EQ, gc));
      });
      oData.Aggreg.map((agg) => {
        filterArray.push(new sap.ui.model.Filter("Aggreg", sap.ui.model.FilterOperator.EQ, agg));
      });

      var self = this;
      var oDataModel = self.getModel();

      oDataModel.read("", {
        filters: filterArray,
        success: function (response) { // debugger;

        },
        error: function () { // debugger;
        }
      });
    },
    onDataExport: function () {
      var selectedTab = this.byId("tbGestioneAzioneTipo");

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
        fileName: "GestioneAzioneTipo.xlsx",
        worker: false
      };
      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },

    _createColumnConfig: function () {
      var oCols = this.byId("tbGestioneAzioneTipo").getColumns().map((c) => {
        var templ = "";
        var typ = EdmType.String;
        var prop = c.getCustomData()[0].getValue();

        if (prop === "InizioValidita") {
          typ = EdmType.Date;
        }
        if (prop === "FineValidita") {
          typ = EdmType.Date;
        }
        if (prop === "PeriodoDiSelezioneA") {
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
        var oTable = this.byId("tbGestioneAzioneTipo");
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

    onSave: function (oEvent) {
      var inVal = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts.mManutenzione.getObject().InizioValidita;
      var finVal = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts.mManutenzione.getObject().FineValidita;
      var edData = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts.mManutenzione.getObject().EditData;
      if (inVal) {
        inVal.setHours(2);
      }
      if (finVal) {
        finVal.setHours(2);
      }
      if (edData) {
        edData.setHours(2);
      }
      this.byId("navCon").back();

    }
    // onBack: function () {
    // sap.ui.core.UIComponent.getRouterFor(this).navTo("TilePage");
    // }
  });
});
