sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
    "use strict";

    return {
      formatDate3: function (sValue) {
        if (sValue === "" || sValue === undefined || sValue === null) {
          return "";
        } else {
          var vDate = new Date();
          vDate.setMonth(sValue.split("/")[1] - 1);

          var options = {
            style: 'medium'
          };
          var df = DateFormat.getDateInstance(options);
          return df.format(vDate);

        }
      },

      formatDate2: function (sValue) {

        if (sValue === "" || sValue === undefined || sValue === null) {
          return "";
        } else {
          jQuery.sap.require("sap.ui.core.format.DateFormat");
          var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
            pattern: "dd-MM-yyyy"
          });

          return oDateFormat.format(new Date(sValue), true);
        }
      },

      formatDate: function (value) {
        if (value === "" || value === undefined || value === null) {
          return "";
        } else {
          var options = {
            style: 'medium'
          };
          var df = DateFormat.getDateInstance(options);
          return df.format(value);

        }
      },
      UzeitFormatter: function (sUzeit) {
        if (sUzeit !== undefined && sUzeit !== null){
        if (sUzeit.ms !== undefined){
          return sUzeit.ms;
        } else {
          return "";
        }
      } else {
        return "";
      }
      },
      formatAttivo: function (Attivo) {
        if (Attivo === "X"){
          return true;
        } else {
          return false;
        }
      },
      statoEnabled: function (vStato) {
        if (vStato === "M"){
          return false;
        } else {
          return true;
        }
    },

        existAzioni: function (sAzione) {
            if (sAzione.length === 0){
              return false;
            } else {
              return true;
            }
        },
        stripInitialChars: function (sInput) {
            return sInput !== undefined && sInput !== null ? sInput.replace(/^0+/, '') : sInput;
        },
        alphaOutput: function (sNumber) {
            return this.LocalFormatter.stripInitialChars(sNumber, "0");
        }
    };
});
