# idbf

A n-th indexed DBF reader (0-indexed)

[![Build Status](https://travis-ci.org/Lemaf/idbf.svg?branch=master)](https://travis-ci.org/Lemaf/idbf)
[![Dependency Status](https://david-dm.org/Lemaf/idbf.png)](https://david-dm.org/Lemaf/idbf)
[![devDependency Status](https://david-dm.org/Lemaf/idbf/dev-status.png)](https://david-dm.org/Lemaf/idbf#info=devDependencies)

```js
var Dbf = require("idbf").Dbf;
var dbf = new Dbf("questions.dbf");

dbf.get(42, function(err, record) {

    if (err)
        console.log("Houston! We have a problem!");
    else
        console.log("The universal question is mine!\n%j", record);

});
```

## Supported datatypes


DBF DataType | Observations
------------ |-------------------------
C            | Support only ISO-8859-1
N            | Numeric like text

## [References](https://github.com/Lemaf/idbf/wiki)

* [DBF](https://github.com/Lemaf/idbf/wiki/Dbf-Reference)
