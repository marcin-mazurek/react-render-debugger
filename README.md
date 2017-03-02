React Render Visualizer Decorator
============
A visual way to see what is (re)rendering and why.

ES7 decorator version ported from <https://github.com/redsunsoft/react-render-visualizer>

Features
--------
- Shows when component is being mounted or updated by highlighting (red for mount, yellow for update)
- Shows render count for each component instance
- Shows individual render log for each component instance

Installation
------------

```sh
npm install react-render-visualizer-decorator
```

Usage
-----
Import and apply to any React component you want to start monitoring:

```js
import React, { Component } from 'react';
import visualizeRender from 'react-render-visualizer-decorator';

// Use with decorator syntax (legacy)
// Learn more: https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy#why-legacy
@visualizeRender
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

export default visualizeRender(TodoItem);
```
Component will show up with a blue border box when being monitored.


Demo
----
See a demo page: <http://react-render-visualizer-decorator.netlify.com/>

Similar libraries
-----------------

* [mobx-react-devtools](https://github.com/mobxjs/mobx-react-devtools)
