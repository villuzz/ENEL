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
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;
    return Controller.extend("PM030.APP1.controller.TabellaTipoDiGestione", {
        Validator: Validator,
        onInit: function () {

            this.getOwnerComponent().getRouter().getRoute("TabellaTipoDiGestione").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbTabellaTipoDiGestione"), componentName: "Piani", persoService: manutenzioneTable}).activate();
            var oModel = new sap.ui.model.json.JSONModel();
            var sData = {};
            oModel.setData(sData);
            this.getView().setModel(oModel, "sFilter");
        },

        _onObjectMatched: async function () {
          Validator.clearValidation();

          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({});
          this.getView().setModel(oModel, "T_TP_MAN");

          this.getValueHelp();

        },
        getValueHelp: async function () {
          sap.ui.core.BusyIndicator.show();
          var sData = {};
          var oModelHelp = new sap.ui.model.json.JSONModel();
          oModelHelp.setSizeLimit(2000);

          var T_TP_MAN = await this._getTable("/T_TP_MAN", []);

          sData.Divisione = this.distinctBy(T_TP_MAN, "Divisione");
          sData.TipoGestione = this.distinctBy(T_TP_MAN, "TipoGestione");
          sData.DesTipoGest = this.distinctBy(T_TP_MAN, "DesTipoGest");
          sData.Raggruppamento = this.distinctBy(T_TP_MAN, "Raggruppamento");

          sData.DIVISIONE = await this.Shpl("H_T001W", "SH");
          sData.T_RAGGR = await this._getTable("/T_RAGGR", []);

          var oModel1 = new sap.ui.model.json.JSONModel();
          oModel1.setData(T_TP_MAN);
          this.getView().setModel(oModel1, "T_TP_MAN");

          oModelHelp.setData(sData);
          this.getView().setModel(oModelHelp, "sHelp");
          sap.ui.core.BusyIndicator.hide();
        },

        onSearchResult: function () {
            this.onSearchFilters();
        },


        onSearchFilters: async function () {
          sap.ui.core.BusyIndicator.show();
            this.getView().byId("tbTabellaTipoDiGestione").removeSelections();
            var sFilter = this.getModel("sFilter").getData();
            var aFilters = [],
                tempFilter = [];

            if (sFilter.Divisione !== undefined) {
                if (sFilter.Divisione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Divisione, "Divisione");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.TipoGestione !== undefined) {
                if (sFilter.TipoGestione.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.TipoGestione, "TipoGestione");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.DesTipoGest !== undefined) {
                if (sFilter.DesTipoGest.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.DesTipoGest, "DesTipoGest");
                    aFilters = aFilters.concat(tempFilter);
                }
            }
            if (sFilter.Raggruppamento !== undefined) {
                if (sFilter.Raggruppamento.length !== 0) {
                    tempFilter = this.multiFilterText(sFilter.Raggruppamento, "Raggruppamento");
                    aFilters = aFilters.concat(tempFilter);
                }
            }

            var model = this.getView().getModel("T_TP_MAN");
            var tableFilters = await this._getTableNoError("/T_TP_MAN", aFilters);
            if (tableFilters.length === 0) {
                MessageBox.error("Nessun record trovato");
                model.setData({});
            } else {
                model.setData(tableFilters);
            } sap.ui.core.BusyIndicator.hide();
        },
        onDataExport: function () {
            var selectedTab = this.byId("tbTabellaTipoDiGestione");
            var selIndex = this.getView().byId("tbTabellaTipoDiGestione").getSelectedItems();

            var aCols,
                oRowBinding,
                oSettings,
                oSheet;

            aCols = this._createColumnConfig(selectedTab);
            oRowBinding = selectedTab.getBinding("items");
            if (selIndex.length >= 1) {
                var aArray = [];
                for (let i = 0; i < selIndex.length; i++) {
                    var oContext = selIndex[i].getBindingContext("T_TP_MAN").getObject()
                    aArray.push(oContext);
                }
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aArray,
                    fileName: "TabellaTipoDiGestione.xlsx",
                    worker: false
                };
            } else {
                var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: aFilters,
                    fileName: "TabellaTipoDiGestione.xlsx",
                    worker: false
                };
            } oSheet = new Spreadsheet(oSettings);
            oSheet.build(). finally(function () {
                oSheet.destroy();
            });
        },

        _createColumnConfig: function () {
            var oCols = this.byId("tbTabellaTipoDiGestione").getColumns().map((c) => {
                var templ = "";
                var typ = EdmType.String;
                // var prop = c.mAggregations.header.getText();
                var prop = c.getCustomData()[0].getValue();
                return {
                    label: c.getHeader().getText(),
                    property: prop,
                    type: typ,
                    format: (value) => {},
                    template: templ
                };
            }) || [];
            return oCols;
        },

        onBack: function () {
          this.navTo("ViewPage");
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
            this.byId("UploadTable").close();
        },
        onCancel: async function () {
          var sel = this.getView().byId("tbTabellaTipoDiGestione").getSelectedItems();
          for (var i =( sel.length - 1); i >= 0; i--) {
              var line = JSON.stringify(sel[i].getBindingContext("T_TP_MAN").getObject());
              line = JSON.parse(line);

              var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
              await this._removeHana(sURL);
          }
          this.onSearchFilters();
        },
        onSave: async function () {
          var ControlValidate = Validator.validateView();
          if (ControlValidate) {
              var line = JSON.stringify(this.getView().getModel("sSelect").getData());               line = JSON.parse(line);
              var msg = await this.ControlIndex(line);
              if (msg !== "") {
                  MessageBox.error(msg);
              } else {
                  if (line.stato === "M") {
                      var sURL = "/" + line.__metadata.uri.split("/")[line.__metadata.uri.split("/").length - 1];
                      delete line.stato;
                      delete line.__metadata;
                      await this._updateHana(sURL, line);
                  } else {
                      delete line.stato;
                      delete line.__metadata;
                      await this._saveHana("/T_TP_MAN", line);
                  }
                  MessageBox.success("Dati salvati con successo");
                  this.onSearchFilters();
                  this.byId("navCon").back();
              }
          }
        },
        componiURL: function (line) {
            var sURL = `/T_TP_MAN(TipoGestione='${
                line.TipoGestione
            }',Divisione='${
                line.Divisione
            }')`;
            return sURL;
        },
        onModify: function () {
          sap.ui.core.BusyIndicator.show();
          Validator.clearValidation();
          var items = this.getView().byId("tbTabellaTipoDiGestione").getSelectedItems();
          if (items.length === 1) {
              var oModel = new sap.ui.model.json.JSONModel();
              items = items[0].getBindingContext("T_TP_MAN").getObject();
              items.stato = "M";
              oModel.setData(items);
              this.getView().setModel(oModel, "sSelect");
              this.byId("navCon").to(this.byId("Detail"));
          } else {
              MessageToast.show("Seleziona una riga");
          } sap.ui.core.BusyIndicator.hide();
        },
        onCopy: function () {
          sap.ui.core.BusyIndicator.show();
          Validator.clearValidation();
          var items = this.getView().byId("tbTabellaTipoDiGestione").getSelectedItems();
          if (items.length === 1) {
              var oModel = new sap.ui.model.json.JSONModel();
              items = items[0].getBindingContext("T_TP_MAN").getObject();
              items.stato = "C";
              oModel.setData(items);
              this.getView().setModel(oModel, "sSelect");
              this.byId("navCon").to(this.byId("Detail"));
          } else {
              MessageToast.show("Seleziona una riga");
          } sap.ui.core.BusyIndicator.hide();
        },
        onBackDetail: function () {
            this.byId("navCon").back();
        },
        onNuovo: function () {
          sap.ui.core.BusyIndicator.show();
          Validator.clearValidation();

          var oModel = new sap.ui.model.json.JSONModel();
          var items = this.initModel();
          items.stato = "N";
          oModel.setData(items);
          this.getView().setModel(oModel, "sSelect");

          this.byId("navCon").to(this.byId("Detail"));

          sap.ui.core.BusyIndicator.hide();
        },
        onBackDetail: function () {
            this.byId("navCon").back();
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
                    var sGestione = this.GestioneModelSave(rows[i]);
                    sURL = this.componiURL(sGestione)
                    var result = await this._updateHanaNoError(sURL, sGestione);
                    if (result.length === 0) {
                        await this._saveHanaNoError("/T_TP_MAN", sGestione);
                    }
                }
                MessageBox.success("Excel Caricato con successo");
            }
            sap.ui.getCore().byId("UploadTable").close();
            sap.ui.core.BusyIndicator.hide(0);
        },
        GestioneModelSave: function (sValue) {
            var oResources = this.getResourceBundle();
            var rValue = {
                TipoGestione: (sValue[oResources.getText("TipoGestione")] === undefined) ? undefined : sValue[oResources.getText("TipoGestione")].toString(),
                Divisione: (sValue[oResources.getText("Divisione")] === undefined) ? undefined : sValue[oResources.getText("Divisione")].toString(),
                DesTipoGest: (sValue[oResources.getText("DescrizioneTipoGestione")] === undefined) ? undefined : sValue[oResources.getText("DescrizioneTipoGestione")].toString(),
                Raggruppamento: (sValue[oResources.getText("Raggruppamento")] === undefined) ? undefined : sValue[oResources.getText("Raggruppamento")].toString()
            };
            return rValue
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
        initModel: function () {
            var sData = {
              TipoGestione: "",
              Divisione: "",
              DesTipoGest: "",
              Raggruppamento: ""
            }
            return sData;
        },
        ControlIndex: function (sData) {

            if (sData.TipoGestione === "" || sData.TipoGestione === undefined || sData.TipoGestione === null) {
                return "Inserire Tipo gestione";
            }
            /*if (sData.Divisione === "" || sData.Divisione === undefined || sData.Divisione === null) {
                return "Inserire Divisione";
            }*/
            return "";
        }
    });
});
