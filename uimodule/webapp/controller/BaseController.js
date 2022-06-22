sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/core/UIComponent",
  "PM030/APP1/model/formatter",
  "sap/m/MessageBox",
  "sap/ui/model/Sorter",
  "PM030/APP1/util/xlsx",
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  "PM030/APP1/util/underscore-min",
],
  /**
       * @param {typeof sap.ui.core.mvc.Controller} Controller
       * @param {typeof sap.ui.core.routing.History} History
       * @param {typeof sap.ui.core.UIComponent} UIComponent
       */
  function (Controller, History, UIComponent, formatter, MessageBox, Sorter, xlsx, Filter, FilterOperator, underscore) {
    "use strict";

    return Controller.extend("PM030.APP1.controller.BaseController", {
      formatter: formatter,
      underscore: underscore,
      /**
           * Convenience method for getting the view model by name in every controller of the application.
           * @public
           * @param {string} sName the model name
           * @returns {sap.ui.model.Model} the model instance
           */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

      /**
           * Convenience method for setting the view model in every controller of the application.
           * @public
           * @param {sap.ui.model.Model} oModel the model instance
           * @param {string} sName the model name
           * @returns {sap.ui.mvc.View} the view instance
           */
      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },

      /**
           * Convenience method for getting the resource bundle.
           * @public
           * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
           */
      getResourceBundle: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      /**
           * Method for navigation to specific view
           * @public
           * @param {string} psTarget Parameter containing the string for the target navigation
           * @param {Object.<string, string>} pmParameters? Parameters for navigation
           * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
           */
      navTo: function (psTarget, pmParameters, pbReplace) {
        this.getRouter().navTo(psTarget, pmParameters, pbReplace);
      },

      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },
      Shpl: async function (ShplName, ShplType, aFilter) {

        var sFilter = {
          "ReturnFieldValueSet": [{}]
        };
        sFilter.ShplType = ShplType;
        sFilter.ShplName = ShplName;
        sFilter.IFilterDataSet = aFilter;
        // Shlpname Shlpfield Sign Option Low

        var result = await this._saveHana("/dySearch", sFilter);
        if (result.ReturnFieldValueSet !== undefined) {
          result = result.ReturnFieldValueSet.results;
          result.splice(0, 1);
        } else {
          result = [];
        }

        return result;
      },
      _getTable: function (Entity, Filters) {
        debugger
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.read(Entity, {
            filters: Filters,
            success: function (oDataIn) {
              if (oDataIn.results !== undefined) {
                resolve(oDataIn.results);
              } else {
                resolve(oDataIn);
              }
            },
            error: function (err) {
              var responseObject = JSON.parse(err.responseText);
              reject(MessageBox.error(responseObject.error.message.value))
            }
          });
        });
      },
      _getTableNoError: function (Entity, Filters) {
        debugger
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.read(Entity, {
            filters: Filters,
            success: function (oDataIn) {
              if (oDataIn.results !== undefined) {
                resolve(oDataIn.results);
              } else {
                resolve(oDataIn);
              }
            },
            error: function () {
              resolve([]);
            }
          });
        });
      },
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.back();
        } else {
          this.getRouter().navTo("appHome", {}, true /*no history*/
          );
        }
      },
      onResetSedeTecnica: function () {
        var oModel = new sap.ui.model.json.JSONModel();
        var sData = {
          SEDE_TECNICA: "",
          LIVELLO1: "",
          LIVELLO2: "",
          LIVELLO3: "",
          LIVELLO4: "",
          LIVELLO5: "",
          LIVELLO6: "",
          NOTE: "",
          DESC_SEDE: "",
          LANGUAGE: ""
        };
        oModel.setData(sData);
        this.getView().setModel(oModel, "sSedeTecnica");
        this.onFilterSedeTecnica();
      },
      filterLivello3: function (LIVELLO3) {

        var value = "";
        if (LIVELLO3 === null || LIVELLO3 === undefined || LIVELLO3 === "") {
          return new Filter("LIVELLO3", FilterOperator.EQ, "");
        } else {

          var fLIVELLO3 = [];

          fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, LIVELLO3)); // ++
          value = LIVELLO3[0] + "x";
          fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, value));
          // +x

          // 2 -> numero
          if (!isNaN(Number(LIVELLO3[1]))) {
            value = LIVELLO3[0] + "n";
            fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, value)); // +n
            fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, "xn")); // xn
          }

          // 1 -> alfabetico
          if (isNaN(Number(LIVELLO3[0]))) {
            fLIVELLO3.push(new Filter("LIVELLO3", FilterOperator.EQ, "kx")); // kx
          } fLIVELLO3 = new sap.ui.model.Filter({ filters: fLIVELLO3, and: false });
          return fLIVELLO3;
        }

      },
      filterLivello4: function (LIVELLO4) {

        var value = "";
        if (LIVELLO4 === null || LIVELLO4 === undefined || LIVELLO4 === "") {
          return new Filter("LIVELLO4", FilterOperator.EQ, "");
        } else {

          var fLIVELLO4 = [];

          fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, LIVELLO4)); // ++
          if (LIVELLO4.length === 3) {
            value = LIVELLO4[0] + LIVELLO4[1] + "x";
            fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, value)); // ++x
          }
          // -> numero
          if (!isNaN(Number(LIVELLO4))) {
            fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, "nnn")); // nnn
            fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, "nn")); // nn
          }

          // 1 -> numero
          if (!isNaN(Number(LIVELLO4[0])) && LIVELLO4.length === 2) {
            value = "n" + LIVELLO4[1];
            fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, value)); // n+
          }

          // 2 -> numero
          if (!isNaN(Number(LIVELLO4[1])) && LIVELLO4.length === 2) {
            value = LIVELLO4[0] + "n";
            fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, value)); // +n
          }

          // 1 -> alfabetico
          if (isNaN(Number(LIVELLO4[0])) && LIVELLO4.length === 2) {
            value = "k" + LIVELLO4[1];
            fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, value));
            // k+
            // 1 -> alfabetico 2 -> numero
            if (!isNaN(Number(LIVELLO4[1]))) {
              fLIVELLO4.push(new Filter("LIVELLO4", FilterOperator.EQ, "kn")); // kn
            }
          }

          fLIVELLO4 = new sap.ui.model.Filter({ filters: fLIVELLO4, and: false });
          return fLIVELLO4;
        }
      },
      filterLivello5: function (LIVELLO5) {

        var value = "";
        if (LIVELLO5 === null || LIVELLO5 === undefined || LIVELLO5 === "") {
          return new Filter("LIVELLO5", FilterOperator.EQ, "");
        } else {

          var fLIVELLO5 = [];

          fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, LIVELLO5)); // +++
          fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, "xx"));
          // xx

          // if numero
          if (!isNaN(Number(LIVELLO5))) { //
            fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, "nn")); // nn
          }

          // 2 -> numero
          if (!isNaN(Number(LIVELLO5[1])) && LIVELLO5.length === 2) {
            value = LIVELLO5[0] + "n";
            fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, value)); // +n
          }


          // 2 -> alfabetico
          if (isNaN(Number(LIVELLO5[1])) && LIVELLO5.length === 2) {
            value = LIVELLO5[0] + "k";
            fLIVELLO5.push(new Filter("LIVELLO5", FilterOperator.EQ, value)); // +k
          } fLIVELLO5 = new sap.ui.model.Filter({ filters: fLIVELLO5, and: false });
          return fLIVELLO5;
        }

      },
      filterLivello6: function (LIVELLO6) {

        var value = "";
        if (LIVELLO6 === null || LIVELLO6 === undefined || LIVELLO6 === "") {
          return new Filter("LIVELLO6", FilterOperator.EQ, "");
        } else {

          var fLIVELLO6 = [];

          fLIVELLO6.push(new Filter("LIVELLO6", FilterOperator.EQ, LIVELLO6)); // ++
          value = LIVELLO6[0] + "x";
          fLIVELLO6.push(new Filter("LIVELLO6", FilterOperator.EQ, value));
          // +x

          // -> numero
          if (!isNaN(Number(LIVELLO6))) {
            fLIVELLO6.push(new Filter("LIVELLO6", FilterOperator.EQ, "nn")); // nn
          }

          // 2 -> numero
          if (!isNaN(Number(LIVELLO6[1]))) {
            value = LIVELLO6[0] + "n";
            fLIVELLO6.push(new Filter("LIVELLO6", FilterOperator.EQ, value)); // +n
          } fLIVELLO6 = new sap.ui.model.Filter({ filters: fLIVELLO6, and: false });
          return fLIVELLO6;

        }
      },
      checkSede: async function (sel) {
        // control Sede Tecnica da lvl 3 a lvl 6
        // n = Numero - k = Alfabetico - x = Alfanumerico
        var aFilter = [];
        aFilter.push(new Filter("SEDE_TECNICA", FilterOperator.EQ, sel.SEDE_TECNICA));
        aFilter.push(new Filter("LIVELLO1", FilterOperator.EQ, sel.LIVELLO1));
        aFilter.push(new Filter("LIVELLO2", FilterOperator.EQ, sel.LIVELLO2));

        aFilter.push(this.filterLivello3(sel.LIVELLO3));
        aFilter.push(this.filterLivello4(sel.LIVELLO4));
        aFilter.push(this.filterLivello5(sel.LIVELLO5));
        aFilter.push(this.filterLivello6(sel.LIVELLO6));

        aFilter.push(new Filter("LANGUAGE", FilterOperator.EQ, "IT")); // fisso IT - todo

        var result = await this._getLine("/Sede", aFilter);
        if (result.SEDE_TECNICA !== undefined) {
          this.DESC_SEDE = result.DESC_SEDE;
          return true;
        } else {
          return false;
        }
      },
      onUpload: function (e) {
        this._import(e.getParameter("files") && e.getParameter("files")[0]);
      },
      _import: function (file) {
        debugger
        var that = this;
        var oMainModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(oMainModel, "uploadModel");
        var excelData = {};
        if (file && window.FileReader) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, { type: 'binary' });
            workbook.SheetNames.forEach(function (sheetName) { 
              debugger // Here is your object for every sheet in workbook
              excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
              if (excelData.length > 0) {
                that.getView().getModel("uploadModel").setData(excelData);
                that.getView().getModel("uploadModel").refresh(true);
              }
            });
          };
          reader.onerror = function (ex) {
            console.log(ex);
          };
          reader.readAsBinaryString(file);
        }
      },
      _updateHanaNoError: function (sURL, oEntry) {
        var xsoDataModelReport = this.getOwnerComponent().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.update(sURL, oEntry, {
            success: function (oDataIn) {
              resolve(oDataIn);
            },
            error: function () {
              resolve([]);
            }
          });
        });
      },
      _updateHana: function (sURL, oEntry) {
        var xsoDataModelReport = this.getOwnerComponent().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.update(sURL, oEntry, {
            success: function (oDataIn) {
              resolve(oDataIn);
            },
            error: function (err) {
              var responseObject = JSON.parse(err.responseText);
              reject(MessageBox.error(responseObject.error.message.value));
            }
          });
        });
      },
      _removeHana: function (URL) {
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve) {
          xsoDataModelReport.remove(URL, {
            success: function () {
              resolve();
            },
            error: function () {
              resolve();
            }
          });
        });
      },
      _saveHana: function (URL, sData) {
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.create(URL, sData, {
            success: function (oDataIn) {
              resolve(oDataIn);
            },
            error: function (err) {
              var responseObject = JSON.parse(err.responseText);
              if (responseObject.error.message.value === "MODIFICA KO" || responseObject.error.message.value === "Insert Error" ) {
                reject(MessageBox.error("Esiste già un inserimento con la stessa chiave"));
              } else {
                reject(MessageBox.error(responseObject.error.message.value));
              }
            }
          });
        });
      },
      _saveHanaNoError: function (URL, sData) {
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve, reject) {
            xsoDataModelReport.create(URL, sData, {
                success: function (oDataIn) {
                    resolve(oDataIn);
                },
                error: function () {
                  resolve([]);
                }
            });
        });
    },
      _getLine: function (Entity, Filters) {
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.read(Entity, {
            filters: Filters,
            urlParameters: {
              "$top": 1
            },
            success: function (oDataIn) {
              if (oDataIn.results[0] !== undefined) {
                resolve(oDataIn.results[0]);
              } else {
                resolve(oDataIn);
              }
            },
            error: function (err) {
              var responseObject = JSON.parse(err.responseText);
              reject(MessageBox.error(responseObject.error.message.value))
            }
          });
        });
      },
      _getLinenoError: function (Entity, Filters) {
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve) {
          xsoDataModelReport.read(Entity, {
            filters: Filters,
            urlParameters: {
              "$top": 1
            },
            success: function (oDataIn) {
              if (oDataIn.results[0] !== undefined) {
                resolve(oDataIn.results[0]);
              } else if (oDataIn.results !== undefined) {
                resolve(oDataIn.results);
              } else {
                resolve(oDataIn);
              }
            },
            error: function () {
              resolve(undefined);
            }
          });
        });
      },
      _getLastItemData: function (Entity, Filters, SortBy) {
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve, reject) {
          xsoDataModelReport.read(Entity, {
            filters: Filters,
            sorters: [new Sorter(SortBy, true)],
            urlParameters: {
              "$select": SortBy,
              "$top": 1
            },
            success: function (oDataIn) {
              if (oDataIn.results[0] !== undefined) {
                if (oDataIn.results[0][SortBy] === null) {
                  resolve(0);
                } else {
                  resolve(oDataIn.results[0][SortBy]);
                }
              } else {
                resolve(0);
              }
            },
            error: function (err) {
              var responseObject = JSON.parse(err.responseText);
              reject(MessageBox.error(responseObject.error.message.value))
            }
          });
        });
      },
      _getTableDistinct: function (Entity, Filters, Columns) {
        var xsoDataModelReport = this.getView().getModel();
        return new Promise(function (resolve) {
          xsoDataModelReport.read(Entity, {
            filters: Filters,
            urlParameters: {
              "$select": Columns
            },
            success: function (oDataIn) {
              resolve(oDataIn.results);
            },
            error: function () {
              resolve();
            }
          });
        });
      },
    

    });
  });
