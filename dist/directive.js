/*!
 * angular-rs-datagrid
 * 
 * Version: 1.0.56 - 2017-08-03T13:16:53.775Z
 * License: MIT
 */


'use strict';

angular.module('rs.datagrid', ['ui.utils.masks', 'ui.select'])
  .directive('rsDatagrid', ['$locale', '$filter', function($locale, $filter) {
    return {
      restrict: 'AE',
      templateUrl: 'directive-template.html',
      scope: {
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
        scope.messageLoading = scope.config.messageLoading || 'loading...';
        scope.hasSearch = false;
        scope.currentPage = 0;
        scope.avaliablesPages = [];
        scope.avaliablesChoises = [];
        scope.avaliablesChoisesChosen = [];
        scope.avaliablesChoisesMultiChosen = [];
        scope.currentTr = null;
        scope.filter = {
          search: null
        };

        if (scope.config.pagination) {
          scope.hasPagination = true;
        }

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
          collumn.isChosenSelectize = showChosen(collumn, 'selectize');
          collumn.isChosenSelect2 = showChosen(collumn, 'select2');
          collumn.isMultiChosen = showMultiChosen(collumn);
          scope.containPopover = showPopover();
        });


        ///////////////////////////////////////////////////////////////////////////////////////////////
        // INIT SET PROPERT VALUES NG.MODELS FOR ACTIONS
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function setValuesInternal(collection) {
          for (var i = 0; i < scope.collumns.length; i++) {
            var collumn = scope.collumns[i];
            var count = 0;
            angular.forEach(collection.content, function(row) {
              //checkboxHeader
              if (collumn.action && collumn.action === 'checkbox' && row[collumn.index]) {
                count++;
              }
              setAttrInternal(row, collumn);
            });
            if (count === scope.collection.content.length && scope.collection.content.length > 0) {
              collumn.checkboxHeader = true;
            } else {
              collumn.checkboxHeader = false;
            }
          }
        }

        function setAttrInternal(row, collumn) {
          if (angular.isUndefined(row._internal)) {
            row._internal = {};
          }
          if (angular.isUndefined(collumn.index)) {
            throw new Error('Missing property, "index" property is required for column');
          }
          if (angular.isFunction(collumn.render)) {
            return row._internal[collumn.index] = collumn.render(row);
          }

          if (collumn.action) {
            if (collumn.action.type === 'input' && collumn.action.mask) {
              row._internal[collumn.index] = undefined;
              switch (collumn.action.mask.use) {
                case 'number':
                  if (row[collumn.index]) {
                    return row._internal[collumn.index] = row[collumn.index].toString().replace('.', $locale.NUMBER_FORMATS.DECIMAL_SEP);
                  }
                  break;
                case 'money':
                  if (row[collumn.index]) {
                    return row._internal[collumn.index] = $locale.NUMBER_FORMATS.CURRENCY_SYM + ' ' + row[collumn.index].toString().replace('.', $locale.NUMBER_FORMATS.DECIMAL_SEP);
                  }
                  break;
                case 'br-cpf':
                case 'br-cnpj':
                case 'br-cpfcnpj':
                  if (row[collumn.index]) {
                    return row._internal[collumn.index] = $filter('rsCpfCnpjFilter')(row[collumn.index]);
                  }
                  break;
                default:
                  return row._internal[collumn.index] = row[collumn.index];
                  break;
              }
              if (collumn.action.type === 'chosen') {
                if (angular.isFunction(collumn.action.selectedRender)) {
                  return row._internal[collumn.index] = collumn.action.selectedRender(row[collumn.index]);
                }
                if (angular.isFunction(collumn.action.itemRender)) {
                  return row._internal[collumn.index] = collumn.action.itemRender(row[collumn.index]);
                }
              }
              if (collumn.action.type === 'combo') {
                return row._internal[collumn.index] = row[collumn.index];
              }
            }
          }
          if (angular.isDefined(row[collumn.index]) && row[collumn.index] !== null) {
            return row._internal[collumn.index] = row[collumn.index].toString();
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // REFRESH TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////

        //Auxiliary method to set "model" the current page
        scope.config._setCurrentPage = function(page) {
          scope.currentPage = page;
        };

        scope.$on('rsDatagrid:refresh', function(event, args) {
          refresh(scope.currentPage);
        });

        function refresh(page) {
          if (scope.hasPagination) {
            scope.showProgress = true;
            scope.config.lazyData(page, scope.pagination.defaultSize, getCurrentSort(), scope.filter.search).then(function(result) {
              scope.showProgress = false;
              scope.currentPage = page;
              scope.collection = result;
            });
          } else {
            scope.collection = {
              content: scope.config.data()
            };
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS FOR SEARCH IN TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////

        //Auxiliary method for setting a search value in the search field
        scope.config._setSearch = function(search){
          scope.filter.search = search;
        };

        if (scope.config.search) {
          scope.hasSearch = true;
          scope.search = scope.config.search; //EXPOSE SEARCH IN SCOPE
        }

        scope.$watch('filter.search', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            if (scope.hasPagination) {
              refresh(0);
            }
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
            if (scope.hasPagination) {
              refresh(0);
            } else {
              scope.collection.content = $filter('orderBy')(scope.collection.content, "_internal." + col, !directionSortAsc);
            }
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
        if (scope.hasPagination) {
          scope.hasPagination = true;
          scope.pagination = scope.config.pagination; //EXPOSE PAGINATION IN SCOPE

          if (!angular.isDefined(scope.pagination.avaliableSizes)) {
            scope.pagination.avaliableSizes = [10, 25, 50, 100];
          }

          if (!angular.isDefined(scope.pagination.defaultSize)) {
            scope.pagination.defaultSize = scope.pagination.avaliableSizes[0];
          }

          if (!angular.isDefined(scope.pagination.labelSize)) {
            scope.pagination.labelSize = 'Page size:';
          }

          if (angular.isDefined(scope.config.lazyData)) {
            scope.showInfoProgress = true; //CALL WHEN INIT COMPONENT
            var promise = scope.config.lazyData(scope.currentPage, scope.pagination.defaultSize, getCurrentSort());
            if (angular.isObject(promise) && promise.then instanceof Function) {
              promise.then(function(dados) {
                scope.showInfoProgress = false;
                scope.collection = dados;
              });
            } else {
              console.warn('A function "scope.config.lazyData" should be implemented with Promise');
            }
          } else {
            throw new Error('Missing property, function "lazyData" property is required for grid with pagination and this property is missing in config:');
          }
        } else {
          scope.showInfoProgress = true;
          if (angular.isDefined(scope.config.data)) {
            scope.showInfoProgress = false;
            scope.collection = {
              content: scope.config.data()
            };
          } else {
            throw new Error('Missing property, function "data" property is required for grid without pagination and this property is missing in config');
          }
        }

        scope.$watchCollection('collection', function(dados) {
          if (dados) {
            // console.log('watch collection');
            if (scope.hasPagination) {
              makePagination();
            }
            setValuesInternal(dados);
          }
        });

        function makePagination() {
          scope.avaliablesPages = [];
          var totalPages = scope.collection.totalPages;
          var start = angular.copy(scope.currentPage);

          if ( (start - 2 ) >= 1) {
            start = start - 2;
          } else {
            start = 0;
          }

          //reajustando o start quando pagina for ultima ou penultima
          if (totalPages > 2) {
            if (scope.currentPage === (totalPages - 2 )) {
              start--;
            } else if (scope.currentPage === ( totalPages - 1) ) {
              start = start - 2;
            }
          }

          if(start < 0){
            start = 0;
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

        scope.getCollection = function() {
          if (scope.collection) {
            if (scope.hasPagination) {
              if (scope.collection.content.length === 0) {
                scope.showEmptyRow = true;
              } else {
                scope.showEmptyRow = false;
              }
              return scope.collection.content;
            } else {
              var keys = [];
              if (scope.collection.content[0]._internal) {
                keys = Object.keys(scope.collection.content[0]._internal);
              }
              var result = $filter('rsPropsFilter')(scope.collection.content, keys, scope.filter.search, true);
              if (result.length === 0) {
                scope.showEmptyRow = true;
              } else {
                scope.showEmptyRow = false;
              }
              return result;
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
            currentObject.textLink = currentObject[scope.config.collumns[indexCollumn].index];
          }
        }

        function showLink(collumn) {
          if (angular.isDefined(collumn.action)) {
            return collumn.action.type === 'href';
          }
          return false;
        }

        scope.clickLink = function(currentObject, indexCollumn) {
          if (angular.isFunction(scope.collumns[indexCollumn].action.onClick)) {
            scope.collumns[indexCollumn].action.onClick(currentObject);
          } else {
            throw new Error('Missing property, function "onClick" property is missing, in collum:' + indexCollumn + ' ');
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
        }

        scope.isDisabledCheckbox = function(row, collumn) {
          if (angular.isFunction(collumn.action.isDisabled)) {
            return collumn.action.isDisabled(row);
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

          if (count === scope.collection.content.length && scope.collection.content.length > 0) {
            collumn.checkboxHeader = true;
          } else {
            collumn.checkboxHeader = false;
          }

          if (angular.isFunction(collumn.action.onCheck)) {
            collumn.action.onCheck(row, checked);
          }
        };

        scope.clickCheckboxHeader = function(collumn, checked) {
          angular.forEach(scope.collection.content, function(row) {
            if (!scope.isDisabledCheckbox(row, collumn)) {
              row[collumn.index] = checked;
            }
          });

          if (angular.isFunction(collumn.action.onCheckHeader)) {
            collumn.action.onCheckHeader(checked);
          }
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
        }

        function showInputCpfCnpjMask(collumn) {
          return showInputWithMask(collumn, 'br-cpfcnpj');
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

        scope.blurInput = function(row, collumn) {
          if (angular.isFunction(collumn.action.onChange) && (collumn.action.trigger === 'blur' || !collumn.action.trigger)) {
            collumn.action.onChange(row);
          }
        };

        scope.blurInputCpfCnpj = function(event, row, collumn) {
          if (angular.isFunction(collumn.action.onChange) && (collumn.action.trigger === 'blur' || !collumn.action.trigger)) {
            var valid = true;
            if (event.target.classList.contains('ng-invalid-cpf') || event.target.classList.contains('ng-invalid-cnpj')) {
              valid = false;
            }
            collumn.action.onChange(row, valid);
          }
        };

        scope.changeInput = function(row, collumn, value) {
          if (angular.isFunction(collumn.action.onChange) && (collumn.action.trigger === 'change')) {
            collumn.action.onChange(row, value);
          }
        };

        scope.changeInputCpfCnpj = function(event, row, collumn) {
          if (angular.isFunction(collumn.action.onChange) && (collumn.action.trigger === 'change')) {
            var valid = true;
            if (event.target.classList.contains('ng-invalid-cpf') || event.target.classList.contains('ng-invalid-cnpj')) {
              valid = false;
            }
            collumn.action.onChange(row, valid);
          }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS ACTION COMBO
        ///////////////////////////////////////////////////////////////////////////////////////////////
        scope.getLabelCombo = function(row, collumn, item) {
          if (collumn.action.type === 'combo' && angular.isFunction(collumn.action.labelRender)) {
            return collumn.action.labelRender(item);
          } else {
            throw new Error('Missing property,  "labelRender" function property is required for action combo');
          }
        };

        scope.getValueCombo = function(row, collumn, item) {
          if (collumn.action.type === 'combo' && angular.isFunction(collumn.action.valueRender)) {
            var value = collumn.action.valueRender(item);
            if (row[collumn.index].toString() === value) {
              item.selected = true;
            } else {
              item.selected = false;
            }
            return value;
          } else {
            throw new Error('Missing property,  "valueRender" function property is required for action combo');
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
              throw new Error('Missing property,  "avaliablesChoises" property is required for action combo');
            }
          }

          return ret;
        }

        scope.changeCombo = function(row, collumn, value) {
          if (angular.isFunction(collumn.action.onChange) && (collumn.action.type === 'combo')) {
            collumn.action.onChange(row, value);
          }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS ASSIST CHOSEN AND MULTI-CHOSEN
        ///////////////////////////////////////////////////////////////////////////////////////////////
        scope.getAvaliablesChoises = function(array, collumn, search) {
          return $filter('rsPropsFilter')(array, getKeysForSearch(collumn), search, false);
        };


        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS ACTION CHOSEN
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function showChosen(collumn, theme) {
          var ret = false;
          if (angular.isDefined(collumn.action)) {
            ret = collumn.action.type === 'chosen' && collumn.action.theme === theme;
          }

          if (ret) {
            if (collumn.action.avaliablesChoises) {
              scope.avaliablesChoisesChosen = collumn.action.avaliablesChoises;
            } else {
              throw new Error('Missing property,  "avaliablesChoises" property is required for action combo');
            }
          }

          return ret;
        }

        scope.getItemRender = function(item, collumn) {
          if (angular.isFunction(collumn.action.itemRender) && (collumn.action.type === 'chosen')) {
            return collumn.action.itemRender(item);
          }
        };

        function getKeysForSearch(collumn) {
          if (angular.isArray(collumn.action.searchIn)) {
            return collumn.action.searchIn;
          } else {
            throw new Error('Missing propertyaray', ' "searchIn" property is required for action chosen');
          }
          return [];
        }

        scope.getItemSelected = function(item, collumn) {
          if (angular.isFunction(collumn.action.selectedRender) && (collumn.action.type === 'chosen')) {
            if (item) {
              return collumn.action.selectedRender(item);
            }
          } else if (angular.isFunction(collumn.action.itemRender) && (collumn.action.type === 'chosen')) {
            if (item) {
              return collumn.action.itemRender(item);
            }
          }
        };

        scope.changeChosen = function(row, collumn, value) {
          if (angular.isFunction(collumn.action.onChange) && (collumn.action.type === 'chosen')) {
            collumn.action.onChange(row, value);
          }
        };

        scope.isDisabledChosen = function(row, collumn) {
          if (angular.isFunction(collumn.action.isDisabled)) {
            return collumn.action.isDisabled(row);
          }
          return false;
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS ACTION MULTI-CHOSEN
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function showMultiChosen(collumn) {
          var ret = false;
          if (angular.isDefined(collumn.action)) {
            ret = collumn.action.type === 'multiChosen';
          }

          if (ret) {
            if (collumn.action.avaliablesChoises) {
              scope.avaliablesChoisesMultiChosen = collumn.action.avaliablesChoises;
            } else {
              throw new Error('Missing property,  "avaliablesChoises" property is required for action combo');
            }
          }

          return ret;
        }

        scope.isDisabledMultiChosen = function(row, collumn) {
          if (angular.isFunction(collumn.action.isDisabled)) {
            return collumn.action.isDisabled(row);
          }
          return false;
        };

        scope.getMultiItemRender = function(item, collumn) {
          if (angular.isFunction(collumn.action.itemRender) && (collumn.action.type === 'multiChosen')) {
            return collumn.action.itemRender(item);
          }
        };

        scope.onRemove = function(row, collumn, item, model) {
          if (angular.isFunction(collumn.action.onRemove)) {
            return collumn.action.onRemove(row, item, model);
          }
        };

        scope.onSelect = function(row, collumn, item, model) {
          if (angular.isFunction(collumn.action.onSelect)) {
            return collumn.action.onSelect(row, item, model);
          }
        };

        scope.selectedsMultiChosen = function(item, collumn) {
          if (angular.isFunction(collumn.action.selectedsRender) && (collumn.action.type === 'multiChosen')) {
            return collumn.action.selectedsRender(item);
          } else if (angular.isFunction(collumn.action.itemRender) && (collumn.action.type === 'multiChosen')) {
            if (item) {
              return collumn.action.itemRender(item);
            }
          }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS POPOVER 
        ///////////////////////////////////////////////////////////////////////////////////////////////
        var topTable, topTr, leftTable, popover, heightPopover, widthTr, widthPopover;
        scope.getStylePopover = function() {
          popover = angular.element(document.getElementsByClassName('popover'));
          if (scope.currentTr && popover) {
            popover.css('display', 'block');
            topTr = scope.currentTr.offsetTop;
            heightPopover = popover[0].clientHeight;
            widthPopover = popover[0].clientWidth;
            widthTr = scope.currentTr.clientWidth;
            topTable = scope.currentTr.offsetParent.offsetTop;
            leftTable = scope.currentTr.offsetParent.offsetLeft;
            popover.css('top', topTable + topTr - heightPopover + 'px');
            popover.css('left', leftTable + (widthTr / 2) - (widthPopover / 2) + 'px');
          } else {
            popover.css('display', 'none');
          }
        };

        function showPopover() {
          if (scope.config.popoverRow) {
            if (!angular.isDefined(scope.config.popoverRow.ngModel)) {
              throw new Error('Missing property,  "ngModel" property is required for popoverRow, this property represents the model in popover template');
            }
            if (!angular.isDefined(scope.config.popoverRow.templateUrl)) {
              throw new Error('Missing property,  "templateUrl" property is required for popoverRow');
            }
            return true;
          }
          return false;
        }

        scope.hoverTr = function(ev, row) {
          if (scope.containPopover) {
            scope.currentTr = ev.currentTarget;
            if(angular.isFunction(scope.config.popoverRow.getModel)){
              var value = scope.config.popoverRow.getModel(row);
              scope[scope.config.popoverRow.ngModel] = value;  
            }else{
              scope[scope.config.popoverRow.ngModel] = row;
            }
          }
        };

        scope.outTr = function() {
          if (scope.containPopover) {
            scope.currentTr = null;
            scope[scope.config.popoverRow.ngModel] = null;
          }
        };

        scope.getTitlePopover = function() {
          if (scope.containPopover && scope.config.popoverRow.titleRender && scope.currentTr) {
            return scope.config.popoverRow.titleRender(scope[scope.config.popoverRow.ngModel]);
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
  }]);

'use strict';

angular.module("rs.datagrid")
  .filter("rsPropsFilter", function() {
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

'use strict';

angular.module("rs.datagrid")
  .filter("rsCpfCnpjFilter", function() {
    return function(input) {
      var str = input + '';
      if (str.length > 11) {
        str = str.replace(/\D/g, '');
        str = str.replace(/^(\d{2})(\d)/, '$1.$2');
        str = str.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        str = str.replace(/\.(\d{3})(\d)/, '.$1/$2');
        str = str.replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        str = str.replace(/\D/g, '');
        str = str.replace(/(\d{3})(\d)/, "$1.$2");
        str = str.replace(/(\d{3})(\d)/, "$1.$2");
        str = str.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      }
      return str;
    };
  });

angular.module("rs.datagrid").run(["$templateCache", function($templateCache) {$templateCache.put("directive-template.html","<div><div class=\"popover top fade in\" title=\"Tile\" placement=\"top\" html=\"true\" ng-style=\"getStylePopover()\"><div class=\"arrow\"></div><div class=\"popover-inner\"><h3 class=\"popover-title\" ng-if=\"config.popoverRow.titleRender\" ng-bind-html=\"getTitlePopover()\"></h3><div class=\"popover-content\"><ng-include src=\"config.popoverRow.templateUrl\"></ng-include></div></div></div><div ng-if=\"hasPagination\" class=\"pagination_header\"><span ng-bind=\"pagination.labelSize\"></span><select class=\"pagination_select\" ng-change=\"changePaginationSize()\" ng-model=\"pagination.defaultSize\" ng-options=\"size for size in pagination.avaliableSizes\"></select></div><div id=\"loading\" class=\"uil-default-css\" ng-if=\"showProgress\" style=\"transform:scale(0.14);\"><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(0deg) translate(0,-50px);transform:rotate(0deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(30deg) translate(0,-50px);transform:rotate(30deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(60deg) translate(0,-50px);transform:rotate(60deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(90deg) translate(0,-50px);transform:rotate(90deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(120deg) translate(0,-50px);transform:rotate(120deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(150deg) translate(0,-50px);transform:rotate(150deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(180deg) translate(0,-50px);transform:rotate(180deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(210deg) translate(0,-50px);transform:rotate(210deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(240deg) translate(0,-50px);transform:rotate(240deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(270deg) translate(0,-50px);transform:rotate(270deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(300deg) translate(0,-50px);transform:rotate(300deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(330deg) translate(0,-50px);transform:rotate(330deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div></div><div ng-if=\"hasSearch\" class=\"pagination_search\"><span ng-bind=\"search.label\"></span> <input type=\"text\" name=\"search\" ng-keyup=\"keyup(filter.search)\" ng-model-options=\"{debounce: 1000 }\" ng-model=\"filter.search\" id=\"searchValue\"> {{searchValue}}</div><br style=\"clear: both;\"><span class=\"pull-right\">Total: {{hasPagination ? collection.totalElements : collection.content.length}}</span><table ng-class=\"config.classTaable || \'table table-bordered table-striped\'\"><thead><tr><th ng-class=\"collumn.class\" ng-style=\"collumn.style\" style=\"cursor: {{getCursorCollumn(collumn)}}\" ng-click=\"sortCollumn(collumn)\" ng-repeat=\"collumn in collumns track by $index\"><input ng-click=\"clickCheckboxHeader(collumn, collumn.checkboxHeader)\" ng-if=\"collumn.action.type ===\'checkbox\' && collumn.action.checkInHeader\" type=\"checkbox\" ng-model=\"collumn.checkboxHeader\" name=\"checkbox_0\" id=\"checkbox_0\"> {{collumn.title}} <i ng-if=\"hasSortCollumnDirection(collumn, \'asc\')\" class=\"icon-sort asc\"></i> <i ng-if=\"hasSortCollumnDirection(collumn, \'desc\')\" class=\"icon-sort desc\"></i> <i ng-if=\"hasSortCollumnDirection(collumn, \'all\')\" class=\"icon-sort asc-desc\"></i></th></tr></thead><tbody><tr ng-if=\"!showInfoProgress\" ng-mouseover=\"hoverTr($event, row)\" ng-mouseout=\"outTr()\" ng-repeat=\"row in getCollection() track by $index\"><td ng-class=\"collumn.class\" ng-style=\"collumn.style\" ng-repeat=\"collumn in collumns track by $index\"><div style=\"display: inline-block;\" ng-if=\"collumn.isHtml && !collumn.action\" ng-bind-html=\"row._internal[collumn.index]\"></div><div style=\"display: inline-block;\" ng-if=\"!collumn.isHtml && !collumn.action\" ng-bind=\"row._internal[collumn.index]\"></div><a ng-click=\"clickLink(row, $index)\" ng-if=\"collumn.isLink\" ng-bind=\"row._internal[collumn.index]\"></a><ng-include src=\"\'templates/checkbox-template.html\'\" ng-if=\"collumn.isCheckBox\"></ng-include><ng-include src=\"\'templates/input-template.html\'\" ng-if=\"collumn.isInputWithoutMask\"></ng-include><ng-include src=\"\'templates/input-number-template.html\'\" ng-if=\"collumn.isInputNumberMask\"></ng-include><ng-include src=\"\'templates/input-number-negative-template.html\'\" ng-if=\"collumn.isInputNumberMaskNegative\"></ng-include><ng-include src=\"\'templates/input-money-template.html\'\" ng-if=\"collumn.isInputMoneyMask\"></ng-include><ng-include src=\"\'templates/input-phone-template.html\'\" ng-if=\"collumn.isInputPhoneMask\"></ng-include><ng-include src=\"\'templates/input-cep-template.html\'\" ng-if=\"collumn.isInputCepMask\"></ng-include><ng-include src=\"\'templates/input-cpf-template.html\'\" ng-if=\"collumn.isInputCpfMask\"></ng-include><ng-include src=\"\'templates/input-cnpj-template.html\'\" ng-if=\"collumn.isInputCnpjMask\"></ng-include><ng-include src=\"\'templates/input-cpfcnpj-template.html\'\" ng-if=\"collumn.isInputCpfCnpjMask\"></ng-include><ng-include src=\"\'templates/select-template.html\'\" ng-if=\"collumn.isCombo\"></ng-include><ng-include src=\"\'templates/chosen-select2-template.html\'\" ng-if=\"collumn.isChosenSelect2\"></ng-include><ng-include src=\"\'templates/chosen-selectize-template.html\'\" ng-if=\"collumn.isChosenSelectize\"></ng-include><ng-include src=\"\'templates/multi-chosen-select2-template.html\'\" ng-if=\"collumn.isMultiChosen\"></ng-include><div class=\"actions pull-right\" ng-if=\"$last && buttons && buttons.length > 0\"><button tooltip=\"{{button.tooltip}}\" tooltip-append-to-body=\"true\" data-original-title=\"{{button.tooltip}}\" style=\"margin-left: 5px;\" tooltip-placement=\"top\" ng-if=\"isVisibleButton(button, row, $index)\" type=\"button\" ng-class=\"button.classButton\" ng-click=\"button.onClick(row)\" ng-repeat=\"button in buttons track by $index\"><span ng-class=\"button.classIcon\"></span> {{button.text}}</button></div></td></tr><tr ng-if=\"showEmptyRow\"><td class=\"text-center\" colspan=\"{{collumns.length}}\">{{config.messageEmpty}}</td></tr><tr><td ng-if=\"showInfoProgress\" colspan=\"{{collumns.length}}\">{{messageLoading || \'loading...\'}}</td></tr></tbody></table><div class=\"pagination_page\"><div id=\"loading\" class=\"uil-default-css\" ng-if=\"showProgress\" style=\"transform:scale(0.14);\"><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(0deg) translate(0,-50px);transform:rotate(0deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(30deg) translate(0,-50px);transform:rotate(30deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(60deg) translate(0,-50px);transform:rotate(60deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(90deg) translate(0,-50px);transform:rotate(90deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(120deg) translate(0,-50px);transform:rotate(120deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(150deg) translate(0,-50px);transform:rotate(150deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(180deg) translate(0,-50px);transform:rotate(180deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(210deg) translate(0,-50px);transform:rotate(210deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(240deg) translate(0,-50px);transform:rotate(240deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(270deg) translate(0,-50px);transform:rotate(270deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(300deg) translate(0,-50px);transform:rotate(300deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div><div style=\"top:-10px;left:90px;width:14px;height:40px;background:#959b9e;-webkit-transform:rotate(330deg) translate(0,-50px);transform:rotate(330deg) translate(0,-50px);border-radius:10px;position:absolute;\"></div></div><ul ng-if=\"hasPagination && collection.content.length > 0 && !showProgress\"><li class=\"prev\" ng-class=\"{\'disabled\': collection.first}\"><a ng-click=\"prevPage()\">← Anterior</a></li><li ng-class=\"{\'active\' : currentPage == page.index}\" ng-repeat=\"page in avaliablesPages\"><a ng-click=\"goToPage(page.index)\">{{page.label}}</a></li><li class=\"next\" ng-class=\"{\'disabled\': collection.last}\"><a ng-click=\"nextPage()\">Próxima →</a></li></ul></div></div>");
$templateCache.put("templates/checkbox-template.html","<input type=\"checkbox\" ng-click=\"clickCheckbox(row, $index, row[collumn.index])\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledCheckbox(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"checkbox_{{$index}}\"> <span>{{row.textCheckbox}}</span>");
$templateCache.put("templates/chosen-select2-template.html","<ui-select ng-model=\"row[collumn.index]\" ng-change=\"changeChosen(row, collumn, row[collumn.index])\" theme=\"select2\" class=\"{{collumn.action.class}}\" ng-style=\"collumn.action.style\" ng-disabled=\"isDisabledChosen(row, collumn)\" name=\"chosen_{{$index}}\" id=\"chosen_{{$index}}\"><ui-select-match allow-clear=\"{{collumn.action.allowClear}}\" placeholder=\"{{collumn.action.placeholder}}\"><div ng-bind-html=\"getItemSelected($select.selected, collumn)\"></div></ui-select-match><ui-select-choices repeat=\"item in getAvaliablesChoises(collumn.action.avaliablesChoises, collumn, $select.search)\"><div ng-bind-html=\"getItemRender(item,collumn)\"></div></ui-select-choices></ui-select>");
$templateCache.put("templates/chosen-selectize-template.html","<ui-select ng-model=\"row[collumn.index]\" ng-change=\"changeChosen(row, collumn, row[collumn.index])\" theme=\"selectize\" class=\"{{collumn.action.class}}\" ng-style=\"collumn.action.style\" ng-disabled=\"isDisabledChosen(row, collumn)\" name=\"chosen_{{$index}}\" id=\"chosen_{{$index}}\"><ui-select-match placeholder=\"{{collumn.action.placeholder}}\"><div ng-bind-html=\"getItemSelected($select.selected, collumn)\"></div></ui-select-match><ui-select-choices repeat=\"item in getAvaliablesChoises(collumn.action.avaliablesChoises, collumn, $select.search)\"><div ng-bind-html=\"getItemRender(item,collumn)\"></div></ui-select-choices></ui-select>");
$templateCache.put("templates/input-cep-template.html","<input type=\"text\" ui-br-cep-mask=\"\" maxlength=\"{{collumn.action.mask.maxlength}}\" ng-change=\"changeInput(row, collumn, row[collumn.index])\" ng-blur=\"blurInput(row, collumn)\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledInput(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"input_cep{{$index}}\" id=\"input_cep{{$index}}\">");
$templateCache.put("templates/input-cnpj-template.html","<input type=\"text\" ui-br-cnpj-mask=\"\" maxlength=\"{{collumn.action.mask.maxlength}}\" ng-change=\"changeInputCpfCnpj($event, row, collumn)\" ng-blur=\"blurInputCpfCnpj($event, row, collumn)\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledInput(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"input_cnpj{{$index}}\" id=\"input_cnpj{{$index}}\">");
$templateCache.put("templates/input-cpf-template.html","<input type=\"text\" ui-br-cpf-mask=\"\" maxlength=\"{{collumn.action.mask.maxlength}}\" ng-change=\"changeInputCpfCnpj($event, row, collumn)\" ng-blur=\"blurInputCpfCnpj($event, row, collumn)\" ng-model=\"row[collumn.index]\" ng-model-options=\"{allowInvalid:true}\" ng-disabled=\"isDisabledInput(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"input_cpf{{$index}}\" id=\"input_cpf{{$index}}\">");
$templateCache.put("templates/input-cpfcnpj-template.html","<input type=\"text\" ui-br-cpfcnpj-mask=\"\" maxlength=\"{{collumn.action.mask.maxlength}}\" ng-change=\"changeInputCpfCnpj($event, row, collumn, row[collumn.index])\" ng-blur=\"blurInputCpfCnpj($event, row, collumn, row[collumn.index])\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledInput(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"input_cpfcnpj{$index}\" id=\"input_cpfcnpj{$index}\">");
$templateCache.put("templates/input-money-template.html","<input type=\"text\" ui-money-mask=\"{{collumn.action.mask.decimalPlace}}\" maxlength=\"{{collumn.action.mask.maxlength}}\" ng-change=\"changeInput(row, collumn)\" ng-blur=\"blurInput(row, collumn)\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledInput(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"input_money{{$index}}\" id=\"input_money{{$index}}\">");
$templateCache.put("templates/input-number-negative-template.html","<input type=\"text\" ui-number-mask=\"{{collumn.action.mask.decimalPlace}}\" maxlength=\"{{collumn.action.mask.maxlength}}\" ng-change=\"changeInput(row, collumn)\" ng-blur=\"blurInput(row, collumn)\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledInput(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" ui-negative-number=\"\" name=\"input_negative{{$index}}\" id=\"input_negative{{$index}}\">");
$templateCache.put("templates/input-number-template.html","<input type=\"text\" ui-number-mask=\"{{collumn.action.mask.decimalPlace}}\" maxlength=\"{{collumn.action.mask.maxlength}}\" ng-change=\"changeInput(row, collumn)\" ng-blur=\"blurInput(row, collumn)\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledInput(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"input_number{$index}}\" id=\"input_number{{$index}}\">");
$templateCache.put("templates/input-phone-template.html","<input type=\"text\" ui-br-phone-number=\"\" maxlength=\"{{collumn.action.mask.maxlength}}\" ng-change=\"changeInput(row, collumn)\" ng-blur=\"blurInput(row, collumn)\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledInput(row, collumn)\" model-view-value=\"true\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"input_phone{{$index}}\" id=\"input_phone{{$index}}\">");
$templateCache.put("templates/input-template.html","<input type=\"text\" ng-change=\"changeInput(row, collumn)\" maxlength=\"{{collumn.action.maxlength}}\" ng-blur=\"blurInput(row, collumn)\" ng-model=\"row[collumn.index]\" ng-disabled=\"isDisabledInput(row, collumn)\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" name=\"input_{{$index}}\" id=\"input_{{$index}}\">");
$templateCache.put("templates/multi-chosen-select2-template.html","<ui-select ng-model=\"row[collumn.index]\" multiple=\"\" theme=\"select2\" class=\"{{collumn.action.class}}\" ng-style=\"collumn.action.style\" ng-disabled=\"isDisabledMultiChosen(row, collumn)\" name=\"chosen_{{$index}}\" on-remove=\"onRemove(row, collumn, $item, row[collumn.index])\" on-select=\"onSelect(row, collumn, $item, row[collumn.index])\" id=\"chosen_{{$index}}\"><ui-select-match placeholder=\"{{collumn.action.placeholder}}\"><div ng-bind-html=\"selectedsMultiChosen($item, collumn)\"></div></ui-select-match><ui-select-choices repeat=\"item in getAvaliablesChoises(collumn.action.avaliablesChoises, collumn, $select.search)\"><div ng-bind-html=\"getMultiItemRender(item,collumn)\"></div></ui-select-choices></ui-select>");
$templateCache.put("templates/select-template.html","<select ng-model=\"row[collumn.index]\" ng-change=\"changeCombo(row, collumn, row[collumn.index])\" name=\"combo_{{$index}}\" ng-class=\"collumn.action.class\" ng-style=\"collumn.action.style\" id=\"combo_{{$index}}\" ng-disabled=\"isDisabledCombo(row, collumn)\"><option ng-if=\"collumn.action.labelChoose\" value=\"\">{{collumn.action.labelChoose}}</option><option value=\"{{item}}\" ng-repeat=\"item in avaliablesChoises\">{{item}}</option></select>");}]);