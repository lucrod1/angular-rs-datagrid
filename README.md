# Directive angular-rs-datagrid
#### Directive is under development, version beta

## Installation

With Bower:

```
bower install --save angular-rs-datagrid
```

With npm:

```
npm install --save angular-rs-datagrid
```
Datagrid component that supports several types of value editing. It is possible to set up columns of type, checkbox, href, html content, combobox, chosen, multi-chosen, popover, input fields with mask (string, number, money, br-phone, br-cpf, br- cnpj) and unmasked.

`In this version this only implemented pagination in the backend.`

This component works with two dependencies, angular-input-mask and angular-ui-select

## How to use
include module into app

```
rs.datagrid
```

### HTML template

```
<rs-datagrid config="config"></rs-datagrid>
```

### Defines property config in controller

```
$scope.config =
{
 "classTable": "table table-bordered table-striped",  // optional, default: "table table-bordered table-striped" --->
 "messageLoading": "Loading...",                      // optional, default: "loading..."
 "messageEmpty"  : "No results", 
 "sumLabel"  : "Total: ",                             // optional, default: "Total: "
 "sort": true,                                        // optional, default: false
 "defaultSort": "id,asc",                             // optional, default is first "collumn.index", asc
 "classRow": "disabled" || function(row){},           // optional, class on <tr> is possible used calback function(row)

 "collumns": [{                                       // required
  "title": "ID",                                      // title of collumn
  "index": "id",                                      // Property that will print in the column
  "class": "text-center" || function(row){},          // optional, class od <th> and <td> is Possible used calback function(row)
  "style": {                                          // optional
   "width": "60px"                                    // It is possible to define some properties in html
  }
 }],
 "data": function(){
   return [{
    "id": 1,
    "name": "Lucas Rodrigues"
   }];
}
```

## How use search
Defines a property search inside property config

```
$scope.config =
{
 ...
 "search": {
   "label": "Search: "         //optional
  }
  ...
}
```

## How configure columns show visibles
Defines a property search inside property config

```
$scope.config =
{
 ...
 "setupColumns": {
   "id": "name_of_table_with_cod_user_logged" //id tables with id user for persist in local storage
  }
  ...
}
```

## How to set a value in the search field
Use the auxiliary method "_setSearch" specifying the value

```
$scope.config._setSearch(yourValue)
```

## How listener click in row
Defines onClickRow callback function
```
$scope.config =
{
...
"collumns:"[],
"onClickRow": function(row){

}
...
}
```

## How listener click in cell
#### Atention: You can not use onClickCell along with onClickRow, choose which one is best for you.
Defines onClickCell callback function
```
$scope.config =
{
...
"collumns:"[],
"onClickCell": function(row, index){

}
...
}
```

## How override output collumn
Use the function render to override the output

```
$scope.config =
{
  ...
  "collumns": [{                          // required
    "title": "Render",                    // title of collumn
    "index": "name",                      // Property that will print in the column
    "render": function(row){              // callback for override the output
      return row.id+' - '+row.name;
    },
  }]
  ...
}
```
Is possible render html content, for this defines property isHtml

```
$scope.config =
{
  ...
  "collumns": [{                          // required
    "title": "Render",                    // title of collumn
    "index": "name",                      // Property that will print in the column
    "isHtml": true,
    "render": function(row){              // callback for override the output
      return "<b>"+row.id+' - '+row.name+"</b>";
    },
  }]
  ...
}
```

## How disable sort in collumn
Defines sort = false in collumn property

```
$scope.config =
{
  ...
  "collumns": [
  {
    "title": "No Sort",
    "index": "lastName",
    "sort": false
  }]
  ...
}
```

## How Stylize collumn
Defines class in collumn

```
$scope.config =
{
  ...
  "collumns": [
  {
    "title": "Class",
    "index": "city",
    "class": "text-center"
  }]
  ...
}
```

## How render checkbox in collumn
Defines a property type = 'checkbox' in collumn.action.type

```
$scope.config =
{
  ...
  "collumns": [
  {
    "title": "",                                      // title of collumn
    "index": "enable",                                // Property that will print in the column
    "class": "text-center",                           // optional, class od <th> and <td>
    "sort": false,                                    // optional default: true
    "action": {
      "type": "checkbox",                             //required
      "checkInHeader": true,                          // Boolean, for render checkbox in header <th>
      isDisabled: function(row){                      // callback
        if (expression){
          return true;
        }else{
          return false;
        }
      },
      "onCheckHeader": function(checked) {            // callback when clicked in checkHeader
        console.log('checked: ' + checked);
      },
      "onCheck": function(obj, checked) {             // callback when clicked in check row table
        console.log('checked: ' + checked + ', obj:' + obj.id);
      }
  }],
  ...
}
```

## How render href in collumn
Defines a property type = 'href' in collumn.action.type

```
$scope.config =
{
  ...
  "collumns": [{
    "title": "Href",
    "index": "github",
    "render": function(obj) { // in action href, this property is required, callback(currentRow) override collumn, for label the href
      return "open github";
    },
    "action": {
      "type": "href",
      "onClick: function(obj) {                        // callback(currentRow) when click in href
        window.open(row.github, "_blank");
      }
    }
 }],
 ...
}
```

## How render input in collumn
Defines a property type = 'input' in collumn.action.type

```
$scope.config =
{
  ...
  "collumns": [{
    "title": "Input",
    "index": "nickName",
    "action": {
      "type": "input",
      "class": "input-rs",                // optional
      "style": {                          // optional
       "width": "100px"
      },
      "maxlength": 10,                    // optional
      "trigger": "blur",                  // required, default: 'blur', avaliables Triggers  'blur', 'change'
      "isDisabled": function(obj) {       // callback
        if (obj.id === 1) {
          return true;
        } else {
          return false;
        }
      },
      "onChange": function(row) {         // callback when exec trigger
       console.log('Row actual: '+row);
      }
    }
  }],
 ...
}
```

## How render input with mask 'Number' in collumn
Defines a property type = 'input' and mask in collumn.action

```
$scope.config =
{
  ...
  "collumns": [{
    "title": "Input",
    "index": "nickName",
    "action": {
      "type": "input",
      "trigger": "blur",                  // required, default: 'blur', avaliables Triggers  'blur', 'change'
      "mask": {
        "use": "number",                  // avaliables uses: 'number', 'money', 'br-phone','br-cep','br-cpf','br-cpfcnpj'
        "decimalPlace": 2,                // number of decimals
        "maxlength": 11,
        "negative": true                  // optional, default false
      },
      "isDisabled": function(obj) {       // callback
        if (obj.id === 1) {
          return true;
        } else {
          return false;
        }
      },
      "onChange": function(row) {         // callback when exec trigger
       console.log("Row actual: "+row);
      }
    }
  }],
 ...
}
```

## Mask Money

```
$scope.config =
{
  ...
  mask: {
    use: 'money',
    decimalPlace: 2,          // number of decimals
    maxlength: 11
  },
  ...
}
```

## Mask br-phone

```
$scope.config =
{
  ...
  mask: {
    use: 'br-phone'
  },
  ...
}
```

## Mask br-cep

```
$scope.config =
{
  ...
  mask: {
    use: 'br-cep'
  },
  ...
}
```

## Mask br-cpf
Callback has two parameters, row and isValid, isValid is result validation cpf

```
$scope.config =
{
  ...
  mask: {
    use: 'br-cpf'
  },
  onChange: function(row, isValid) {      //callback
    if(isValid){
      console.log('execute action here');
    }else{
     console.log('CPF inválido');
    }
  }
  ...
}
```

## Mask br-cnpj
Callback has two parameters, row and isValid, isValid is result validation cnpj

```
$scope.config =
{
  ...
  mask: {
    use: 'br-cnpj'
  },
  onChange: function(row, isValid) {      //callback
    if(isValid){
      console.log('execute action here');
    }else{
     console.log('CNPJ inválido');
    }
  }
  ...
}
```

## Mask br-cpfcnpj
Callback has two parameters, row and isValid, isValid is result validation

```
$scope.config =
{
  ...
  mask: {
    use: 'br-cpfcnpj'
  },
  onChange: function(row, isValid) {      //callback
    if(isValid){
      console.log('execute action here');
    }else{
     console.log('Campo inválido');
    }
  }
  ...
}
```

## How render comboBox in collumn
Defines a property type = 'combo' and mask in collumn.action

```
$scope.config =
{
  ...
  collumns: [{
    title: "Combo",
    index: 'status',
    action: {
      type: 'combo',
      class: '',                                     // optional
      style: {                                    // optional
       width: '100px'
      },
      avaliablesChoises: ["ACTIVE","INACTIVE"], // required, Collection for populate combo, not use array of object for this use "chosen
      labelChoose: 'Select...',                      // optional, if defined, create a empty option
      isDisabled: function(obj) {                    // optional, callback for disable the combo
        if (obj.id === 1) {
          return true;
        } else {
          return false;
        }
      },
      onChange: function(obj) {
        console.log('execute action here');
      }
    }
  }],
 ...
}
```

## How render chosen in collumn
Defines a property type = 'chosen' and mask in collumn.action

```
$scope.config =
{
  ...
  collumns: [{
    title: 'Chosen',
    index: 'tag',
    action: {
      type: 'chosen',
      placeholder: 'Selecione um tag...',
      class: '',                            // optional
      style: {                           // optional
       width: '100px'
      },
      theme: 'select2',
      searchIn: ['id','nome'],              // property the object for search
      allowClear: false,                    // [x] button clear - default is false
      selectedRender: function(item){       // optional
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
        if (obj.id == 1){
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
        console.log('execute action here: ' + obj.id);
      }
   }],
  ...
}
```

## How render multiChosen in collumn
Defines a property type = 'multiChosen' and mask in collumn.action

```
$scope.config =
{
  ...
  collumns: [{
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
      onRemove : function(row, item, model){
        console.log(item);
      },
      isDisabled: function(obj){
        if (obj.id == 1){
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
      onSelect: function(row, item, model) {
        console.log('execute action here: ' + item.id);
      }
  }],
  ...
}
```

## How render buttons
The buttons are always rendered in the last column<br/>
Defines a property buttons in config

```
$scope.config =
{
  ...
  collumns: [{...}],
  buttons: [
    {
      text: 'Excluir',                              //optional
      classButton: 'btn btn-xs btn-primary',        // class ex: <button class="btn btn-xs btn-primary"></button>
      onClick: function(obj) {                      // callback when clicked
        console.log('Execute action here obj clicked:' + obj.id);
      }
    },
    {
      text: function(row){                          //callback for condition text
        return row.action.name;
      }
      ...
    },
    {
      tooltip: function(row){                          //callback for condition text tooltip
        return row.action.name;
      }
      ...
    },
    {
      tooltip: 'Tooltip',                           //optional
      classIcon: 'glyphicon glyphicon-remove',      // class for icon in button
      classButton: 'btn btn-xs btn-danger',         // class ex: <button class="btn btn-xs btn-danger"></button>
      isVisible: function(obj) {                    // callback for handle when the button will be rendered according a boolean expression
        if (obj.id == 1) {
          return false;
        } else {
          return true;
        }
      },
      isDisabled: function(obj) {                    // callback for handle when the button will be disabled according a boolean expression
        if (obj.id == 1) {
          return false;
        } else {
          return true;
        }
      },
    }
  ]
  ...
}
```

## Render popover for Row
Defines a property popoverRow, trigger is hover in row

```
$scope.config =
{
  ...
  popoverRow: {                                       // optional
    titleRender: function (row){                      // optional, callback(currentRow) for render title in popover
      return row.name+' '+row.lastName;
    },
    templateUrl: 'template-popover.html',             // required type: String "popover-template.html"
    ngModel: 'popover',                               // required type: String (that presents the model in popover template)
    getModel: function(row){                          // Callback must return an object, this object will be sent to the popover template, if it is not defined a callback will be sent the object of row
      return row;
    }
  },
  ...
}
```

template-popover.html

```
<div>
  <p>Nick Name: `{{this.popover.nickName}}</p>
  <p>City: `{{this.popover.city.name}}`</p>
</div>
```

## How force refresh datagrid
Call broadcast

```
$scope.$broadcast("rsDatagrid:refresh");
```

## How use pagination in component
This version only implements pagination in backend<br/>
Defines property pagination in config

```
$scope.config =
{
  ...
  pagination: {                                       // optional
    labelSize: 'Registros por página: ',              // optional, default "Page size: ""
    defaultSize: 10,                                  // optional, default first item in avaliableSizes
    avaliableSizes: [10, 25, 50, 100, 500],           // optional, default [10,25,50,100]
    positionBottom: true                              // optional, default is true, position over top
  },
  ...
}
```

When using paging, you must implement a lazyData function within the configuration, this function is responsive to update or components automatically, page sorts and other

```
$scope.config =
{
  ...
  lazyData: function(page, size, sort, search) {
    var params = {
      page: page,
      size: size,
      sort: sort,
      search: search
      };
      return $http({
        url: "http://localhost:8080/acoes",
        method: 'GET',
        params: params,
      }).then(function(result) {
        return result.data;
      });
  },
  ...
};
```

<b>Then JSON RESPONSE for pagination in back-end, this example the implementation in spring data.</b>

```
{
  "content": [{
    ...
    ...
  }],
  "totalElements": 10,
  "last": false,
  "totalPages": 1,
  "first": true,
  "sort": [{
    "direction": "ASC",
    "property": "id"
  }],
  "numberOfElements": 10,
  "size": 10,
  "number": 0
}
```

## How to set the current page
Use the auxiliary method "_setCurrentPage" specifying the value

```
$scope.config._setCurrentPage(yourValue)
```

### License
MIT
