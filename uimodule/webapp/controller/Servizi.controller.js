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

    return Controller.extend("PM030.APP1.controller.Servizi", {
        onInit: function () {
          var oModelHelp = new sap.ui.model.json.JSONModel({});
          this.getView().setModel(oModelHelp, "sHelp");

          var oModel1 = new sap.ui.model.json.JSONModel();
            oModel1.setData({});
            this.getView().setModel(oModel1, "sFilter");

            this.getOwnerComponent().getRouter().getRoute("Servizi").attachPatternMatched(this._onObjectMatched, this);
            this._oTPC = new TablePersoController({table: this.byId("tbServizi"), persoService: manutenzioneTable}).activate();
        },
        _onObjectMatched: function () {
            this.byId("navCon").back();
        },
        onSearchResult: function () {
            this.onSearchFilters();
        },
        onSearchFilters: function () {
            var aFilters = [];

            if (this.getView().byId("cbServizi").getSelectedKeys().length !== 0) {
                aFilters = this.multiFilterText(this.getView().byId("cbServizi").getSelectedKeys(), "ASNUM");
            }
            this.byId("tbServizi").getBinding("items").filter(aFilters);
        },
        multiFilterText: function (aArray, vName) {

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
          var selectedTab = this.byId("tbServizi");
          var selIndex = this.getView().byId("tbServizi").getSelectedItems();

          var aCols,
              oRowBinding,
              oSettings,
              oSheet;

          aCols = this._createColumnConfig(selectedTab);
          oRowBinding = selectedTab.getBinding("items");

          if (selIndex.length >= 1) {
              var aArray = [];
              for (let i = 0; i < selIndex.length; i++) {
                  var oContext = selIndex[i].getBindingContext().getObject();
                  aArray.push(oContext);
              }
              oSettings = {
                  workbook: {
                      columns: aCols
                  },
                  dataSource: aArray,
                  fileName: "tbServizi.xlsx",
                  worker: false
              };
          } else {
              var aFilters = oRowBinding.aIndices.map((i) => selectedTab.getBinding("items").oList[i]);
              oSettings = {
                  workbook: {
                      columns: aCols
                  },
                  dataSource: aFilters,
                  fileName: "tbServizi.xlsx",
                  worker: false
              };
          } oSheet = new Spreadsheet(oSettings);
          oSheet.build(). finally(function () {
              oSheet.destroy();
          });
      },

        _createColumnConfig: function () {
            var oCols = [],
                sCols = {};
            var oColumns = this.byId("tbServizi").getColumns();
            var oCells = this.getView().byId("tbServizi").getBindingInfo('items').template.getCells();
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
            oModel.setData({});
            this.getView().setModel(oModel, "sDetail");
            this.byId("navCon").to(this.byId("Detail"));
            sap.ui.core.BusyIndicator.hide();
        },
        onCopy: function () {
            sap.ui.core.BusyIndicator.show();
            var items = this.getView().byId("tbServizi").getSelectedItems();
            if (items.length === 1) {
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(items[0].getBindingContext().getObject());
                this.getView().setModel(oModel, "sDetail");
                this.byId("navCon").to(this.byId("Detail"));
            } else {
                MessageToast.show("Seleziona una riga");
            } sap.ui.core.BusyIndicator.hide();
        },
        onModify: function () {
            sap.ui.core.BusyIndicator.show();
            var items = this.getView().byId("tbServizi").getSelectedItems();
            if (items.length === 1) {
                this.byId("Detail").bindElement({path: items[0].getBindingContext().getPath()});
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(items[0].getBindingContext().getObject());
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
            delete line.__metadata;
            delete line.modifiedBy;
            delete line.modifiedAt;
            delete line.createdBy;
            delete line.createdAt;

            var sURL = "/Servizi/" + line.ASNUM;
            await this._updateHana(sURL, line);
            this.onSearchFilters();
            this.byId("navCon").back();
        },
        onSuggestAsnum: async function (oEvent) {
          if (oEvent.getParameter("suggestValue").length >= 5) {
              var aFilter = [];
              aFilter.push({
                  "Shlpname": "ZPM4R_SH_ASNUM",
                  "Shlpfield": "ASNUM",
                  "Sign": "I",
                  "Option": "CP",
                  "Low": oEvent.getParameter("suggestValue") + "*"
              });
              var sHelp = this.getView().getModel("sHelp").getData();
              sHelp.Asnum = await this.Shpl("ZPM4R_SH_ASNUM", "SH", aFilter);
              this.getView().getModel("sHelp").refresh(true);
          }
      },
        onCancel: async function () {

            var sel = this.getView().byId("tbServizi").getSelectedItems(),
                control = true,
                line = {};

            for (var i =( sel.length - 1); i >= 0; i--) {
                line = sel[i].getBindingContext().getObject();
                var aFilter = [];
                aFilter.push(new Filter("ASNUM", FilterOperator.EQ, line.ASNUM));

                var result = await this._getTable("/AzioniServizi", aFilter);
                if (result.length > 0) {
                    control = false;
                    break;
                }
            }
            if (control) {
                for (i =( sel.length - 1); i >= 0; i--) {
                    line = sel[i].getBindingContext().getObject();
                    await this._removeHana("/Servizi/" + line.ASNUM);
                }

                this.getView().getModel().refresh();
                this.getView().byId("tbServizi").removeSelections();
            } else {
                MessageBox.error("il Servizio: " + line.ASNUM + " ha Azioni Prototipo collegate");
            }
        },
        handleUploadPress: async function () {
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
                        var sServizi = this.ServiziModel(rows[i]);
                        sURL = "/Servizi/" + sServizi.ASNUM;
                        await this._updateHana(sURL, sServizi);
                    }
                    MessageBox.success("Excel Caricato con successo");
                    sap.ui.core.BusyIndicator.hide(0);
                    this.byId("UploadTable").close();
                }
            }
        },
        ServiziModel: function (sValue) {
            var oResource = this.getResourceBundle();
            var rValue = {
                ASNUM: (sValue[oResource.getText("ASNUM")] === undefined) ? undefined : sValue[oResource.getText("ASNUM")].toString(),
                ASKTX: (sValue[oResource.getText("ASKTX")] === undefined) ? undefined : sValue[oResource.getText("ASKTX")].toString(),
                MENGE: (sValue[oResource.getText("MENGE")] === undefined) ? undefined : sValue[oResource.getText("MENGE")].toString(),
                MEINS: (sValue[oResource.getText("MEINS")] === undefined) ? undefined : sValue[oResource.getText("MEINS")].toString()
            };
            return rValue;
        }
    });
});
