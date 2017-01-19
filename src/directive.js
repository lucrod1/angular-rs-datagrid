'use strict';

angular.module('angular.datagrid', ['ui.utils.masks', 'ui.select'])
  .directive('datagrid', function($locale, $filter) {
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
            if (count === scope.collection.content.length) {
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
            row._internal[collumn.index] = collumn.render(row);
          } else if (collumn.action && collumn.action.type === 'input' && collumn.action.mask) {
            row._internal[collumn.index] = undefined;
            switch (collumn.action.mask.use) {
              case 'number':
                if(row[collumn.index]){
                  row._internal[collumn.index] = row[collumn.index].toString().replace('.', $locale.NUMBER_FORMATS.DECIMAL_SEP);
                }
                break;
              case 'money':
                if(row[collumn.index]){
                  row._internal[collumn.index] = $locale.NUMBER_FORMATS.CURRENCY_SYM + ' ' + row[collumn.index].toString().replace('.', $locale.NUMBER_FORMATS.DECIMAL_SEP);
                }
                break;
              default:
                row._internal[collumn.index] = row[collumn.index];
                break;
            }
          } else {
            row._internal[collumn.index] = row[collumn.index];
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // REFRESH TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////
        function refresh(page) {
          if (scope.hasPagination) {
            scope.showProgress = true;
            scope.config.lazyData(page, scope.pagination.defaultSize, getCurrentSort(), scope.filter.search).then(function(result) {
              scope.showProgress = false;
              scope.currentPage = page;
              scope.collection = result;
            });
          }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // VARIABLES AND METHODS FOR SEARCH IN TABLE
        ///////////////////////////////////////////////////////////////////////////////////////////////
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
            scope.config.lazyData(scope.currentPage, scope.pagination.defaultSize, getCurrentSort()).then(function(dados) {
              scope.showInfoProgress = false;
              scope.collection = dados;
            });
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

        scope.getCollection = function() {
          if (scope.collection) {
            if (scope.hasPagination) {
              return scope.collection.content;
            } else {
              var keys = [];
              if (scope.collection.content[0]._internal) {
                keys = Object.keys(scope.collection.content[0]._internal);
              }
              return $filter('angularDatagridPropsFilter')(scope.collection.content, keys, scope.filter.search, true);
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

          if (angular.isFunction(collumn.action.onCheck)) {
            collumn.action.onCheck(row, checked);
          }
        };

        scope.clickCheckboxHeader = function(collumn, checked) {
          angular.forEach(scope.collection.content, function(row) {
            row[collumn.index] = checked;
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
          return $filter('angularDatagridPropsFilter')(array, getKeysForSearch(collumn), search, false);
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
            scope[scope.config.popoverRow.ngModel] = row;
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
  });
