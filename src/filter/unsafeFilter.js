'use strict';

angular.module("rs.datagrid")
  .filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
      return $sce.trustAsHtml(val);
    };
  }]);