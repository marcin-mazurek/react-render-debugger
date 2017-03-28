React Render Debugger
============
A visual way to see what is (re)rendering and why.

Decorator/higher-order function version ported from <https://github.com/redsunsoft/react-render-visualizer>

[Learn more about the experimental decorator syntax](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy#why-legacy).

Features
--------
- Shows when component is being mounted or updated by highlighting (red for mount, yellow for update)
- Shows render count for each component instance
- Shows individual render log for each component instance

Installation
------------

```sh
npm install react-render-debugger
```

Usage
-----
Import and apply to any React component you want to start monitoring:

```js
import React, { Component } from 'react';
import debugRender from 'react-render-debugger';

// Use with the decorator syntax (experimental)
@debugRender
export default class TodoItem extends Component {
    render () {
        // ...
    }
}

// Or simply passing the component to the function
class TodoItem extends Component {
    render () {
        // ...
    }
}

export default debugRender(TodoItem);
```
Component will show up with a blue border box when being monitored.


Demo
----
See a demo page: <http://react-render-visualizer-decorator.netlify.com/>

Similar libraries
-----------------

* [mobx-react-devtools](https://github.com/mobxjs/mobx-react-devtools)
