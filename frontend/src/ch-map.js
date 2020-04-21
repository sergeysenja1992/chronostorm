import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-card/paper-card.js'
import '@polymer/iron-icon/iron-icon.js';
import {GestureEventListeners} from "@polymer/polymer/lib/mixins/gesture-event-listeners";

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
    background-color: red;
    cursor: grab;
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
    top: 10px;
    display: inline-block;
    z-index: 999999999!important;
}
.reset-scale {
    cursor: pointer;
}
.map-icon {
    position: absolute;
}
</style>

<div id="wrapper" class="wrapper">
    <div id="mainContentWrapper">
        <div id="mainContent" class="bg-grid" on-track="handleMainContentTrack" on-down="handleTrackDown" on-up="handleTrackUp" on-dragover="allowdrop">
            <div id="testElement" on-track="handleTrack" on-down="handleTrackDown" on-up="handleTrackUp">[[message]]</div>

            <dom-repeat id="mapIcons" items="[[mapIconsList]]" initialCount="50">
                <template>
                    <iron-icon class="map-icon" id="[[item.id]]" icon="[[item.iconSet]]:[[item.iconName]]"
                        style="left:[[item.position.left]]; top:[[item.position.top]]; width:[[item.size.width]]; height:[[item.size.height]];"
                        on-track="handleTrack" on-down="handleTrackDown" on-up="handleTrackUp"
                    ></iron-icon>
                </template>
            </dom-repeat>

        </div>    
    </div>
    <div id="debugInfo">
        [[debugInfo]] <paper-card on-click="resetScale"><iron-icon class="reset-scale" icon="maps:my-location"></iron-icon></paper-card>
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
        this.initTouchZoom();
        this.initDragAndDropListeners();
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
                if (scale > 4) {
                    return;
                }
                this.updateScale(scale);
            } else {
                let scale = this.$.mainContentWrapper.scale;
                if (scale < 0.33) {
                    scale = (scale * 100 * 0.95) / 100;
                } else {
                    scale = scale - 0.02;
                }
                if (scale < 0.05) {
                    return;
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
            if (scale < 0.05) {
                scale = 0.05;
            }
            if (scale > 4) {
                scale = 4;
            }
            self.updateScale(scale);
            self.updateDebugInfo()
        }, false);
        this.root.getElementById("mainContent").addEventListener("touchend", function (e) {
            if (e.touches.length !== 2) {
                return;
            }
            this.zoomMainContent = null;
        }, false);
        this.updateDebugInfo();
    }


    resetScale() {
        this.updateScale(1);
        let style = this.$.mainContentWrapper.style;
        style.left = "-50000px";
        style.top = "-50000px";
        this.updateDebugInfo();
    }

    updateScale(scale) {
        this.$.mainContentWrapper.scale = scale;
        this.$.mainContentWrapper.style.transform = `scale(${scale})`;
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
        e.target.style.cursor = 'move';
    }

    handleTrackUp(e) {
        e.target.style.cursor = 'grab';
    }

    handleMainContentTrack(e) {
        if (e.target.id !== 'mainContent') {
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
                style.left = (parseInt(style.left) + e.detail.ddx) + "px";
                style.top = (parseInt(style.top) + e.detail.ddy) + "px";
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
        let container = this.$.mainContent.getBoundingClientRect();
        let element = e.target;
        let style = element.style;
        let scale = this.$.mainContentWrapper.scale;
        switch (e.detail.state) {
            case 'start':
                style.left = (element.getBoundingClientRect().x - container.x) / scale + "px";
                style.top = (element.getBoundingClientRect().y - container.y) / scale + "px";
                break;
            case 'track':
                style.left = (parseInt(style.left) + Math.round((e.detail.ddx * 100000) / Math.round(scale * 1000)) / 100) + "px";
                style.top = (parseInt(style.top) + Math.round((e.detail.ddy * 100000) / Math.round(scale * 1000)) / 100) + "px";
                break;
            case 'end':
                style.cursor = 'grab';
                break;
        }
        this.$server.updateElement('move', JSON.stringify({
            type: 'move',
            elementId: e.target.id,
            context: {
                left: style.left,
                top: style.top
            }
        }));
    }

    updateElement(event) {
        let updateEvent = JSON.parse(event);
        console.log("Server event >>", updateEvent);
        if (updateEvent.type === 'move') {
            this.moveEventHandler(updateEvent);
        } else if (updateEvent.type === 'add') {
            this.addEventHandler(updateEvent);
        }
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
}

customElements.define(ChMap.is, ChMap);