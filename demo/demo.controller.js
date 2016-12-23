app.controller('demoController', function($scope, $http) {

  $scope.config = {
    classTable: 'table table-bordered table-striped',
    messageLoading: 'Loading...',
    sort: true,
    defaultSort: 'id,asc',
    pagination: {
      labelSize: 'Registros por página: ',
      defaultSize: 10,
      avaliableSizes: [10, 25, 50, 100, 500]
    },
    search: {
      label: 'Filtrar por: ',
    },
    collumns: [{
      index: 'destaque',
      sort: false,
      class:'text-center',
      // render: function(obj){
      //   return obj.destaque;
      // },
      action:{
        type: 'checkbox',
        checkInHeader: true,
        callbackHeader: function (checked){
          console.log('checked: '+checked);
        },
        callback: function(obj, checked){
          console.log('checked: '+checked+', obj:'+obj.id);
        }
      }
    },
    {
      title: "ID",
      index: 'id',
      sort: false,
      render: function(obj) {
        return obj.id;
      },
      action: {
        type: 'href',
        callback: function(obj) {
          console.log('click link' + obj.id);
        }
      }
    }, {
      title: "Unidade",
      index: 'unidade.nome',
      sortCollumn: 'id'
    }, {
      title: "Categoria",
      index: 'categoria.nome',
      render: function(obj) {
        return '<b>' + obj.categoria.nome + '</b>';
      }
    }, {
      title: "data",
      index: 'data.dataExibicao',
      class: 'text-center'
    }, {
      title: "acao",
      index: 'acao',
      action: {
        type: 'input',
        class: 'input-rs',
        trigger: 'blur',            // default: 'blur', avaliables Triggers  'blur', 'change'
        mask: {                     // optional
          use: 'number',            // avaliables uses: 'number', 'percentage', 'money', 'br-phone','br-cep','br-cpf','br-cpfcnpj', 'time', '' , directive assist https://github.com/assisrafael/angular-input-masks
          decimalPlace: 3,
          maxlength: 11
        },
        isDisabled: function(obj){
          if(obj.id === 66000000143365){
            return true;
          }else{
            return false;
          }
        },
        callback: function(obj, newValue){
          console.log('execute action here value blur: '+newValue);
        }
      }
    }],
    lazyData: function(page, size, sort, search) {
      var params = {
        de: '01/12/2016',
        ate: '31/12/2016',
        page: page,
        size: size,
        sort: sort,
        search: search
      }
      return $http({
        url: "http://localhost:8080/acoes",
        method: 'GET',
        params: params,
      }).then(function(result) {
        $scope.collection = result.data;
      });
    },
    buttons: [{
      text: 'Editar',
      tooltip: 'Excluir',
      classIcon: 'glyphicon glyphicon-remove',
      classButton: 'btn btn-xs btn-secondary',
      isVisible: function(obj) {
        if (obj.id === 66000000073961) {
          return true;
        } else {
          return false;
        }
      },
      callbackButton: function(obj) {
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
