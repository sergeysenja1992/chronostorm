import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-card/paper-card.js'
import '@polymer/iron-icon/iron-icon.js';
import {GestureEventListeners} from "@polymer/polymer/lib/mixins/gesture-event-listeners";
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from "@polymer/polymer/lib/utils/debounce";

class ChMap extends GestureEventListeners(PolymerElement){

    static get template() {
        return html`
<style>
.wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
#mainContentWrapper {
    position: absolute;
    min-height: 100%;
    min-width: 100%;
    top: -50000px;
    left: -50000px;
    cursor: grab;
}

#mainContent {
    position: relative;
    height: 100000px;
    width: 100000px;
    cursor: grab;
}

#testElement {
    position: absolute;
    width: 200px;
    height: 200px;
    left: 50000px;
    top: 50000px;
    /*background-color: red;*/
    cursor: grab;
    background: unset;
}
.selected {
  background: unset
  width: 100px;
  height: 100px;
  position: absolute;
  top: 100px;
  left: 100px;
}

.resizers {
    padding: 3px;
}

.selected .resizers{
    width: 100%;
    height: 100%;
    border: 3px solid #787878;
    border-style: dashed;
    box-sizing: border-box;
    padding: 0px;
}

.selected .resizers .resizer{
  width: 10px;
  height: 10px;
  border-radius: 50%; /*magic to turn square into circle*/
  background: white;
  border: 1px solid #787878;
  position: absolute;
}

.selected .resizers .resizer.top-left {
  left: -5px;
  top: -5px;
  cursor: nwse-resize; /*resizer cursor*/
}
.selected .resizers .resizer.top-right {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.selected .resizers .resizer.bottom-left {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.selected .resizers .resizer.bottom-right {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}



.bg-image {

}

.bg-grid {
    background-color: #f5f5f5;
    background-image: 
        linear-gradient(#d8d8d8 2px, transparent 2px),
        linear-gradient(90deg, gainsboro 2px, transparent 2px),
        linear-gradient(rgba(220, 220, 220, 0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(220, 220, 220, 0.3) 1px, transparent 1px);
    background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
    background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
}
#debugInfo {
    position: fixed;
    right: 10px;
    bottom: 10px;
    display: inline-block;
    z-index: 999999999!important;
    background-color: #f5f5f5;
}
.reset-scale {
    cursor: pointer;
}
.map-icon {
    width: 100%;
    height: 100%;
}
.map-object-content {
    width: 100%;
    height: 100%;
}
.map-object {
    position: absolute;
}
.cursor {
    width: 32px;
    height: 32px;
    position: absolute;
}

</style>

<div id="wrapper" class="wrapper">
    <div id="mainContentWrapper">
        <div id="mainContent" class="bg-grid" on-track="handleMainContentTrack" on-down="handleTrackDown" on-up="handleTrackUp" on-dragover="allowdrop">
            <dom-repeat id="mapIcons" items="[[mapIconsList]]" initialCount="50">
                <template>
                    <div id="[[item.id]]" class="map-object" on-track="handleTrack" on-down="handleTrackDown" on-up="handleTrackUp"
                        style="left:[[item.position.left]]; top:[[item.position.top]]; width:[[item.size.width]]; height:[[item.size.height]];"
                    >
                        <div class='resizers'>
                        <div class='resizer top-left'></div>
                        <div class='resizer top-right'></div>
                        <div class='resizer bottom-left'></div>
                        <div class='resizer bottom-right'></div>
                    <iron-icon class="map-icon" icon="[[item.iconSet]]:[[item.iconName]]"></iron-icon>
                        </div>
                    </div>
                </template>
            </dom-repeat>
            
            <dom-repeat id="cursors" items="[[cursorsList]]" initialCount="50">
                <template>
                    <div id="[[uniqId]]" class="cursor"
                    style="left:[[item.left]]; top:[[item.top]]; filter:[[item.filter]]"
                    >
                        <iron-icon id="[[uniqId]]-cursor" src="img/cursor.svg" style="height: 100%; width: 100%;"></iron-icon>            
                    </div>
                </template>
            </dom-repeat>



        </div>    
    </div>
    <div id="debugInfo">
        [[debugInfo]] 
        <paper-card on-click="resetScale"><iron-icon class="reset-scale" icon="maps:my-location"></iron-icon></paper-card>
        <paper-card on-click="zoomIn"><iron-icon class="reset-scale" icon="icons:zoom-in"></iron-icon></paper-card>
        <paper-card on-click="zoomOut"><iron-icon class="reset-scale" icon="icons:zoom-out"></iron-icon></paper-card>
    </div>
</div>
`;
    }

    static get is() {
        return 'ch-map';
    }

    allowdrop(e) {
        e.preventDefault();
    }

    ready() {
        super.ready();
        this.resetScale();
        let map = JSON.parse(this.locationMap);
        this.mapObjects = map.mapObjects;
        this.updateMapObjects();
        this.$.mainContentWrapper.scale = 1;
        this.initMouseZoom();
        this.initMouseMove();
        this.initTouchZoom();
        this.initDragAndDropListeners();
        this.cursors = {};
        this.cursorsList = [];
        this.cursorFilter = window.getFilterByRgb(this.r, this.g, this.b);

    }

    updateCursorCoordinates(event) {
        let container = this.$.mainContent.getBoundingClientRect();
        let scale = this.$.mainContentWrapper.scale;
        this.lastCursor = this.lastCursor || {};
        let left = (-1 * container.x + event.clientX) / scale + "px";
        let top = (-1 * container.y + event.clientY) / scale + "px";
        let leftDiff = parseFloat(this.lastCursor.left) - parseFloat(left);
        let topDiff = parseFloat(this.lastCursor.top) - parseFloat(top);
        if (leftDiff === 0 && topDiff === 0) {
            return;
        }
        if (leftDiff === 0 && Math.abs(topDiff) < 1) {
            return;
        }
        if (Math.abs(leftDiff) < 1 && topDiff === 0) {
            return;
        }
        this.lastCursor.left = left;
        this.lastCursor.top = top;
        this.$server.updateElement('mousemove', JSON.stringify({
            type: 'mousemove',
            elementId: this.uniqId,
            context: {
                left: left,
                top: top,
                filter: this.cursorFilter
            }
        }));
    };

    initMouseMove() {
        let self = this;
        let element = this.shadowRoot.querySelector('#' + self.uniqId);
        window.addEventListener("mousemove", event => {
            if (!self.lastMouseMoveTime || self.lastMouseMoveTime < new Date().getTime() - 50) {
                self.lastMouseMoveTime = new Date().getTime();
                self.updateCursorCoordinates(event);
            }

            self.ownMouseMoveDebouncer = Debouncer.debounce(
                self.ownMouseMoveDebouncer,
                timeOut.after(500),
                () => {
                    self.updateCursorCoordinates(event);
                }
            );
        });
    }

    updateMapObjects() {
        this.mapObjectsList = Object.values(this.mapObjects);
        this.mapIconsList = this.mapObjectsList.filter(it => it.type === 'icon');
        this.$.mapIcons.render();
    }

    initDragAndDropListeners() {
        let self = this;
        this.root.getElementById("mainContent").addEventListener("drop", function (e) {
            let mapObject = JSON.parse(e.dataTransfer.getData("item"));
            let touchInfo = JSON.parse(e.dataTransfer.getData("touchInfo"));
            console.log(e, mapObject, touchInfo);
            let style = self.$.mainContentWrapper.style;
            mapObject.position.left = e.offsetX + "px"; // + parseInt(style.left) * -1;
            mapObject.position.top = e.offsetY + "px"; // + parseInt(style.top) * -1;
            self.$server.updateElement('add', JSON.stringify({
                type: 'add', context: mapObject
            }));
            e.preventDefault();
        });
        document.addEventListener('element-drag-start', function (e) {
            self.dragInProgress = true;
        });
        document.addEventListener('element-drag-end', function (e) {
            self.dragInProgress = false;
        });
    }

    initMouseZoom() {
        window.addEventListener("wheel", event => {
            if (this.dragInProgress) {
                return;
            }
            let path = event.__composedPath || event.path;
            if (path.filter(it => it.id === 'mainContent').length <= 0) {
                return;
            }
            const delta = Math.sign(event.deltaY);
            event.preventDefault();
            if (delta < 0) {
                let scale = this.$.mainContentWrapper.scale + 0.02;
                this.updateScale(scale);
            } else {
                let scale = this.$.mainContentWrapper.scale;
                if (scale < 0.33) {
                    scale = (scale * 100 * 0.95) / 100;
                } else {
                    scale = scale - 0.02;
                }
                this.updateScale(scale);
            }
            this.updateDebugInfo();
        });
    }

    initTouchZoom() {
        let self = this;
        this.root.getElementById("mainContent").addEventListener("touchstart", function(e) {
            if (e.touches.length !== 2) {
                return;
            }
            this.touchInProgress = true;
            this.zoomMainContent = e;
            this.zoomMainContentStartScale = self.$.mainContentWrapper.scale || 1;
        }, false);
        this.root.getElementById("mainContent").addEventListener("touchmove", function (e) {
            if (self.dragInProgress) {
                return;
            }
            if (!e || e.touches.length !== 2 || !e.targetTouches[0] || !e.targetTouches[1]) {
                return;
            }

            let hypot1 = self.distance(this.zoomMainContent.targetTouches);
            let hypot2 = self.distance(e.targetTouches);
            let scale = this.zoomMainContentStartScale;
            scale = (hypot2 / hypot1) * scale;
            self.updateScale(scale);
            self.updateDebugInfo()
        }, false);
        this.root.getElementById("mainContent").addEventListener("touchend", function (e) {
            if (e.touches.length !== 2) {
                return;
            }
            this.touchInProgress = false;
            this.zoomMainContent = null;
        }, false);
        this.updateDebugInfo();
    }

    zoomIn() {
        this.updateScale(this.$.mainContentWrapper.scale + 0.15);
    }

    zoomOut() {
        this.updateScale(this.$.mainContentWrapper.scale - 0.15);
    }

    resetScale() {
        this.updateScale(1);
        let style = this.$.mainContentWrapper.style;
        style.left = "-50000px";
        style.top = "-50000px";
        this.updateDebugInfo();
    }

    updateScale(scale) {
        if (scale < 0.05) {
            scale = 0.05;
        }
        if (scale > 4) {
            scale = 4;
        }
        this.$.mainContentWrapper.scale = scale;
        this.$.mainContentWrapper.style.transform = `scale(${scale})`;
        this.updateDebugInfo();
    }

    distance(touches) {
        let x1 = touches[0].clientX;
        let x2 = touches[1].clientX;
        let y1 = touches[0].clientY;
        let y2 = touches[1].clientY;
        return Math.hypot(x2 - x1, y2 - y1);
    }

    unselectText() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    }


    handleTrackDown(e) {
        this.unselectText();
        let path = e.__composedPath || e.path;
        let mapObjects = path.filter(it => [...(it.classList || [])].includes('map-object'));
        let selected = this.shadowRoot.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        if (mapObjects.length > 0) {
            mapObjects[0].style.cursor = 'move';
            mapObjects[0].classList.add('selected');
        } else {
            e.target.style.cursor = 'move';
        }
    }

    handleTrackUp(e) {
        this.unselectText();
        let path = e.__composedPath || e.path;
        let mapObjects = path.filter(it => [...(it.classList || [])].includes('map-object'));
        if (mapObjects.length > 0) {
            mapObjects[0].style.cursor = 'grab';
            this.shadowRoot.querySelector('.selected');
        } else {
            e.target.style.cursor = 'grab';
        }
    }

    handleMainContentTrack(e) {
        if (e.target.id !== 'mainContent' || this.touchInProgress) {
            return;
        }
        let container = this.$.wrapper.getBoundingClientRect();
        let element = this.$.mainContentWrapper;
        let style = element.style;
        let scale = this.$.mainContentWrapper.scale;
        switch (e.detail.state) {
            case 'start':
                if (!style.left && !style.top) {
                    style.left = (element.getBoundingClientRect().x / scale - container.x / scale) + "px";
                    style.top = (element.getBoundingClientRect().y / scale - container.y / scale) + "px";
                }
                break;
            case 'track':
                style.left = (parseFloat(style.left) + e.detail.ddx) + "px";
                style.top = (parseFloat(style.top) + e.detail.ddy) + "px";
                break;
            case 'end':
                style.cursor = 'grab';
                break;
        }
        this.updateDebugInfo();
    }


    updateDebugInfo() {
        let style = this.$.mainContentWrapper.style;
        this.debugInfo = `x:${parseInt(style.left || '-50000') + 50000} y:${parseInt(style.left || '-50000') + 50000} scale:${Math.round(this.$.mainContentWrapper.scale * 100)}%`;
    }

    handleTrack(e) {
        if (this.touchInProgress) {
            return;
        }
        let element = e.target;
        let path = e.__composedPath || e.path;
        let mapObjects = path.filter(it => [...(it.classList || [])].includes('map-object'));
        if (mapObjects.length <= 0) {
            return;
        }
        element = mapObjects[0];

        let container = this.$.mainContent.getBoundingClientRect();
        let style = element.style;
        let scale = this.$.mainContentWrapper.scale;
        switch (e.detail.state) {
            case 'start':
                style.left = (element.getBoundingClientRect().x - container.x) / scale + "px";
                style.top = (element.getBoundingClientRect().y - container.y) / scale + "px";
                break;
            case 'track':
                let left = Math.round((e.detail.ddx * 1000000) / Math.round(scale * 1000)) / 1000;
                let top = Math.round((e.detail.ddy * 1000000) / Math.round(scale * 1000)) / 1000;
                //console.log(">>>", left, top);
                style.left = (parseFloat(style.left) + left) + "px";
                style.top = (parseFloat(style.top) + top) + "px";
                break;
            case 'end':
                style.cursor = 'grab';
                break;
        }
        this.lastMouseMoveTime = 0;
        this.$server.updateElement('move', JSON.stringify({
            type: 'move',
            elementId: element.id,
            context: {
                left: style.left,
                top: style.top
            }
        }));
    }

    // server call this method
    updateElement(event) {
        let updateEvent = JSON.parse(event);
        console.log("Server event >>", updateEvent);
        if (updateEvent.type === 'move') {
            this.moveEventHandler(updateEvent);
        } else if (updateEvent.type === 'add') {
            this.addEventHandler(updateEvent);
        } else if (updateEvent.type === 'mousemove') {
            this.onMouseMove(updateEvent);
        }
    }

    onMouseMove(event) {
        console.log(event);
        this.cursors[event.elementId] = event.context;
        this.cursorsList = Object.values(this.cursors);
        self.mouseMoveDebouncer = self.mouseMoveDebouncer || {};
        self.mouseMoveDebouncer[event.elementId] = Debouncer.debounce(
            self.mouseMoveDebouncer[event.elementId],
            timeOut.after(5000),
            () => {
                console.log('debounce', event);
                delete this.cursors[event.elementId];
                this.cursorsList = Object.values(this.cursors);
            }
        );
    }

    addEventHandler(addEvent) {
        this.mapObjects[addEvent.context.id] = addEvent.context;
        this.updateMapObjects();
    }

    moveEventHandler(updateEvent) {
        let element = this.shadowRoot.querySelector('#' + updateEvent.elementId);
        if (element) {
            let style = element.style;
            style.left = updateEvent.context.left;
            style.top = updateEvent.context.top;
        }
    }

    /*Make resizable div*/
    makeResizableDiv() {
        const div = 'selected';
        const element = this.shadowRoot.querySelector(div);
        const resizers = this.shadowRoot.querySelectorAll(div + ' .resizer');
        const minimum_size = 20;
        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;
        for (let i = 0;i < resizers.length; i++) {
            const currentResizer = resizers[i];
            currentResizer.addEventListener('mousedown', function(e) {
                e.preventDefault();
                original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
                original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
                original_x = element.getBoundingClientRect().left;
                original_y = element.getBoundingClientRect().top;
                original_mouse_x = e.pageX;
                original_mouse_y = e.pageY;
                window.addEventListener('mousemove', resize);
                window.addEventListener('mouseup', stopResize);
            });

            function resize(e) {
                if (currentResizer.classList.contains('bottom-right')) {
                    const width = original_width + (e.pageX - original_mouse_x);
                    const height = original_height + (e.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        element.style.width = width + 'px'
                    }
                    if (height > minimum_size) {
                        element.style.height = height + 'px'
                    }
                }
                else if (currentResizer.classList.contains('bottom-left')) {
                    const height = original_height + (e.pageY - original_mouse_y);
                    const width = original_width - (e.pageX - original_mouse_x);
                    if (height > minimum_size) {
                        element.style.height = height + 'px';
                    }
                    if (width > minimum_size) {
                        element.style.width = width + 'px';
                        element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
                    }
                }
                else if (currentResizer.classList.contains('top-right')) {
                    const width = original_width + (e.pageX - original_mouse_x);
                    const height = original_height - (e.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        element.style.width = width + 'px'
                    }
                    if (height > minimum_size) {
                        element.style.height = height + 'px';
                        element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
                    }
                }
                else {
                    const width = original_width - (e.pageX - original_mouse_x);
                    const height = original_height - (e.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        element.style.width = width + 'px';
                        element.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
                    }
                    if (height > minimum_size) {
                        element.style.height = height + 'px';
                        element.style.top = original_y + (e.pageY - original_mouse_y) + 'px'
                    }
                }
            }

            function stopResize() {
                window.removeEventListener('mousemove', resize)
            }
        }
    }

}

customElements.define(ChMap.is, ChMap);