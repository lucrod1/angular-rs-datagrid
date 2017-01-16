'use strict';

angular.module("rs.datagrid")
  .filter("propsFilter", function() {
    var removeAccents;
    removeAccents = function(strValAccents) {
      var accents, accentsOut, strAccents, strAccentsLen, strAccentsOut, y;
      strAccentsOut = [];
      if (strValAccents) {
        strAccents = strValAccents.toString().split('');
        strAccentsLen = strAccents.length;
        accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
        accentsOut = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
        y = 0;
        while (y < strAccentsLen) {
          if (accents.indexOf(strAccents[y]) !== -1) {
            strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
          } else {
            strAccentsOut[y] = strAccents[y];
          }
          y++;
        }
        strAccentsOut = strAccentsOut.join('');
      }
      return strAccentsOut;
    };
    return function(items, props, search, internal) {
      var out;
      out = [];
      if (angular.isArray(items)) {
        items.forEach(function(item) {
          var i, itemMatches, keys, prop, text;
          itemMatches = false;
          i = 0;
          while (i < props.length) {
            prop = props[i];
            text = removeAccents(search).toString().toLowerCase();
            if (internal) {
              if (item._internal[prop] && removeAccents(item._internal[prop]).toString().toLowerCase().indexOf(text) !== -1) {
                itemMatches = true;
                break;
              }
            } else {
              if (item[prop] && removeAccents(item[prop]).toString().toLowerCase().indexOf(text) !== -1) {
                itemMatches = true;
                break;
              }
            }
            i++;
          }
          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        out = items;
      }
      return out;
    };
  });
