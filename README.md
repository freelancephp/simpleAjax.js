[simpleAjax](http://www.freelancephp.net/simpleajax-small-ajax-javascript-object/) - JavaScript Object
======================================================================================================

simpleAjax is a very small Ajax Javascript object (<3kb) with cross-browser support.

- [How To Use?](#how-to-use)
    - [Ajax call](#ajax-call)
    - [Short Calls](#short-calls)
        - [POST](#post)
        - [GET](#get)
    - [Load Content into DOM](#load-content-into-dom)
- [Public API](#public-api)
- [Browser Support](#browser-support)
- [License](#license)


How To Use?
-----------

### Ajax call ###
```
simpleAjax({
    url: 'ajax.html',
    type: 'GET',
    success: function (data) {
        alert(data);
    }
});
```

### Short Calls ###

There are 2 short ajax calls for GET and POST.

#### GET ####

```
simpleAjax.get('ajax.html', function (data) {
    alert(data);
});
```

#### POST ####

```
simpleAjax.post('ajax.html', {val: 'test'}, function (data) {
    alert(data);
});
```

### Load Content into DOM ###

With the `simpleAjax.load()` function you can directly load the response into a DOM element.

```
simpleAjax.load('contentContainer', 'ajax.html');
```


Public API
---------

* `simpleAjax( options )`
* `simpleAjax.get( url, [data], [success] )`
* `simpleAjax.post( url, [data], [success] )`
* `simpleAjax.load( el, url, [data], [complete] )`
* `simpleAjax.parseJSON( data )`
* `simpleAjax.setHtmlContent( el, html )`


Browser Support
---------------

Tested on IE7+, FF, Opera, Chrome and Safari (for Windows).


License
-------

Released under MIT license.
