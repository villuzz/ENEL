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
], function (Controller, JSONModel, MessageBox, TablePersoController, Spreadsheet, exportLibrary, History, manutenzioneTable, MessageToast, Filter, FilterOperator) {
    "use strict";
    var oResource;
    oResource = new sap.ui.model.resource.ResourceModel({bundleName: "PM030.APP1.i18n.i18n"}).getResourceBundle();
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("PM030.APP1.controller.SedeTecnica", {
        onInit: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({});
            this.getView().setModel(oModel, "sSedeTecnica");

            this.getOwnerComponent().getRouter().getRoute("SedeTecnica").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbSede"), persoService: manutenzioneTable}).activate();
        },
        _onObjectMatched: function () {
            this.byId("navCon").back();
            this.onSearchResult();
        },
        onSearchResult: function () {
            this.onFilterSedeTecnica();
        },
        onFilterSedeTecnica: async function () {
            var sSedeTecnica = this.getView().getModel("sSedeTecnica").getData();

            var aFilter = [],
                oFilter = {},
                sData = [];

            if (sSedeTecnica.LANGUAGE != "" && sSedeTecnica.LANGUAGE != null) {
                aFilter.push(new Filter("LANGUAGE", FilterOperator.EQ, sSedeTecnica.LANGUAGE));
            }
            if (sSedeTecnica.SEDE_TECNICA != "" && sSedeTecnica.SEDE_TECNICA != null) {
                aFilter.push(new Filter("SEDE_TECNICA", FilterOperator.EQ, sSedeTecnica.SEDE_TECNICA));
            }
            if (sSedeTecnica.LIVELLO1 != "" && sSedeTecnica.LIVELLO1 != null) {
                aFilter.push(new Filter("LIVELLO1", FilterOperator.EQ, sSedeTecnica.LIVELLO1));
            }
            if (sSedeTecnica.LIVELLO2 != "" && sSedeTecnica.LIVELLO2 != null) {
                aFilter.push(new Filter("LIVELLO2", FilterOperator.EQ, sSedeTecnica.LIVELLO2));
            }
            if (sSedeTecnica.LIVELLO3 != "" && sSedeTecnica.LIVELLO3 != null) {
                aFilter.push(this.filterLivello3(sSedeTecnica.LIVELLO3));
            }
            if (sSedeTecnica.LIVELLO4 != "" && sSedeTecnica.LIVELLO4 != null) {
                aFilter.push(this.filterLivello4(sSedeTecnica.LIVELLO4));
            }
            if (sSedeTecnica.LIVELLO5 != "" && sSedeTecnica.LIVELLO5 != null) {
                aFilter.push(this.filterLivello5(sSedeTecnica.LIVELLO5));
            }
            if (sSedeTecnica.LIVELLO6 != "" && sSedeTecnica.LIVELLO6 != null) {
                aFilter.push(this.filterLivello6(sSedeTecnica.LIVELLO6));
            }
            if (sSedeTecnica.DESC_SEDE != "" && sSedeTecnica.DESC_SEDE != null) {
                aFilter.push(new Filter("DESC_SEDE", FilterOperator.Contains, sSedeTecnica.DESC_SEDE));
            }
            if (sSedeTecnica.NOTE != "" && sSedeTecnica.NOTE != null) {
                aFilter.push(new Filter("NOTE", FilterOperator.Contains, sSedeTecnica.NOTE));
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
                fileName: "Sede.xlsx",
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
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ID: "New"});
            this.getView().setModel(oModel, "sDetail");
            this.byId("navCon").to(this.byId("Detail"));
            sap.ui.core.BusyIndicator.hide();
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
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
            var line = JSON.stringify(this.getView().getModel("sDetail").getData());
            line = JSON.parse(line);
            delete line["__metadata"]
            if (line.ID === "New") {
                // get Last Index
                // line.ID = await this._getLastItemData("/Sede", "", "ID");
                delete line.ID;
                await this._saveHana("/Sede", line);
            } else {
              line = this.SedeModelSave(line);

              var sURL = this.componiURL(line);
              await this._updateHana(sURL, line);
            }
            this.byId("navCon").back();
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
                        var line = this.SedeModel(rows[i]);

                        sURL = this.componiURL(line);
                        await this._updateHanaNoError(sURL, line);
                    }
                    MessageBox.success("Excel Caricato con successo");
                    sap.ui.core.BusyIndicator.hide(0);
                    this.getView().getModel().refresh();
                    this.byId("UploadTable").close();
                }
            }
        },
        SedeModel: function (sValue) {
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
                SEDE_TECNICA: (sValue.SEDE_TECNICA === "") ? "" : sValue.SEDE_TECNICA,
                LIVELLO1: (sValue.LIVELLO1 === "") ? "" : sValue.LIVELLO1,
                LIVELLO2: (sValue.LIVELLO2 === "") ? "" : sValue.LIVELLO2,
                LIVELLO3: (sValue.LIVELLO3 === "") ? "" : sValue.LIVELLO3,
                LIVELLO4: (sValue.LIVELLO4 === "") ? "" : sValue.LIVELLO4,
                LIVELLO5: (sValue.LIVELLO5 === "") ? "" : sValue.LIVELLO5,
                LIVELLO6: (sValue.LIVELLO6 === "") ? "" : sValue.LIVELLO6,
                LANGUAGE: (sValue.LANGUAGE === "") ? "" : sValue.LANGUAGE,
                DESC_SEDE: sValue.DESC_SEDE,
                NOTE: sValue.NOTE
            };
            return rValue;
        }
    });
});
