app.controller('demoController', function($scope, $http) {

  $scope.config = {

    classTable: 'table table-bordered table-striped',
    messageLoading: 'Loading...',
    sort: true,
    defaultSort: 'id,asc',

    search: {
      label: 'Filtrar por: ',
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
      index: 'city.name',
      class: 'text-center',
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
    }, {
      title: 'Input',
      index: 'nickName',
      action: {
        type: 'input',
        class: 'input-rs',
        maxlength: 10,
        trigger: 'blur',
        onChange: function(row) {
          alert('blur action input and maxlength 10, newValue is:' + row.nickName);
        }
      }
    }, {
      title: 'Input with mask',
      index: 'phone',
      action: {
        type: 'input',
        class: 'input-rs',
        maxlength: 10,
        trigger: 'blur',
        mask: {
          use: 'br-phone',
          // decimalPlace: 2,
          // maxlength: 11,
          // negative: true
        },
        onChange: function(row) {
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
          if (obj.id === 66000000143365) {
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
      title: 'Buttons',
      index: 'buttons',
      sort: false
    }],
    data: function() {
      return [{
        id: 1,
        name: 'Lucas Rodrigues',
        city: {
          id: 1,
          name: 'Ribeirão Preto'
        },
        nickName: 'lucrod1',
        github: 'https://github.com/lucrod1/',
        enable: true,
        phone: '1636101626',
        value: '10.20',
        status: "ATIVO"
      }, {
        id: 2,
        name: 'John',
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

  $scope.collection1 = {
    "content": [{
      "id": 1,
      "firstName": "Lucas",
      "lastName": "Rodrigues",
      "username": "lucrod1",
      "address": {
        "country": "BR",
        "state": "SP",
        "city": "Ribeirão Preto"
      }
    }, {
      "id": 2,
      "firstName": "John",
      "lastName": "lucker",
      "username": "john1",
      "address": {
        "country": "US",
        "state": "AZ",
        "city": "Arizona"
      }
    }],
    "totalElements": 2,
    "last": true,
    "totalPages": 1,
    "sort": [{
      "direction": "ASC",
      "property": "id",
      "ignoreCase": true,
      "nullHandling": "NULLS_LAST",
      "ascending": true
    }],
    "first": true,
    "numberOfElements": 2,
    "size": 10,
    "number": 0
  };
});
