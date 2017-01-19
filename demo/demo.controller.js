app.controller('demoController', function($scope, $http) {

  $scope.config = {

    classTable: 'table table-bordered table-striped',
    messageLoading: 'Loading...',
    messageEmpty:   'No results',
    sort: true,
    defaultSort: 'id,asc',

    search: {
      label: 'Filtrar por: ',
    },

    popoverRow: {                                       // optional
      titleRender: function (row){                      // optional, callback(currentRow) for render title in popover
        return row.name+' '+row.lastName;
      },
      templateUrl: 'template-popover.html',             // required type: String "popover-template.html"
      ngModel: 'popover'                                // required type: String (that presents the model in popover template)
    },

    collumns: [{
        title: '',
        index: 'enable',
        class: 'text-center',
        sort: false,
        action: {
          type: 'checkbox',
          class: 'checkboxClass',
          checkInHeader: true,
          onCheckHeader: function(checked) {
            console.log('checked: ' + checked);
          },
          onCheck: function(obj, checked) {
            console.log('checked: ' + checked + ', obj:' + obj.id);
          }
        }
      }, {
        title: 'ID',
        index: 'id',
        class: 'text-center'
      }, {
        title: 'Render',
        index: 'name',
        render: function(row) {
          return row.id + " - " + row.name;
        }
      }, {
        title: 'No Sort',
        index: 'noSort',
        sort: false,
        render: function(row) {
          return row.id + " - " + row.name;
        }
      }, {
        title: 'Class',
        index: 'city',
        class: 'text-center',
        render: function(row) {
          return row.city.name;
        },
      }, {
        title: 'Href',
        index: 'github',
        render: function(row) {
          return 'open github'
        },
        action: {
          type: 'href',
          onClick: function(row) {
            window.open(row.github, '_blank');
          }
        }
      },
      // {
      //   title: 'Input',
      //   index: 'nickName',
      //   action: {
      //     type: 'input',
      //     class: 'input-rs',
      //     maxlength: 10,
      //     trigger: 'blur',
      //     onChange: function(row) {
      //       alert('blur action input and maxlength 10, newValue is:' + row.nickName);
      //     }
      //   }
      // }, 
      {
        title: 'CPF',
        index: 'cpf',
        action: {
          type: 'input',
          trigger: 'blur',
          class: 'input-rs',
          style: {
            width: '100px'
          },
          mask: {
            use: 'br-cpf',
          },
          onChange: function(row, isValid) {
            alert('blur action input and maxlength 10, newValue is:' + row.value);
          }
        }
      }, {
        title: 'Combo',
        index: 'status',
        action: {
          type: 'combo',
          class: '',
          avaliablesChoises: ["ATIVO", "INATIVO"],
          labelChoose: 'Selecione...',
          isDisabled: function(obj) {
            if (obj.id === 1) {
              return true;
            } else {
              return false;
            }
          },
          onChange: function(obj) {
            console.log('execute action here: ' + obj.status);
          }
        }

      }, {
        title: 'Chosen',
        index: 'tag',
        action: {
          type: 'chosen',
          placeholder: 'Selecione um tag...',
          theme: 'selectize',
          searchIn: ['id', 'nome'],
          allowClear: false, // [x] button clear - default is false
          selectedRender: function(item) { // optional
            return item.nome;
          },
          itemRender: function(item) {
            var ret = '<small>';
            ret += 'id:' + item.id + '<br/>';
            ret += 'nome: ' + item.nome + '<br/>';
            ret += '</small>';
            return ret; // is possible return html content
          },
          isDisabled: function(obj) {
            if (obj.id == 1) {
              return true;
            }
            return false;
          },
          avaliablesChoises: [{
            id: 1,
            nome: 'tag 1'
          }, {
            id: 2,
            nome: 'tag 2'
          }],
          onChange: function(obj, newValue) {
            console.log('execute action here: ' + newValue.id);
          }
        }
      }, 
      // {
      //   title: 'Multi-Chosen',
      //   index: 'nome',
      //   action: {
      //     type: 'multiChosen',
      //     placeholder: 'Selecione um tag...',
      //     theme: 'select2',
      //     searchIn: ['id', 'nome'],
      //     selectedsRender: function(item) {
      //       return item.nome;
      //     },
      //     itemRender: function(item) {
      //       return item.nome;
      //     },
      //     onRemove: function(item, model) {
      //       console.log(item);
      //     },
      //     isDisabled: function(obj) {
      //       if (obj.id == '66000000154363') {
      //         return true;
      //       }
      //       return false;
      //     },
      //     avaliablesChoises: [{
      //       id: 1,
      //       nome: 'tag 1'
      //     }, {
      //       id: 2,
      //       nome: 'tag 2'
      //     }, {
      //       id: 3,
      //       nome: 'tag 3'
      //     }, {
      //       id: 4,
      //       nome: 'tag 4'
      //     }, {
      //       id: 5,
      //       nome: 'tag 5'
      //     }, {
      //       id: 6,
      //       nome: 'tag 6'
      //     }],
      //     onSelect: function(item, model) {
      //       console.log('execute action here: ' + item.id);
      //     }
      //   }
      // }, 
      {
        title: 'Buttons',
        index: 'buttons',
        sort: false
      }
    ],
    data: function() {
      return [{
        id: 1,
        name: 'Lucas',
        lastName: 'Rodrigues',
        city: {
          id: 1,
          name: 'Ribeirão Preto'
        },
        nickName: 'lucrod1',
        github: 'https://github.com/lucrod1/',
        enable: true,
        phone: '1636101626',
        value: '10.20',
        status: "ATIVO",
        cpf: '42143027290'
      }, {
        id: 2,
        name: 'John',
        lastName: 'Carter',
        city: {
          id: 2,
          name: 'California'
        },
        nickName: 'john',
        github: 'https://github.com',
        enable: false,
        value: '100',
        status: "INATIVO"
      }, {
        id: 3,
        name: 'Erick',
        lastName: 'Phill',
        city: {
          id: 1,
          name: 'Ribeirão Preto'
        },
        nickName: 'erick',
        github: 'https://github.com/',
        enable: true,
        value: '1.1',
        status: null
      }, {
        id: 4,
        name: 'Marcos',
        lastName: 'Elliot',
        city: {
          id: 2,
          name: 'São Paulo'
        },
        nickName: 'marcus',
        github: 'https://github.com/',
        enable: true,
        value: '132.11',
        status: null
      }]
    },
    buttons: [{
      text: 'Excluir',
      classButton: 'btn btn-xs btn-primary',
      onClick: function(obj) {
        console.log('Execute action here obj clicked:' + obj.id);
      }
    }, {
      tooltip: 'Tooltip',
      classIcon: 'glyphicon glyphicon-remove',
      classButton: 'btn btn-xs btn-danger',
      isVisible: function(obj) {
        if (obj.id == 2) {
          return false;
        } else {
          return true;
        }
      },
      onClick: function(obj) {
        console.log('Execute action here obj clicked:' + obj.id);
      }
    }]
  }
});
