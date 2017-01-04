'use strict';

angular.module('rs.datagrid', ['ui.utils.masks'])
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
        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES OF SCOPE
        ///////////////////////////////////////////////////////////////////////////////////////////////
        scope.collumns = scope.config.collumns;
        scope.buttons = scope.config.buttons;
        scope.hasPagination = false;
        scope.messageLoading = scope.config.messageLoading;
        scope.hasSearch = false;
        scope.currentPage = 0;
        scope.avaliablesPages = [];
        scope.avaliablesChoises = [];

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // INIT SET PROPERT SHOW ACTIONS
        ///////////////////////////////////////////////////////////////////////////////////////////////
        angular.forEach(scope.collumns, function(collumn) {
          collumn.isHtml = collumn.isHtml || false;
          collumn.isLink = showLink(collumn);
          collumn.isCheckBox = showCheckbox(collumn);
          collumn.isInputWithoutMask = showInputWithoutMask(collumn);
          collumn.isInputNumberMask = showInputNumberMask(collumn);
          collumn.isInputNumberMaskNegative = showInputNumberMaskNegative(collumn);
          collumn.isInputMoneyMask = showInputMoneyMask(collumn);
          collumn.isInputPhoneMask = showInputPhoneMask(collumn);
          collumn.isInputCepMask = showInputCepMask(collumn);
          collumn.isInputCpfMask = showInputCpfMask(collumn);
          collumn.isInputCnpjMask = showInputCnpjMask(collumn);
          collumn.isInputCpfCnpjMask = showInputCpfCnpjMask(collumn);
          collumn.isCombo = showCombo(collumn);
        });

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // INIT SET PROPERT VALUES NG.MODELS FOR ACTIONS
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function setValuesActions(collection) {
          for (var i = 0; i < scope.collumns.length; i++) {
            var collumn = scope.collumns[i];
            var action = false;
            if (collumn.action && collumn.action.type) {
              action = collumn.action.type;
              angular.forEach(collection.content, function(row) {
                switch(action){
                  case 'input':
                    row.valueInput = getValueObjectEvalBykey(row, collumn.index);
                  break;
                  case 'combo':
                    row.valueCombo = getValueObjectEvalBykey(row, collumn.index);
                }
              });
            }
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // REFRESH TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function refresh(page) {
          scope.showProgress = true;
          scope.config.lazyData(page, scope.pagination.defaultSize, getCurrentSort(), scope.pagination.search).then(function() {
            scope.showProgress = false;
            scope.currentPage = page;
          });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS FOR PRINT STYLES OR CLASS IN TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////
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

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS FOR SEARCH IN TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////
        if (scope.config.search) {
          scope.hasSearch = true;
          scope.search = scope.config.search; //EXPOSE SEARCH IN SCOPE
        }

        scope.$watch('pagination.search', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            refresh(0);
          }
        });

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS FOR SORT IN TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////
        scope.hasSort = false;
        if (angular.isDefined(scope.config.sort)) {
          scope.hasSort = scope.config.sort;
        }

        if (!scope.config.defaultSort) {
          var col = scope.collumns[0].sortCollumn || scope.collumns[0].index;
          scope.config.defaultSort = col + ',' + 'asc';
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
          if (hasSortCollumn(collumn)) {
            return 'pointer';
          } else {
            return 'default';
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
          } else if (!directionSortAsc && direction === 'desc' && collumSort === col) {
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
        // VARIABLES AND METHODS FOR PAGINATION IN TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////
        if (scope.config.pagination) {
          scope.hasPagination = true;
          scope.pagination = scope.config.pagination; //EXPOSE PAGINATION IN SCOPE

          if (!angular.isDefined(scope.config.lazyData)) {
            throw new Exception('Missing property', 'function "lazyData" property is required for grid with pagination and this property is missing in config:');
          } else {
            scope.showInfoProgress = true; //CALL WHEN INIT COMPONENT
            scope.config.lazyData(scope.currentPage, scope.pagination.defaultSize, getCurrentSort()).then(function() {
              scope.showInfoProgress = false;
            });
          }
        }

        scope.$watchCollection('collection', function(dados) {
          if (dados) {
            // console.log('watch collection');
            makePagination();
            setValuesActions(dados);
          }
        });

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

        scope.changePaginationSize = function() {
          refresh(0);
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS FOR PRINT CONTENT CELL
        ///////////////////////////////////////////////////////////////////////////////////////////////
        angular.isUndefinedOrNull = function(val) {
          return angular.isUndefined(val) || val === null;
        };

        function getValueObjectEvalByIndex(currentObject, indexCollumn) {
          var index = scope.collumns[indexCollumn].index;
          try {
            var item = eval("currentObject." + index);
            if (!angular.isUndefinedOrNull(item)) {
              return item;
            }
          } catch (error) {}
        }

        function getValueObjectEvalBykey(currentObject, key) {
          try {
            var item = eval("currentObject." + key);
            if (!angular.isUndefinedOrNull(item)) {
              return item;
            }
          } catch (error) {}
        }

        scope.getContentCell = function(currentObject, indexCollumn) {
          var hasAction = angular.isDefined(scope.collumns[indexCollumn].action);
          var isRenderFunction = angular.isFunction(scope.collumns[indexCollumn].render);

          if (hasAction) {
            var action = scope.collumns[indexCollumn].action;

            switch (action.type) {
              case 'href':
                renderHref(isRenderFunction, currentObject, indexCollumn);
                break;

              case 'checkbox':
                renderLabelCheckbox(isRenderFunction, currentObject, indexCollumn);
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

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS ACTION HREF
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function renderHref(isRenderFunction, currentObject, indexCollumn) {
          if (isRenderFunction) {
            currentObject.textLink = scope.config.collumns[indexCollumn].render(currentObject);
          } else {
            currentObject.textLink = getValueObjectEvalByIndex(currentObject, indexCollumn);
          }
        }

        function showLink(collumn) {
          if (angular.isDefined(collumn.action)) {
            return collumn.action.type === 'href';
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

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS ACTION CHECKBOX
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function renderLabelCheckbox(isRenderFunction, currentObject, indexCollumn) {
          if (isRenderFunction) {
            currentObject.textCheckbox = scope.config.collumns[indexCollumn].render(currentObject);
          }
        }

        function showCheckbox(collumn) {
          if (angular.isDefined(collumn.action)) {
            return collumn.action.type === 'checkbox';
          }
          return false;
        };

        scope.clickCheckbox = function(row, indexCollumn, checked) {
          var collumn = scope.collumns[indexCollumn];
          var count = 0;
          angular.forEach(scope.collection.content, function(row) {
            if (row[collumn.index]) {
              count++;
            }
          });

          if (count === scope.collection.content.length) {
            collumn.checkboxHeader = true;
          } else {
            collumn.checkboxHeader = false;
          }

          if (angular.isFunction(collumn.action.callback)) {
            collumn.action.callback(row, checked);
          }
          // else {
          //   throw new Exception('Missing property', 'function "callback" property is missing, in collum with title:' + collumn.title + ' ');
          // }
        };

        scope.clickCheckboxHeader = function(collumn, checked) {
          angular.forEach(scope.collection.content, function(row) {
            row[collumn.index] = checked;
          });

          if (angular.isFunction(collumn.action.callbackHeader)) {
            collumn.action.callbackHeader(checked);
          }
          // else {
          //   throw new Exception('Missing property', 'function "callbackHeader" property is missing, in header collum checkbox with title:' + collumn.title + ' ');
          // }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS ACTION INPUT
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function showInputWithMask(collumn, typeMask) {
          if (angular.isDefined(collumn.action)) {
            return collumn.action.type === 'input' && collumn.action.mask && collumn.action.mask.use === typeMask;
          }
          return false;
        }

        function showInputWithoutMask(collumn) {
          if (angular.isDefined(collumn.action)) {
            return collumn.action.type === 'input' && !collumn.action.mask;
          }
          return false;
        };

        function showInputCpfCnpjMask(collumn) {
          return showInputWithMask(collumn, 'br-cpfcnpj')
        }

        function showInputCnpjMask(collumn) {
          return showInputWithMask(collumn, 'br-cnpj');
        }

        function showInputCpfMask(collumn) {
          return showInputWithMask(collumn, 'br-cpf');
        }

        function showInputCepMask(collumn) {
          return showInputWithMask(collumn, 'br-cep');
        }

        function showInputPhoneMask(collumn) {
          return showInputWithMask(collumn, 'br-phone');
        }

        function showInputMoneyMask(collumn) {
          return showInputWithMask(collumn, 'money');
        }

        function showInputNumberMask(collumn) {
          return showInputWithMask(collumn, 'number') && !collumn.action.mask.negative;
        }

        function showInputNumberMaskNegative(collumn) {
          return showInputWithMask(collumn, 'number') && collumn.action.mask.negative;
        }

        scope.isDisabledInput = function(row, collumn) {
          if (angular.isFunction(collumn.action.isDisabled)) {
            return collumn.action.isDisabled(row);
          }
          return false;
        };

        scope.blurInput = function(row, collumn, value) {
          if (angular.isFunction(collumn.action.callback) && (collumn.action.trigger === 'blur' || !collumn.action.trigger)) {
            collumn.action.callback(row, value);
          }
        };

        scope.blurInputCpfCnpj = function(event, row, collumn, value) {
          if (angular.isFunction(collumn.action.callback) && (collumn.action.trigger === 'blur' || !collumn.action.trigger)) {
            var valid = true;
            if (event.target.classList.contains('ng-invalid-cpf') || event.target.classList.contains('ng-invalid-cnpj')) {
              valid = false;
            }
            collumn.action.callback(row, value, valid);
          }
        };

        scope.changeInput = function(row, collumn, value) {
          if (angular.isFunction(collumn.action.callback) && (collumn.action.trigger === 'change')) {
            collumn.action.callback(row, value);
          }
        };

        scope.changeInputCpfCnpj = function(event, row, collumn, value) {
          if (angular.isFunction(collumn.action.callback) && (collumn.action.trigger === 'change')) {
            var valid = true;
            if (event.target.classList.contains('ng-invalid-cpf') || event.target.classList.contains('ng-invalid-cnpj')) {
              valid = false;
            }
            collumn.action.callback(row, value, valid);
          }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS ACTION COMBO
        ///////////////////////////////////////////////////////////////////////////////////////////////
        scope.getLabelCombo = function(row, collumn, item) {
          if (collumn.action.type === 'combo' && angular.isFunction(collumn.action.labelFunction)) {
            return collumn.action.labelFunction(item);
          } else {
            throw new Exception('Missing property', ' "labelFunction" function property is required for action combo');
          }
        };

        scope.getValueCombo = function(row, collumn, item) {
          if (collumn.action.type === 'combo' && angular.isFunction(collumn.action.valueFunction)) {
            return collumn.action.valueFunction(item);
          } else {
            throw new Exception('Missing property', ' "valueFunction" function property is required for action combo');
          }
        };

        scope.isDisabledCombo = function(row, collumn) {
          if (angular.isFunction(collumn.action.isDisabled)) {
            return collumn.action.isDisabled(row);
          }
          return false;
        };

        function showCombo(collumn) {
          var ret = false;
          if (angular.isDefined(collumn.action)) {
            ret = collumn.action.type === 'combo';
          }

          if (ret) {
            if (collumn.action.avaliablesChoises) {
              scope.avaliablesChoises = collumn.action.avaliablesChoises;
            } else {
              throw new Exception('Missing property', ' "avaliablesChoises" property is required for action combo in collumn: ' + indexCollumn);
            }
          }

          return ret;
        };

        scope.changeCombo = function(row, collumn, value) {
          if (angular.isFunction(collumn.action.callback) && (collumn.action.type === 'combo')) {
            collumn.action.callback(row, value);
          }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS BUTTONS 
        ///////////////////////////////////////////////////////////////////////////////////////////////
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
      }
    };
  });
