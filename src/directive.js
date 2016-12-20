'use strict';

angular.module('rs.datagrid', [])
  .directive('rsDatagrid', function($sce) {
    function Exception(type, message) {
      this.type = type;
      this.message = message;
    }

    return {
      restrict: 'AE',
      templateUrl: 'directive-template.html',
      scope: {
        collection: "=",
        config: "="
      },
      replace: true,
      link: function(scope, elem, attrs, ctrl) {
        scope.collumns = scope.config.collumns;
        scope.buttons = scope.config.buttons;
        scope.hasPagination = false;
        scope.hasSearch = false;
        scope.currentPage = 0;
        scope.currentSort = 'id,asc';

        if (scope.config.pagination) {
          scope.hasPagination = true;
          scope.pagination = scope.config.pagination;

          if (!angular.isDefined(scope.config.lazyData)) {
            throw new Exception('Missing property', 'function "lazyData" property is required for grid with pagination and this property is missing in config:');
          } else {
            scope.config.lazyData(scope.currentPage, scope.pagination.defaultSize, scope.currentSort);
          }
        }

        if (scope.config.search) {
          scope.hasSearch = true;
          scope.search = scope.config.search;
        }

        scope.changePaginationSize = function() {
          scope.config.lazyData(scope.currentPage, scope.pagination.defaultSize, scope.currentSort, scope.pagination.search);
        };

        scope.hasSortCollumn = function(indexCollumn) {
          if (angular.isDefined(scope.collumns[indexCollumn].sort)) {
            return scope.collumns[indexCollumn].sort;
          } else if (angular.isDefined(scope.config.sort)) {
            return scope.config.sort;
          }
        };

        scope.$watch('pagination.search', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            scope.config.lazyData(scope.currentPage, scope.pagination.defaultSize, scope.currentSort, scope.pagination.search);
          }
        });

        scope.getClassTable = function() {
          if (scope.config.classTable) {
            return scope.config.classTable;
          } else {
            return 'table table-bordered table-striped';
          }
        };

        scope.getClass = function(indexCollumn) {
          return scope.collumns[indexCollumn].class;
        };

        scope.isHtml = function(indexCollumn) {
          return scope.collumns[indexCollumn].isHtml;
        };

        function getLabelHref(currentObject, indexCollumn) {
          if (scope.collumns[indexCollumn].editable && scope.collumns[indexCollumn].editable.staticText) {
            return scope.collumns[indexCollumn].editable.staticText;
          } else {
            return currentObject[scope.collumns[indexCollumn].index];
          }
        }

        scope.showLink = function(indexCollumn) {
          if (angular.isDefined(scope.collumns[indexCollumn].action)) {
            return scope.collumns[indexCollumn].action.type === 'href';
          }
          return false;
        };

        scope.clickLink = function(currentObject, indexCollumn) {
          if (angular.isFunction(scope.collumns[indexCollumn].action.callback)) {
            scope.collumns[indexCollumn].action.callback(currentObject);
          } else {
            throw new Exception('Missing property', 'function "callback" property is missing, in collum:' + indexCollumn + ' ');
          }
        };

        scope.isVisibleButton = function(instanceButton, currentObject, indexCollumn) {
          if (angular.isFunction(instanceButton.isVisible)) {
            var isVisible = instanceButton.isVisible(currentObject);

            if (isVisible) {
              return true;
            }
          }
          return false;
        };

        angular.isUndefinedOrNull = function(val) {
          return angular.isUndefined(val) || val === null
        }

        function getValueObjectEvalByIndex(currentObject, indexCollumn) {
          var index = scope.collumns[indexCollumn].index;
          var item = eval("currentObject." + index);
          if (!angular.isUndefinedOrNull(item)) {
            return item;
          }
        }

        scope.getContentCell = function(currentObject, indexCollumn) {
          var hasAction = angular.isDefined(scope.collumns[indexCollumn].action);
          var isRenderFunction = angular.isFunction(scope.collumns[indexCollumn].render);

          if (hasAction) {
            var action = scope.collumns[indexCollumn].action;

            switch (action.type) {
              case 'href':
                if (isRenderFunction) {
                  currentObject.textLink = scope.config.collumns[indexCollumn].render(currentObject);
                } else {
                  currentObject.textLink = getValueObjectEvalByIndex(currentObject, indexCollumn);
                }
                break;
            }
          } else {
            if (isRenderFunction) {
              return scope.config.collumns[indexCollumn].render(currentObject);
            } else {
              return getValueObjectEvalByIndex(currentObject, indexCollumn);
            }
          }
        };
      }
    };
  });
