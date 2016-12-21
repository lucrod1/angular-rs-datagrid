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
        scope.messageLoading = scope.config.messageLoading;
        scope.hasSearch = false;
        scope.currentPage = 0;
        scope.avaliablesPages = [];

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS FOR SORT IN TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////
        scope.hasSort = false;
        if (angular.isDefined(scope.config.sort)) {
          scope.hasSort = scope.config.sort;
        }

        if (!scope.config.defaultSort) {
          scope.config.defaultSort = scope.collumns[0].index + ',' + 'asc';
        }

        var directionSortAsc = getDirectionSortAsc();
        var collumSort = getCollumnSort();

        function getCurrentSort() {
          if (directionSortAsc) {
            return collumSort + ',asc';
          } else {
            return collumSort + ',desc';
          }
        }

        function getCollumnSort() {
          return scope.config.defaultSort.split(',')[0];
        }

        function getDirectionSortAsc() {
          if (scope.config.defaultSort.split(',')[1] === 'asc') {
            return true;
          } else {
            return false;
          }
        }

        scope.getCursorCollumn = function(collumn) {
          if (angular.isDefined(collumn.sort)) {
            if (collumn.sort) {
              return 'pointer';
            } else {
              return 'default';
            }
          } else if (angular.isDefined(scope.config.sort)) {
            if (scope.config.sort) {
              return 'pointer';
            } else {
              return 'default';
            }
          }
        };

        scope.sortCollumn = function(collumn) {
          var ordernar = hasSortCollumn(collumn);

          if (ordernar) {
            var col = collumn.sortCollumn || collumn.index;
            if (collumSort !== col) {
              directionSortAsc = true;
            } else {
              directionSortAsc = !directionSortAsc;
            }
            collumSort = col;
            refresh(0);
          }
        };

        scope.hasSortCollumnDirection = function(collumn, direction) {
          var col = collumn.sortCollumn || collumn.index;
          if (direction === 'all' && collumSort !== col) {
            return hasSortCollumn(collumn);
          } else if (directionSortAsc && direction === 'asc' && collumSort === col) {
            return hasSortCollumn(collumn);
          } else if (!directionSortAsc && direction === 'desc'  && collumSort === col) {
            return hasSortCollumn(collumn);
          }
        };

        function hasSortCollumn(collumn) {
          if (angular.isDefined(collumn.sort)) {
            return collumn.sort;
          } else {
            return scope.hasSort;
          }
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////
        // FIM SORT
        ///////////////////////////////////////////////////////////////////////////////////////////////

        if (scope.config.pagination) {
          scope.hasPagination = true;
          scope.pagination = scope.config.pagination;

          if (!angular.isDefined(scope.config.lazyData)) {
            throw new Exception('Missing property', 'function "lazyData" property is required for grid with pagination and this property is missing in config:');
          } else {
            scope.showInfoProgress = true;
            scope.config.lazyData(scope.currentPage, scope.pagination.defaultSize, getCurrentSort()).then(function() {
              scope.showInfoProgress = false;
            });
          }
        }

        if (scope.config.search) {
          scope.hasSearch = true;
          scope.search = scope.config.search;
        }

        function makePagination() {
          scope.avaliablesPages = [];
          var totalPages = scope.collection.totalPages;
          var start = angular.copy(scope.currentPage);

          if (start - 2 >= 1) {
            start = start - 2;
          } else {
            start = 0;
          }

          //reajustando o start quando pagina for ultima ou penultima
          if (totalPages > 2) {
            if (scope.currentPage === totalPages - 2) {
              start--;
            } else if (scope.currentPage === totalPages - 1) {
              start = start - 2;
            }
          }

          var count = 0;

          while (count < 5) {
            var index = start + count;
            var label = start + count + 1;
            if (label <= totalPages) {
              scope.avaliablesPages.push({
                index: index,
                label: label
              });
            }
            count++;
          }
        }

        scope.$watchCollection('collection', function(dados) {
          if (dados) {
            console.log('watch collection');
            makePagination();
          }
        });

        scope.prevPage = function() {
          if (scope.currentPage !== 0) {
            refresh(scope.currentPage - 1);
          }
        };

        scope.nextPage = function() {
          if (scope.currentPage !== scope.collection.totalPages - 1) {
            refresh(scope.currentPage + 1);
          }
        };

        scope.goToPage = function(page) {
          refresh(page);
        };

        function refresh(page) {
          scope.showProgress = true;
          scope.config.lazyData(page, scope.pagination.defaultSize, getCurrentSort(), scope.pagination.search).then(function() {
            scope.showProgress = false;
            scope.currentPage = page;
          });
        }

        scope.changePaginationSize = function() {
          refresh(0);
        };

        scope.$watch('pagination.search', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            refresh(0);
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
            } else {
              return false;
            }
          }
          return true;
        };

        angular.isUndefinedOrNull = function(val) {
          return angular.isUndefined(val) || val === null;
        };

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
