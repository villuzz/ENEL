sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/TablePersoController",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    'sap/ui/core/routing/History',
    "PM030/APP1/util/manutenzioneTable",
    'sap/m/MessageToast',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/core/library',
    "PM030/APP1/util/Validator",
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, MessageToast, Filter, FilterOperator, coreLibrary, Validator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;
    var ValueState = coreLibrary.ValueState;
    return Controller.extend("PM030.APP1.controller.SedeTecnica", {
        Validator: Validator,
    
        onInit: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "sFilter");

            this.getOwnerComponent().getRouter().getRoute("SedeTecnica").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbSede"), persoService: manutenzioneTable}).activate();
        },
        onResetSedeTecnica: function () {
          this.getView().getModel("sFilter").setData({});
          this.onSearchFilters();
        },
        _onObjectMatched: function () {
            this.byId("navCon").back();
            this.onSearchResult();
            this.getValueHelp();
        },
        getValueHelp: async function () {
          sap.ui.core.BusyIndicator.show();
          var sData = {};
          var oModelHelp = new sap.ui.model.json.JSONModel();
          oModelHelp.setSizeLimit(2000);

          sData.SPRAS = await this.Shpl("H_T002", "SH");

          oModelHelp.setData(sData);
          this.getView().setModel(oModelHelp, "sHelp");
          sap.ui.core.BusyIndicator.hide();
      },
      handleChangeCb: function (oEvent) {
        var oValidatedComboBox = oEvent.getSource(),
            sSelectedKey = oValidatedComboBox.getSelectedKey(),
            sValue = oValidatedComboBox.getValue();

        if (! sSelectedKey && sValue) {
            oValidatedComboBox.setValueState(ValueState.Error);
        } else {
            oValidatedComboBox.setValueState(ValueState.None);
        }
    },
        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: async function () {
            var sFilter = this.getView().getModel("sFilter").getData();

            var aFilter = [],
                oFilter = {},
                sData = [];

            if (sFilter.LANGUAGE != "" && sFilter.LANGUAGE != null) {
                aFilter.push(new Filter("LANGUAGE", FilterOperator.EQ, sFilter.LANGUAGE));
            }
            if (sFilter.SEDE_TECNICA != "" && sFilter.SEDE_TECNICA != null) {
                aFilter.push(new Filter("SEDE_TECNICA", FilterOperator.EQ, sFilter.SEDE_TECNICA));
            }
            if (sFilter.LIVELLO1 != "" && sFilter.LIVELLO1 != null) {
                aFilter.push(new Filter("LIVELLO1", FilterOperator.EQ, sFilter.LIVELLO1));
            }
            if (sFilter.LIVELLO2 != "" && sFilter.LIVELLO2 != null) {
                aFilter.push(new Filter("LIVELLO2", FilterOperator.EQ, sFilter.LIVELLO2));
            }
            if (sFilter.LIVELLO3 != "" && sFilter.LIVELLO3 != null) {
                aFilter.push(this.filterLivello3(sFilter.LIVELLO3));
            }
            if (sFilter.LIVELLO4 != "" && sFilter.LIVELLO4 != null) {
                aFilter.push(this.filterLivello4(sFilter.LIVELLO4));
            }
            if (sFilter.LIVELLO5 != "" && sFilter.LIVELLO5 != null) {
                aFilter.push(this.filterLivello5(sFilter.LIVELLO5));
            }
            if (sFilter.LIVELLO6 != "" && sFilter.LIVELLO6 != null) {
                aFilter.push(this.filterLivello6(sFilter.LIVELLO6));
            }
            if (sFilter.DESC_SEDE != "" && sFilter.DESC_SEDE != null) {
                aFilter.push(new Filter("DESC_SEDE", FilterOperator.Contains, sFilter.DESC_SEDE));
            }
            if (sFilter.NOTE != "" && sFilter.NOTE != null) {
                aFilter.push(new Filter("NOTE", FilterOperator.Contains, sFilter.NOTE));
            }

            var oModel = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "SEDE_TECNICA");
            oModel.setData(sData);
            this.getView().setModel(oModel, "SEDE_TECNICA");

            var oModel1 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO1");
            oModel1.setData(sData);
            this.getView().setModel(oModel1, "LIVELLO1");

            var oModel2 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO2");
            oModel2.setData(sData);
            this.getView().setModel(oModel2, "LIVELLO2");

            var oModel3 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO3");
            oModel3.setData(sData);
            this.getView().setModel(oModel3, "LIVELLO3");

            var oModel4 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO4");
            oModel4.setData(sData);
            this.getView().setModel(oModel4, "LIVELLO4");

            var oModel5 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO5");
            oModel5.setData(sData);
            this.getView().setModel(oModel5, "LIVELLO5");

            var oModel6 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LIVELLO6");
            oModel6.setData(sData);
            this.getView().setModel(oModel6, "LIVELLO6");

            var oModel7 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "LANGUAGE");
            oModel7.setData(sData);
            this.getView().setModel(oModel7, "LANGUAGE");

            var oModel8 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "DESC_SEDE");
            oModel8.setData(sData);
            this.getView().setModel(oModel8, "DESC_SEDE");

            var oModel9 = new sap.ui.model.json.JSONModel();
            sData = await this._getTableDistinct("/SedeDistinct", aFilter, "NOTE");
            oModel9.setData(sData);
            this.getView().setModel(oModel9, "NOTE");

            this.byId("tbSede").getBinding("items").filter(aFilter);
        },
        multiFilterNumber: function (aArray, vName) {

            var aFilter = [];
            if (aArray.length === 0) {
                return new Filter(vName, FilterOperator.EQ, "");
            } else if (aArray.length === 1) {
                return new Filter(vName, FilterOperator.EQ, Number(aArray[0]));
            } else {
                for (var i = 0; i < aArray.length; i++) {
                    aFilter.push(new Filter(vName, FilterOperator.EQ, Number(aArray[i])));
                }
                return aFilter;
            }
        },
        onDataExport: function () {
          var selectedTab = this.byId("tbSede");
          var selIndex = this.getView().byId("tbSede").getSelectedItems();
    
          var aCols,
              oSettings,
              oSheet;
    
          aCols = this._createColumnConfig(selectedTab);
          var aArray = [],
              oContext = {},
              i = 0;
    
          if (selIndex.length >= 1) {
    
              for (i = 0; i < selIndex.length; i++) {
                  oContext = selIndex[i].getBindingContext().getObject();
                  aArray.push(oContext);
              }
          } else {
              for (i = 0; i < selectedTab.getItems().length; i++) {
                  oContext = selectedTab.getItems()[i].getBindingContext().getObject();
                  aArray.push(oContext);
              }
          } oSettings = {
              workbook: {
                  columns: aCols
              },
              dataSource: aArray,
              fileName: "tbSede.xlsx",
              worker: false
          };
          oSheet = new Spreadsheet(oSettings);
          oSheet.build(). finally(function () {
              oSheet.destroy();
          });
      },

        _createColumnConfig: function () {
            var oCols = [],
                sCols = {};
            var oColumns = this.byId("tbSede").getColumns();
            var oCells = this.getView().byId("tbSede").getBindingInfo('items').template.getCells();
            for (var i = 0; i < oColumns.length; i++) {
                sCols = {
                    label: oColumns[i].getHeader().getText(),
                    property: oCells[i].getBindingInfo('text').parts[0].path,
                    type: EdmType.String,
                    format: () => {},
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
            Validator.clearValidation();
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ID: "New"});
            this.getView().setModel(oModel, "sDetail");
            this.byId("navCon").to(this.byId("Detail"));
            sap.ui.core.BusyIndicator.hide();
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbSede").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(items[0].getBindingContext().getObject());
                oModel.getData().ID = "New";
                this.getView().setModel(oModel, "sDetail");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onModify: function () {
            sap.ui.core.BusyIndicator.show();
            Validator.clearValidation();
            var items = this.getView().byId("tbSede").getSelectedItems();
            if (items.length === 1) {
                this.byId("Detail").bindElement({path: items[0].getBindingContext().getPath()});
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(items[0].getBindingContext().getObject());
                oModel.getData().MODIFY = false;
                this.getView().setModel(oModel, "sDetail");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onPersoButtonPressed: function () {
            this._oTPC.openDialog();
        },

        handleUploadPiani: function () {
            this.byId("UploadTable").open();
        },
        onCloseFileUpload: function () { // this.onSearch();
            this.byId("UploadTable").close();
        },
        onBackDetail: function () {
            this.byId("navCon").back();
        },
        onSave: async function () {
          var ControlValidate = Validator.validateView();
            if (ControlValidate) {
            var line = JSON.stringify(this.getView().getModel("sDetail").getData());
            line = JSON.parse(line);
            delete line["__metadata"]
            if (line.ID === "New") {
                line = this.SedeModelSave(line);
                await this._saveHana("/Sede", line);
            } else {
              line = this.SedeModelSave(line);

              var sURL = this.componiURL(line);
              await this._updateHana(sURL, line);
            }
            this.byId("navCon").back();
          }
        },
        onCancel: async function () {
            var sel = this.getView().byId("tbSede").getSelectedItems();
            for (var i =( sel.length - 1); i >= 0; i--) {
                var line = JSON.stringify(sel[i].getBindingContext().getObject());
                line = JSON.parse(line);
                line = this.SedeModelSave(line);

                var sURL = this.componiURL(line);
                await this._removeHana(sURL);
            }
            this.getView().getModel().refresh();
            this.getView().byId("tbSede").removeSelections();
        },
        componiURL: function(line){
          var sURL = "/Sede(" + "SEDE_TECNICA="    + "'" + line.SEDE_TECNICA + "'," +
                                    "LIVELLO1="    + "'" + line.LIVELLO1 + "'," +
                                    "LIVELLO2="    + "'" + line.LIVELLO2 + "'," +
                                    "LIVELLO3="    + "'" + line.LIVELLO3 + "'," +
                                    "LIVELLO4="    + "'" + line.LIVELLO4 + "'," +
                                    "LIVELLO5="    + "'" + line.LIVELLO5 + "'," +
                                    "LIVELLO6="    + "'" + line.LIVELLO6 + "'," +
                                    "LANGUAGE="    + "'" + line.LANGUAGE + "'" + ")";

          return sURL;
        },
        handleUploadPress: function () {
          this.handleUploadGenerico("/Sede");
        },
        ControlloExcelModel: function (sValue) {
            var oResource = this.getResourceBundle();
            var rValue = {
              SEDE_TECNICA: (sValue[oResource.getText("SEDE_TECNICA")] === undefined) ? "" : sValue[oResource.getText("SEDE_TECNICA")].toString(),
              LIVELLO1: (sValue[oResource.getText("LIVELLO1")] === undefined) ? "" : sValue[oResource.getText("LIVELLO1")].toString(),
              LIVELLO2: (sValue[oResource.getText("LIVELLO2")] === undefined) ? "" : sValue[oResource.getText("LIVELLO2")].toString(),
              LIVELLO3: (sValue[oResource.getText("LIVELLO3")] === undefined) ? "" : sValue[oResource.getText("LIVELLO3")].toString(),
              LIVELLO4: (sValue[oResource.getText("LIVELLO4")] === undefined) ? "" : sValue[oResource.getText("LIVELLO4")].toString(),
              LIVELLO5: (sValue[oResource.getText("LIVELLO5")] === undefined) ? "" : sValue[oResource.getText("LIVELLO5")].toString(),
              LIVELLO6: (sValue[oResource.getText("LIVELLO6")] === undefined) ? "" : sValue[oResource.getText("LIVELLO6")].toString(),
              LANGUAGE: (sValue[oResource.getText("LANGUAGE")] === undefined) ? "" : sValue[oResource.getText("LANGUAGE")].toString(),
              DESC_SEDE: (sValue[oResource.getText("DESC_SEDE")] === undefined) ? "" : sValue[oResource.getText("DESC_SEDE")].toString(),
              NOTE: (sValue[oResource.getText("NOTE")] === undefined) ? "" : sValue[oResource.getText("NOTE")].toString(),
            };
            return rValue;
        },
        SedeModelSave: function (sValue) {
            var rValue = {
                SEDE_TECNICA: (sValue.SEDE_TECNICA === "" || sValue.SEDE_TECNICA === undefined) ? "" : sValue.SEDE_TECNICA,
                LIVELLO1: (sValue.LIVELLO1 === "" || sValue.LIVELLO1 === undefined) ? "" : sValue.LIVELLO1,
                LIVELLO2: (sValue.LIVELLO2 === "" || sValue.LIVELLO2 === undefined) ? "" : sValue.LIVELLO2,
                LIVELLO3: (sValue.LIVELLO3 === "" || sValue.LIVELLO3 === undefined) ? "" : sValue.LIVELLO3,
                LIVELLO4: (sValue.LIVELLO4 === "" || sValue.LIVELLO4 === undefined) ? "" : sValue.LIVELLO4,
                LIVELLO5: (sValue.LIVELLO5 === "" || sValue.LIVELLO5 === undefined) ? "" : sValue.LIVELLO5,
                LIVELLO6: (sValue.LIVELLO6 === "" || sValue.LIVELLO6 === undefined) ? "" : sValue.LIVELLO6,
                LANGUAGE: (sValue.LANGUAGE === "" || sValue.LANGUAGE === undefined) ? "" : sValue.LANGUAGE,
                DESC_SEDE: (sValue.DESC_SEDE === "" || sValue.DESC_SEDE === undefined) ? "" : sValue.DESC_SEDE,
                NOTE: (sValue.NOTE === "" || sValue.NOTE === undefined) ? "" : sValue.NOTE,
            };
            return rValue;
        }
    });
});
