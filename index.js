'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

function visualizeRender (component) {
    component.prototype.UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS = 500;
    component.prototype.MAX_LOG_LENGTH = 20;
    component.prototype.STATE_CHANGES = {
        MOUNT: 'mount',
        UPDATE: 'update'
    };
    component.prototype.styling = {
        renderLog: {
            color: 'rgb(85, 85, 85)',
            fontFamily: '\'Helvetica Neue\', Arial, Helvetica, sans-serif',
            fontSize: '14px',
            lineHeight: '18px',
            background: 'linear-gradient(#fff, #ccc)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            textShadow: '0 1px 0 #fff',
            borderRadius: '7px',
            position: 'absolute',
            maxWidth: '70%',
            padding: '5px 10px',
            zIndex: '10000'
        },
        renderLogDetailNotes: {
            color: 'red',
            textAlign: 'center'
        },
        elementHighlightMonitor: {
            outline: '1px solid rgba(47, 150, 180, 1)'
        },
        elementHighlightMount: {
            outline: '3px solid rgba(197, 16, 12, 1)'
        },
        elementHighlightUpdate: {
            outline: '3px solid rgba(197, 203, 1, 1)'
        }
    };

    // back up lifecycle methods
    var _componentDidMount = component.prototype.componentDidMount;
    var _componentDidUpdate = component.prototype.componentDidUpdate;
    var _componentWillUnmount = component.prototype.componentWillUnmount;

    component.prototype.componentDidMount = function(){
        // Create empty state object if not defined
        if (!this.state) {
            this.state = {};
        }

        // Reset the logs
        this._resetRenderLog();

        // Record initial mount
        this.addToRenderLog(this.state, 'Initial Render');

        // Build the monitor node
        this._buildRenderLogNode();

        // Highlight the initial mount
        this._highlightChange(this.STATE_CHANGES.MOUNT);

        // Set the watch to update log position
        this._updateRenderLogPositionTimeout = setInterval(
            this._updateRenderLogPosition.bind(this), this.UPDATE_RENDER_LOG_POSITION_TIMEOUT_MS
        );

        // run original lifecycle method
        _componentDidMount.apply(this, arguments);
    };

    component.prototype.componentDidUpdate = function(prevProps, prevState){
        // Get the changes in state and props
        this._getReasonForReRender(prevProps, prevState);

        // Update the render log
        this._updateRenderLogNode();

        // Highlight the update
        this._highlightChange(this.STATE_CHANGES.UPDATE);

        // run original lifecycle method
        _componentDidUpdate.apply(this, arguments);
    };

    component.prototype.componentWillUnmount = function (){
        // Remove the monitor node
        this._removeRenderLogNode();

        // Clear the update position timeout
        clearInterval(this._updateRenderLogPositionTimeout);

        // run original lifecycle method
        _componentWillUnmount.apply(this, arguments);
    };

    /*
    * Reset the logs
    * @return void
    */
    component.prototype._resetRenderLog = function(){
        this.state.renderLog = [];
        this.state.renderCount = 1;
    };

    component.prototype._applyCSSStyling = function (node, styles) {
        Object.keys(styles).forEach(function(className) {
          node.style[className] = styles[className];
        });
    };

    /*
    * Build the renderLog node, add it to the body and assign it's position
    * based on the monitored component
    * @return void
    */
    component.prototype._buildRenderLogNode = function(){
        var renderLogContainer = document.createElement('div'),
            renderLogRenderCountNode = document.createElement("div"),
            renderLogDetailContainer = document.createElement("div"),
            renderLogNotesNode = document.createElement("div"),
            renderLogDetailNode = document.createElement("div");

        renderLogContainer.className = 'renderLog';

        // Apply styling
        this._applyCSSStyling(renderLogContainer, this.styling.renderLog)

        // Attach the click handler for toggling the detail log
        renderLogContainer.addEventListener('click', function(){

            // Show the detail Log
            if (renderLogRenderCountNode.style.display === 'none') {
                renderLogRenderCountNode.style.display = 'block';
                renderLogDetailContainer.style.display = 'none';
                renderLogContainer.style.zIndex = '10000';
            // Hide it
            } else {
                renderLogRenderCountNode.style.display = 'none';
                renderLogDetailContainer.style.display = 'block';
                renderLogContainer.style.zIndex = '10001';
            }
        });

        renderLogRenderCountNode.className = 'renderLogCounter';
        renderLogRenderCountNode.innerText = 1;

        renderLogDetailContainer.style.display = 'none';
        renderLogDetailNode.innerText = '';

        if (this.shouldComponentUpdate) {
            renderLogNotesNode.innerText = 'NOTE: This component uses a custom shouldComponentUpdate(), so the results above are purely informational';
        }

        this._applyCSSStyling(renderLogNotesNode, this.styling.renderLogDetailNotes);

        renderLogDetailContainer.appendChild(renderLogDetailNode);
        renderLogDetailContainer.appendChild(renderLogNotesNode);

        renderLogContainer.appendChild(renderLogRenderCountNode);
        renderLogContainer.appendChild(renderLogDetailContainer);

        this.renderLogContainer = renderLogContainer;
        this.renderLogDetail = renderLogDetailNode;
        this.renderLogNotes = renderLogNotesNode;
        this.renderLogRenderCount = renderLogRenderCountNode;

        // Append to the body
        document.getElementsByTagName('body')[0].appendChild(renderLogContainer);

        // Set initial position
        this._updateRenderLogPosition();

        //
        this._updateRenderLogNode();
    };

    /*
    * Update the render log position based on its parent position
    * @return void
    */
    component.prototype._updateRenderLogPosition = function(){
        var parentNode = ReactDOM.findDOMNode(this),
          parentNodeRect = parentNode && parentNode.getBoundingClientRect();

        if (this.renderLogContainer && parentNodeRect) {
            this.renderLogContainer.style.top = (window.pageYOffset + parentNodeRect.top) + 'px';
            this.renderLogContainer.style.left = (parentNodeRect.left) + 'px';
        }
    };

    /*
    * Update the render log count and details
    * @return void
    */
    component.prototype._updateRenderLogNode = function() {
        var logFragment = document.createDocumentFragment();

        if (this.renderLogRenderCount) {
            this.renderLogRenderCount.innerText = (this.state.renderCount - 1 );
        }

        if (this.renderLogDetail) {
            this.renderLogDetail.innerHTML = '';
            for (var i = 0; i < this.state.renderLog.length; i++){
                var item = document.createElement('div');
                item.innerText = this.state.renderLog[i];
                logFragment.appendChild(item);
            }

            this.renderLogDetail.appendChild(logFragment);
        }
        //this.state.renderCount++;
    };

    /*
    * Remove the render log node from the body
    * @return void
    */
    component.prototype._removeRenderLogNode = function() {
        if (this.renderLogContainer) {
            document.getElementsByTagName('body')[0].removeChild(this.renderLogContainer);
        }
    };

    /*
    * Add a detail message to the render log and update the count
    * @param object nextState - The most current state of the component
    * @param String message
    * @return void
    */
    component.prototype.addToRenderLog = function(state, message) {
        state.renderLog.unshift(state.renderCount + ') ' + message);
        state.renderCount++;

        // Trim the log
        state.renderLog.splice(this.MAX_LOG_LENGTH, 1);
    };


    /*
     * Get the changes made to props or state.  In the event this component has its own
     * shouldComponentUpdate, don't do
     * anything
     * @param object prevProps
     * @param object prevState
     * @return boolean
     */
    component.prototype._getReasonForReRender = function(prevProps, prevState) {
        var nextState = this.state,
            nextProps = this.props,
            key;

        for (key in nextState){
            if (nextState.hasOwnProperty(key) && nextState[key] !== prevState[key]){
                if (typeof nextState[key] === 'object') {
                    return this.addToRenderLog(this.state, 'this.state['+key+'] changed');
                } else {
                    return this.addToRenderLog(this.state,
                        'this.state['+key+'] changed: \'' + prevState[key] + '\' => \'' + nextState[key] + '\'');
                }

            }
        }

        for (key in nextProps) {
            if (nextProps.hasOwnProperty(key) && nextProps[key] !== prevProps[key]) {
                if (typeof nextProps[key] === 'object') {
                    return this.addToRenderLog(this.state, 'this.props['+key+'] changed');
                } else {
                    return this.addToRenderLog(this.state,
                        'this.props['+key+'] changed: \'' + prevProps[key] + '\' => \'' + nextProps[key] + '\'');
                }
            }
        }

        return this.addToRenderLog(this.state, 'unknown reason for update, possibly from forceUpdate()');
    };

    /*
     * Highlight any change by adding an animation style to the component DOM node
     * @param String change - The type of change being made to the node
     * @return void
     */
    component.prototype._highlightChange = function(change) {
        var parentNode = ReactDOM.findDOMNode(this),
            ANIMATION_DURATION = 500;

        if (parentNode) {
            parentNode.style.boxSizing = 'border-box';

            window.requestAnimationFrame(function () {
                // Immediately show the border
                parentNode.style.transition = 'outline 0s';
                if (change === this.STATE_CHANGES.MOUNT) {
                    parentNode.style.outline = this.styling.elementHighlightMount.outline;
                } else {
                    parentNode.style.outline = this.styling.elementHighlightUpdate.outline;
                }

                // Animate the border back to monitored color
                window.requestAnimationFrame(function () {
                    parentNode.style.outline = this.styling.elementHighlightMonitor.outline;
                    parentNode.style.transition = 'outline '+ANIMATION_DURATION+'ms linear';
                }.bind(this));
            }.bind(this));
        }
    };

    component.renderLogContainer = null;
    component.renderLogDetail = null;
    component.renderLogRenderCount = null;
    component._updateRenderLogPositionTimeout = null;
}

module.exports = visualizeRender;
