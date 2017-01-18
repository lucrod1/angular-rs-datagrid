$scope.config = {
    
    classTable: 'table table-bordered table-striped',   // optional, default: "table table-bordered table-striped"
    messageLoading: 'Loading...',                       // optional, default: "loading..."
    sort: true,                                         // optional, default: false
    defaultSort: 'id,asc',                              // optional, default is first "collumn.index", asc
    
    pagination: {                                       // optional
      labelSize: 'Registros por página: ',              // optional, default "Page size: ""
      defaultSize: 10,                                  // optional, default first item in avaliableSizes
      avaliableSizes: [10, 25, 50, 100, 500]            // optional, default [10,25,50,100]
    },
    
    search: {                                           // optional
      label: 'Filtrar por: ',                           // optional, default ''
    },
    
    popoverRow: {                                       // optional
      titleRender: function (row){                      // optional, callback(currentRow) for render title in popover
        return row.unidade.nome;
      },
      templateUrl: 'template-popover.html',             // required type: String "popover-template.html"
      ngModel: 'popover'                                // required type: String (that presents the model in popover template)
    },

    collumns: [{                                        // required
      index: 'destaque',                                // Required, this property represents which key will be printed on the column according to the row
      sort: false,                                      // optional, default: true
      class: 'text-center',                             // optional type: String this class will be included in <td>
      
      render: function(row){                            // optional, callback(currentRow) for print value in collumn, override collumn.index
        return row.destaque;
      },
      
      action: {
        type: 'checkbox',
        class: 'test',
        checkInHeader: true,
        onCheckHeader: function(checked) {
          console.log('checked: ' + checked);
        },
        onCheck: function(obj, checked) {
          console.log('checked: ' + checked + ', obj:' + obj.id);
        }
      }
    }, {
      title: "ID",
      index: 'id',
      sort: false,
      render: function(obj) {                           // in action href, this property is required, callback(currentRow) override collumn[index], for label the href
        return obj.id;
      },
      action: {                                         //print href in collumn
        type: 'href',
        onClick: function(obj) {                        // callback(currentRow) when click in href
          console.log('click link' + obj.id);
        }
      }
    }, {
      title: "Unidade",
      index: 'unidade.nome',                            // print row.unidade.nome in collumn
      sortCollumn: 'id'                                 // specifique key, for use in sort
    }, {
      title: "Categoria",
      index: 'categoria.nome',
      isHtml: true,                                     // optional, default: false
      render: function(obj) {
        return '<b>' + obj.categoria.nome + '</b>';
      }
    }, {
      title: "data",
      index: 'data.de',
      class: 'text-center',
      action: {
        type: 'combo',
        class: '',
        avaliablesChoises: [{
          "de": "22/01/2016 15:00",
          "ate": "15/12/2016 17:00",
          "dataExibicao": null
        }, {
          "de": "03/11/2015 14:00",
          "ate": "29/12/2016 19:00",
          "dataExibicao": null
        }],
        labelRender: function(choise) {
          return choise.de;
        },
        valueRender: function(choise) {
          return choise.de;
        },
        isDisabled: function(obj) {
          if (obj.id === 66000000143365) {
            return true;
          } else {
            return false;
          }
        },
        onChange: function(obj, newValue) {
          console.log('execute action here: ' + newValue);
        }
      }
    }, {
      title: 'Chosen',
      index: 'tag',
      action: {
        type: 'chosen',
        placeholder: 'Selecione um tag...',
        theme: 'selectize',
        searchIn: ['id','nome'],
        allowClear: false,              // [x] button clear - default is false
        selectedRender: function(item){ // optional
          return item.nome;
        },
        itemRender: function(item){
          var ret =  '<small>';
          ret     += 'id:'+item.id+'<br/>';
          ret     += 'nome: '+item.nome+'<br/>';
          ret     += '</small>';
          return ret;                   // is possible return html content
        },
        isDisabled: function(obj){
          if (obj.id == '66000000154363'){
            return true;
          }
          return false;
        },
        avaliablesChoises: [{
          id: 1,
          nome: 'tag 1'
        },{
          id: 2,
          nome: 'tag 2'
        }],
        onChange: function(obj, newValue) {
          console.log('execute action here: ' + newValue.id);
        }
      }
    },{
      title: 'Multi-Chosen',
      index: 'nome',
      action: {
        type: 'multiChosen',
        placeholder: 'Selecione um tag...',
        theme: 'select2',
        searchIn: ['id','nome'],
        selectedsRender: function(item){
          return item.nome;
        },
        itemRender: function(item){
          return item.nome;
        },
        onRemove : function(item, model){
          console.log(item);
        },
        isDisabled: function(obj){
          if (obj.id == '66000000154363'){
            return true;
          }
          return false;
        },
        avaliablesChoises: [{
          id: 1,
          nome: 'tag 1'
        },{
          id: 2,
          nome: 'tag 2'
        },{
          id: 3,
          nome: 'tag 3'
        },{
          id: 4,
          nome: 'tag 4'
        },{
          id: 5,
          nome: 'tag 5'
        },{
          id: 6,
          nome: 'tag 6'
        }],
        onSelect: function(item, model) {
          console.log('execute action here: ' + item.id);
        }
      }
    }, {
      title: "acao",
      index: 'acao.nome',
      action: {
        type: 'input',
        class: 'input-rs',
        maxlength: 20,
        trigger: 'blur', // default: 'blur', avaliables Triggers  'blur', 'change'
        // Internationalized: Used the decimal separator and the thousands separator defined in the client browser configuration
        // ex: bower install angular-locale-pt-br.js and add into index.html
        // mask: {                     // optional
        //   use: 'number',            // avaliables uses: 'number', 'money', 'br-phone','br-cep','br-cpf','br-cpfcnpj', 'time', '' , directive assist https://github.com/assisrafael/angular-input-masks
        //   decimalPlace: 3,          // number of decimals 
        //   maxlength: 11,
        //   negative: true            // default false, optional
        // },
        // mask: {                     // optional
        //   use: 'money',             // avaliables uses: 'number', 'money', 'br-phone','br-cep','br-cpf','br-cpfcnpj', '' , directive assist https://github.com/assisrafael/angular-input-masks
        //   decimalPlace: 2,          // number of decimals 
        //   maxlength: 11
        // },
        // mask: {                     // optional
        //   use: 'br-phone'
        // },
        // mask: {                     // optional
        //   use: 'br-cep'
        // },
        // mask: {                     // optional
        //   use: 'br-cpf'
        // },
        // mask: {                     // optional
        //   use: 'br-cnpj'
        // },
        // mask: { // optional
        //   use: 'br-cpfcnpj'
        // },
        isDisabled: function(obj) {
          if (obj.id === 66000000143365) {
            return true;
          } else {
            return false;
          }
        },
        onChange: function(obj, newValue, valid) {
          if (valid) {
          console.log('execute action here value blur: ' + newValue);
          } else {
          console.log('Campo invalido');
          obj.valueInput = ''; //clean value
          }
        }
      }
    }],
    data: function(){
      return [{
        id: 1,
        name: 'Lucas Rodrigues',
        city: {
          id: 1,
          name: 'Ribeirão Preto'
        }
      }]
    },
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
        return result.data;
      });
    },
    buttons: [{
      text: 'Excluir ',
      tooltip: 'Excluir',
      classIcon: 'glyphicon glyphicon-remove',
      classButton: 'btn btn-xs btn-primary',
      // isVisible: function(obj) {
      //   if (obj.id === 66000000073961) {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // },
      onClick: function(obj) {
        console.log('Execute action here obj clicked:' + obj.id);
      }
    }]
  }