'use strict';

angular.module("rs.datagrid")
  .filter('unsafe', function ($sce) {
    return function (val) {
      return $sce.trustAsHtml(val);
    };
  });