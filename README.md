# dbf.js

A n-th indexed DBF reader


```js

var Dbf = require("dbf.js").Dbf;
var dbf = new Dbf("questions.dbf");

dbf.get(42, function(err, record) {
    
    if (err)
        console.log("Houston! We have a problem!");
    else
        console.log("The universal question is mine!\n%j", record);

});

```


This work is incomplete, I need support more data types!


At moment these are supported datatypes:


DBF DataType | Observations
-------------|-------------------------
C            | Support only ISO-8859-1
N            | Numeric like text 