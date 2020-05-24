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
    cursor: unset;
}

#mainContent {
    position: relative;
    height: 100000px;
    width: 100000px;
    cursor: unset;
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
  background: unset;
  width: 100px;
  height: 100px;
  position: absolute;
  top: 100px;
  left: 100px;
  resize: both;
}

.resizers {
    padding: 3px;
    height: calc(100% - 6px);
    width: calc(100% - 6px);
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
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: white;
  border: 1px solid #787878;
  position: absolute;
}

.selected .resizers .resizer.rotate {
    right: calc(50% + -2px);
    top: -30px;
}


.selected .resizers .rotateLine{
    position: absolute;
    height: 30px;
    right: 50%;
    top: -30px;
    border-radius: unset;
    border-left: 3px solid #787878;
    border-left-style: dashed;
    box-sizing: border-box;
}

.selected .resizers .resizer.top-left {
  left: -2px;
  top: -2px;
  cursor: nwse-resize; /*resizer cursor*/
}
.selected .resizers .resizer.top-right {
  right: -2px;
  top: -2px;
  cursor: nesw-resize;
}
.selected .resizers .resizer.bottom-left {
  left: -2px;
  bottom: -2px;
  cursor: nesw-resize;
}
.selected .resizers .resizer.bottom-right {
  right: -2px;
  bottom: -2px;
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
    cursor: grab;
    transform-origin: center center;
}
.cursor {
    width: 32px;
    height: 32px;
    position: absolute;
    margin-left: -5px;
}

.selected .settings {
    right: -22px;
    position: absolute;
    top: -22px;
    width: 24px;
    height: 24px;
    display: block;
    cursor: pointer;
}

.settings {
    display: none;
}

.rotate-center {
    color: white;
    width: 24px;
    height: 24px;
    margin-left: -12px;
    margin-top: -12px;
    border-radius: 50%;
    position: fixed;
}

.rotate-cursor {
    cursor: url('img/rotate.png'), auto;
}

</style>

<div id="wrapper" class="wrapper">
    <div id="mainContentWrapper">
        <div id="mainContent" class="bg-grid" on-track="handleMainContentTrack" on-down="handleTrackDown" on-up="handleTrackUp" on-dragover="allowdrop">
            <dom-repeat id="mapIcons" items="[[mapIconsList]]" initialCount="50">
                <template>
                    <div id="[[item.id]]" class="map-object" on-track="handleTrack" on-down="handleTrackDown" on-up="handleTrackUp"
                        style="transform: rotate([[item.position.rotate]]deg); left:[[item.position.left]]; top:[[item.position.top]]; width:[[item.size.width]]; height:[[item.size.height]];"
                    >
                        <div class='resizers'>
                        <div class='rotateLine' on-down="resizeStart" on-up="resizeStop"></div>
                        <div class='resizer rotate rotate-cursor' on-down="resizeStart" on-up="resizeStop"></div>
                        <div class='resizer top-left' on-down="resizeStart" on-up="resizeStop"></div>
                        <div class='resizer top-right' on-down="resizeStart" on-up="resizeStop"></div>
                        <div class='resizer bottom-left' on-down="resizeStart" on-up="resizeStop"></div>
                        <div class='resizer bottom-right' on-down="resizeStart" on-up="resizeStop"></div>
                        <iron-icon class="settings" icon="icons:settings-applications"></iron-icon>
                    <iron-icon class="map-icon" icon="[[item.iconSet]]:[[item.iconName]]"></iron-icon>
                        </div>
                    </div>
                </template>
            </dom-repeat>
            
            <dom-repeat id="cursors" items="[[cursorsList]]" initialCount="50">
                <template>
                    <div id="[[uniqId]]" class="cursor"
                    style="left:[[item.left]]; top:[[item.top]]; filter:[[item.filter]];"
                    >
                        <iron-icon id="[[uniqId]]-cursor" src="img/cursor.svg" style="height: 100%; width: 100%;"></iron-icon>         
                        <span>[[item.userName]]</span>  
                    </div>
                </template>
            </dom-repeat>



        </div>    
    </div>
        
    <div id="rotateCenter" class="rotate-center" style="left: [[rotateCenterX]]px; top: [[rotateCenterY]]px">
        <iron-icon icon="image:rotate-left"></iron-icon>
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
        this.initKeyboardActions();
        this.cursors = {};
        this.cursorsList = [];
        if (window.getFilterByRgb) {
            this.cursorFilter = window.getFilterByRgb(this.r, this.g, this.b);
        }
        this.initCheckConnection();
    }

    initCheckConnection() {
        this.checkServerConnection();
        setInterval(() => {
            this.$server.updateElement('checkServerConnection', JSON.stringify({
                type: 'checkServerConnection'
            }));
        }, 10000);
    }

    initKeyboardActions() {
        let self = this;
        window.addEventListener("keydown",function(e) {
            if (e.ctrlKey === true && e.code === 'KeyC') {
                self.unselectText();
                let allSelected = self.shadowRoot.querySelectorAll('.selected');
                if (allSelected.length !== 1) {
                    self.componentBuffer = null;
                    self.$server.showNotification('LUMO_ERROR', 'На данный момент нельзя скопировать больше чем один элемент.')
                    return;
                }

                let selected = allSelected[0];
                let selectedObject = self.mapObjects[selected.id];
                self.componentBuffer = JSON.stringify(selectedObject);
            }

            let cursorPosition = self.currentCursorPosition;
            if (e.ctrlKey === true && e.code === 'KeyV' && cursorPosition && self.componentBuffer) {
                let copy = JSON.parse(self.componentBuffer);
                let cursor = self.mouseToMainContentPosition(cursorPosition.pageX, cursorPosition.pageY);
                let left = parseFloat(copy.size.width) / 2;
                let top = parseFloat(copy.size.height) / 2;
                copy.position.left = cursor.x - left + 'px';
                copy.position.top = cursor.y - top + 'px';
                self.$server.updateElement('add', JSON.stringify({
                    type: 'add', context: copy
                }));
                self.componentBuffer = JSON.stringify(copy);
            }
            if (e.code === 'Delete') {
                let allSelected = self.shadowRoot.querySelectorAll('.selected');
                allSelected.forEach(selected => {
                    self.$server.updateElement('delete', JSON.stringify({
                        type: 'delete', elementId: selected.id, context: {id: selected.id}
                    }));
                });
            }
        });
    }

    resizeStart() {
        this.resizeInprogress = true;
    }

    resizeStop() {
        this.resizeInprogress = false;
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
                filter: this.cursorFilter,
                userName: this.userName
            }
        }));
    };

    initMouseMove() {
        let self = this;
        self.currentCursorPosition = null;
        let element = this.shadowRoot.querySelector('#' + self.uniqId);
        window.addEventListener("mousemove", event => {
            let isContent = self.getPath(event).filter(it => it.id === 'mainContentWrapper' || it.id === 'wrapper').length > 0;
            if (!isContent) {
                self.currentCursorPosition = null;
                return;
            }
            self.currentCursorPosition = event;
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
        document.addEventListener('element-drop', function (e) {
            console.warn(e.detail);
            let cursorX = e.detail.x;
            let cursorY = e.detail.y;

            let position = self.mouseToMainContentPosition(cursorX, cursorY);
            let mapObject = JSON.parse(e.detail.item);
            let left = parseFloat(mapObject.size.width) / 2;
            let top = parseFloat(mapObject.size.height) / 2;
            mapObject.position.left = position.x - left + "px"; // + parseInt(style.left) * -1;
            mapObject.position.top = position.y - top + "px"; // + parseInt(style.top) * -1;
            self.$server.updateElement('add', JSON.stringify({
                type: 'add', context: mapObject
            }));
        });
    }

    mouseToMainContentPosition(cursorX, cursorY) {
        let wrapper = this.$.wrapper;
        let main = this.$.mainContentWrapper;
        let scale = this.$.mainContentWrapper.scale;
        let xPosition = cursorX - parseFloat(wrapper.offsetLeft);
        let yPosition = cursorY - parseFloat(wrapper.offsetTop);
        let position = {};
        position.x = -this.toMainOffset(main.offsetLeft, scale) + xPosition / scale;
        position.y = -this.toMainOffset(main.offsetTop, scale) + yPosition / scale;
        return position;
    }

    toMainOffset(offset, scale) {
        return ((parseFloat(offset) + 50000) / scale) - 50000;
    }

    initMouseZoom() {
        let self = this;
        window.addEventListener("wheel", event => {
            if (this.dragInProgress || this.resizeInprogress) {
                return;
            }
            let path = this.getPath(event);
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


            let x1 = e.targetTouches[0].clientX;
            let x2 = e.targetTouches[1].clientX;
            let y1 = e.targetTouches[0].clientY;
            let y2 = e.targetTouches[1].clientY;
            self.currentCursorPosition = {
                pageX: (x1 + x2) / 2,
                pageY: (y1 + y2) / 2
            };

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
        let cursorPosition = this.currentCursorPosition || {pageX: 0, pageY: 0};
        let cursor = this.mouseToMainContentPosition(cursorPosition.pageX, cursorPosition.pageY);

        this.$.mainContentWrapper.scale = scale;
        this.$.mainContentWrapper.style.transform = `scale(${scale})`;

        let cursorAfterZoom = this.mouseToMainContentPosition(cursorPosition.pageX, cursorPosition.pageY);
        cursor.x = Math.round(cursor.x);
        cursor.y = Math.round(cursor.y);
        cursorAfterZoom.x = Math.round(cursorAfterZoom.x);
        cursorAfterZoom.x = Math.round(cursorAfterZoom.x);

        if (this.currentCursorPosition) {
            let style = this.$.mainContentWrapper.style;
            const scaledDiffX = (cursorAfterZoom.x - cursor.x) * scale;
            style.left = (parseFloat(style.left) + scaledDiffX) + "px";
            const scaledDiffY = (cursorAfterZoom.y - cursor.y) * scale;
            style.top = (parseFloat(style.top) + scaledDiffY) + "px";
        }

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
        const self = this;
        this.unselectText();
        if (e.detail && e.detail.preventer) {
            this.touches = e.detail.preventer.touches.length;
        }
        let path = this.getPath(e);
        let mapObjects = path.filter(it => [...(it.classList || [])].includes('map-object'));
        let selected = this.shadowRoot.querySelector('.selected');
        if (selected && e.detail.sourceEvent.ctrlKey !== true) {
            let allSelected = this.shadowRoot.querySelectorAll('.selected');
            allSelected.forEach(it => it.classList.remove('selected'));
        }
        if (mapObjects.length > 0) {
            mapObjects[0].style.cursor = 'move';
            mapObjects[0].classList.add('selected');
            makeResizableDiv(this, '#' + mapObjects[0].id, (element) => {
                self.sendResizeElement(element);
            });
        } else {
            e.target.style.cursor = 'move';
        }
        this.updateDebugInfo();
    }

    sendResizeElement(element) {
        const self = this;
        const sendServerEvent = () => {
            self.$server.updateElement('resize', JSON.stringify({
                type: 'resize',
                elementId: element.id,
                context: {
                    left: element.style.left,
                    top: element.style.top,
                    height: element.style.height,
                    width: element.style.width,
                    rotate: getCurrentRotation(element)
                }
            }));
        };

        if (!self.lastResizeTime || self.lastResizeTime < new Date().getTime() - 30) {
            self.lastResizeTime = new Date().getTime();
            sendServerEvent();
        }

        this.resize = Debouncer.debounce(
            this.resize,
            timeOut.after(350),
            () => {
                sendServerEvent();
            }
        );
    }

    handleTrackUp(e) {
        this.unselectText();
        if (e.detail && e.detail.preventer) {
            this.touches = e.detail.preventer.touches.length;
        }
        let path = this.getPath(e);
        let mapObjects = path.filter(it => [...(it.classList || [])].includes('map-object'));
        if (mapObjects.length > 0) {
            mapObjects[0].style.cursor = 'grab';
            this.shadowRoot.querySelector('.selected');
        } else {
            e.target.style.cursor = 'unset';
        }
    }

    handleMainContentTrack(e) {
        if (e.target.id !== 'mainContent' || this.touchInProgress || this.resizeInprogress) {
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
                break;
        }
        this.updateDebugInfo();
    }


    updateDebugInfo() {
        let style = this.$.mainContentWrapper.style;
        let scale = this.$.mainContentWrapper.scale;
        this.debugInfo = `x:${Math.round((parseInt(style.left || '-50000') + 50000) / scale)} y:${Math.round((parseInt(style.left || '-50000') + 50000) / scale)}  scale:${Math.round(this.$.mainContentWrapper.scale * 100)}%`;
    }

    handleTrack(e) {
        if (this.touches > 1) {
            return;
        }
        if (this.touchInProgress || this.resizeInprogress) {
            return;
        }
        let element = e.target;
        let path = this.getPath(e);
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
                //style.left = (element.getBoundingClientRect().x - container.x) / scale + "px";
                //style.top = (element.getBoundingClientRect().y - container.y) / scale + "px";
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

    getPath(e) {
        return e.composedPath() || e.path;
    }

// server call this method
    updateElement(event) {
        let updateEvent = JSON.parse(event);
        console.log("Server event >>", updateEvent);
        if (updateEvent.type === 'move') {
            this.moveEventHandler(updateEvent);
        } else if (updateEvent.type === 'add') {
            this.addEventHandler(updateEvent);
        } else if (updateEvent.type === 'resize') {
            this.resizeEventHandler(updateEvent);
        } else if (updateEvent.type === 'delete') {
            this.deleteEventHandler(updateEvent);
        } else if (updateEvent.type === 'mousemove') {
            this.onMouseMove(updateEvent);
        } else if (updateEvent.type === 'checkServerConnection') {
            this.checkServerConnection();
        }

    }

    resizeEventHandler(updateEvent) {
        let element = this.shadowRoot.querySelector('#' + updateEvent.elementId);
        if (element) {
            let style = element.style;
            style.left = updateEvent.context.left;
            style.top = updateEvent.context.top;
            style.width = updateEvent.context.width;
            style.height = updateEvent.context.height;
            style.transform = `rotate(${updateEvent.context.rotate}deg)`
        }
    }

    onMouseMove(event) {
        this.cursors[event.elementId] = event.context;
        this.cursorsList = Object.values(this.cursors);
        self.mouseMoveDebouncer = self.mouseMoveDebouncer || {};
        self.mouseMoveDebouncer[event.elementId] = Debouncer.debounce(
            self.mouseMoveDebouncer[event.elementId],
            timeOut.after(5000),
            () => {
                delete this.cursors[event.elementId];
                this.cursorsList = Object.values(this.cursors);
            }
        );
    }

    addEventHandler(addEvent) {
        this.mapObjects[addEvent.context.id] = addEvent.context;
        this.updateMapObjects();
    }

    deleteEventHandler(deleteEvent) {
        delete this.mapObjects[deleteEvent.context.id];
        this.updateMapObjects();
        this.shadowRoot.querySelectorAll('.selected').forEach(it => it.classList.remove('selected'));
    }

    moveEventHandler(updateEvent) {
        let element = this.shadowRoot.querySelector('#' + updateEvent.elementId);
        if (element) {
            let style = element.style;
            style.left = updateEvent.context.left;
            style.top = updateEvent.context.top;
        }
    }

    /* call from server for check connection */
    checkServerConnection() {
        console.log("check");
        self.checkServerConnection = Debouncer.debounce(
            self.checkServerConnection,
            timeOut.after(35000),
            () => {
                console.error("connection problem");
                // window.location.reload();
            }
        );
    }


}

customElements.define(ChMap.is, ChMap);