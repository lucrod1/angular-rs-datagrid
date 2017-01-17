# Directive angular-rs-datagrid Directive is under development, version alpha

## Installation

With Bower:

```
bower install --save angular-rs-datagrid
```

With npm:

```
npm install --save angular-rs-datagrid
```
Datagrid component that supports several types of value editing. It is possible to set up columns of type, checkbox, href, html content, combobox, chosen, multi-chosen, input fields with mask (string, number, money, br-phone, br-cpf, br- cnpj) and unmasked.

`In this version this only implemented pagination in the backend.`

This component works with two dependencies, angular-input-mask and angular-ui-select

## How to use
### HTML template
```
<rs-datagrid config="config"></rs-datagrid>
```
### property config in controller
```
$scope.config = {
  classTable: 'table table-bordered table-striped',     // optional, default: "table table-bordered table-striped"
  messageLoading: 'Loading...',                         // optional, default: "loading..."
  sort: true,                                           // optional, default: false
  defaultSort: 'id,asc',                                // optional, default is first "collumn.index", asc
  
  collumns: [{                                          // required
    title: 'ID',                                        // title of collumn                           
    index: 'id',                                        // Property that will print in the column
    class: 'text-center',                               // optional, class od <th> and <td>
  }],
  data: function(){
    return [{
      id: 1,
      name: 'Lucas Rodrigues'
    }]
  }
};
```
## How use search
Defines a property search in config

```
$scope.config = {
  ...
  search: {
    label: 'Search: ',         //optional 
  },
  ...
};
```

## How override output collumn
Use the function render to override the output
```
$scope.config = {
  ...
  collumns: [{                          // required
    title: 'Render',                    // title of collumn                           
    index: 'name',                      // Property that will print in the column
    render: function(row){              // callback for override the output
      return row.id+' - '+row.name;
    },
  }]
  ...
};
```
## How disable sort in collumn
defines sort = false in collumn property
```
$scope.config = {
  ...
  collumns: [
  {
    title: 'No Sort',
    index: 'lastName',
    sort: false
  }]
  ...
};
```
## How Stylize collumn
defines class in collumn
```
$scope.config = {
  ...
  collumns: [
  {
    title: 'Class',
    index: 'city',
    class: 'text-center'
  }]
  ...
};
```

## How render checkbox in collumn
Defines a property action in config.collumn type = checkbox
```
$scope.config = {
  ...
  collumns: [
  {
    title: '',                                      // title of collumn                           
    index: 'enable',                                // Property that will print in the column
    class: 'text-center',                           // optional, class od <th> and <td>
    sort: false,                                    // optional default: true
    action: {
      type: 'checkbox',                             //required
      checkInHeader: true,                          // Boolean, for render checkbox in header <th>
      onCheckHeader: function(checked) {            // callback when clicked in checkHeader
        console.log('checked: ' + checked);
      },
      onCheck: function(obj, checked) {             // callback when clicked in check row table
        console.log('checked: ' + checked + ', obj:' + obj.id);
      }
  }],
  ...
};
```

## How render buttons
The buttons are always rendered in the last column
Defines a property buttons in config
```
$scope.config = {
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
      tooltip: 'Tooltip',                           //optional 
      classIcon: 'glyphicon glyphicon-remove',      // class for icon in button
      classButton: 'btn btn-xs btn-danger',         // class ex: <button class="btn btn-xs btn-danger"></button>
      isVisible: function(obj) {                    // callback for handle when the button will be rendered according a expression boolean
        if (obj.id == 1) {                        
          return false;
        } else {
          return true;
        }
      },
    }
  ]
  ...
};
```
## How render href in collumn
Defines a property action in config.collumn type = href
```
$scope.config = {
  ...
  collumns: [{
    title: "ID",
    index: 'id',
    render: function(obj) { // in action href, this property is required, callback(currentRow) override collumn[index], for label the href
      return obj.id;
    },
    action: {
      type: 'href',
      onClick: function(obj) {                        // callback(currentRow) when click in href
        console.log('click link' + obj.id);
      }
    }
  }],
 ...
};
```

## How render combo box in collumn
Defines a property action in config.collumn type = combo
```
$scope.config = {
  ...
  collumns: [{
    title: "ID",
    index: 'id',
    render: function(obj) { // in action href, this property is required, callback(currentRow) override collumn[index], for label the href
      return obj.id;
    },
    action: {
      type: 'href',
      onClick: function(obj) {                        // callback(currentRow) when click in href
        console.log('click link' + obj.id);
      }
    }
  }],
 ...
};
```
### License
MIT
