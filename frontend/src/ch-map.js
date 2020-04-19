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
    z-index: 999999999;
}
</style>

<div id="wrapper" class="wrapper">
    <div id="mainContentWrapper">
        <div id="mainContent" class="bg-grid" on-track="handleMainContentTrack" on-down="handleMainContentDown" on-up="handleMainContentUp">
            <div id="testElement" on-track="handleTrack">[[message]]</div>
        </div>    
    </div>
    <div id="debugInfo">
        [[debugInfo]]
        <br>
        [[eventInfo]]
    </div>
</div>
`;
    }

    static get is() {
        return 'ch-map';
    }

    ready() {
        super.ready();
        this.map = {};
        this.$.mainContentWrapper.scale = 1;
        window.addEventListener("wheel", event => {
            if(event.ctrlKey === true) {
                const delta = Math.sign(event.deltaY);
                event.preventDefault();
                if (delta > 0) {
                    let scale = this.$.mainContentWrapper.scale + 0.03;
                    if (scale > 400) {
                        return;
                    }
                    this.$.mainContentWrapper.scale = scale;
                    this.$.mainContentWrapper.style.transform = `scale(${scale})`;
                } else {
                    let scale = this.$.mainContentWrapper.scale - 0.03;
                    if (scale < 0.3) {
                        return;
                    }
                    this.$.mainContentWrapper.scale = scale;
                    this.$.mainContentWrapper.style.transform = `scale(${scale})`;
                }
                this.updateDebugInfo();
            }
        });
        this.i = 0;

        this.root.getElementById("mainContent").addEventListener("touchstart", function(e) {
            if (e.touches.length !== 2) {
                return;
            }
            this.zoomMainContent = e;
            this.zoomMainContentStartScale = self.$.mainContentWrapper.scale || 1;
        }, false);
        let self = this;
        this.root.getElementById("mainContent").addEventListener("touchmove", function(e) {
            if (e.touches.length !== 2) {
                return;
            }

            let hypot1 = self.distance(this.zoomMainContent.targetTouches);
            let hypot2 = self.distance(e.targetTouches);
            let scale = this.zoomMainContentStartScale;
            scale = (hypot2 / hypot1) * scale;
            if (scale < 0.31) {
                scale = 0.31;
            }
            if (scale > 4) {
                scale = 4;
            }
            self.$.mainContentWrapper.scale = scale;
            self.$.mainContentWrapper.style.transform = `scale(${scale})`;
            self.updateDebugInfo()
        }, false);
        this.root.getElementById("mainContent").addEventListener("touchend", function(e) {
            if (e.touches.length !== 2) {
                return;
            }
            this.zoomMainContent = null;
        }, false);
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


    handleMainContentDown(e) {
        this.unselectText();
        this.$.mainContent.style.cursor = 'move';
    }

    handleMainContentUp(e) {
        this.$.mainContent.style.cursor = 'grab';
    }

    handleMainContentTrack(e) {
        if (e.target.id !== 'mainContent') {
            return;
        }
        let container = this.$.wrapper.getBoundingClientRect();
        let boundingClientRect = this.$.mainContentWrapper.getBoundingClientRect();
        let style = this.$.mainContentWrapper.style;
        let scale = this.$.mainContentWrapper.scale;
        switch(e.detail.state) {
            case 'start':
                this.$.mainContentWrapper.xOffset = e.detail.x - boundingClientRect.x / scale;
                this.$.mainContentWrapper.yOffset = e.detail.y - boundingClientRect.y / scale;
                break;
            case 'track':
                style.left = (e.detail.x - container.x / scale - this.$.mainContentWrapper.xOffset) + "px";
                style.top = (e.detail.y - container.y / scale - this.$.mainContentWrapper.yOffset) + "px";
                break;
            case 'end':
                style.cursor = 'grab';
                break;
        }
        this.updateDebugInfo();
    }


    updateDebugInfo() {
        let style = this.$.mainContentWrapper.style;
        this.debugInfo = `left:${style.left} top:${style.top} scale:${Math.round(this.$.mainContentWrapper.scale * 100)}%`;

        let scale = this.$.mainContentWrapper.scale;
        let container = this.$.wrapper.getBoundingClientRect();
        let boundingClientRect = this.$.mainContentWrapper.getBoundingClientRect();
        console.log('>1', container.x, container.y);
        console.log('>2', boundingClientRect.x / scale, boundingClientRect.y / scale);
    }

    handleTrack(e) {
        let container = this.$.mainContent.getBoundingClientRect();
        let scale = this.$.mainContentWrapper.scale;
        switch(e.detail.state) {
            case 'start':
                this.$.testElement.xOffset = e.detail.x - this.$.testElement.getBoundingClientRect().x / scale;
                this.$.testElement.yOffset = e.detail.y - this.$.testElement.getBoundingClientRect().y / scale;
                break;
            case 'track':
                this.$.testElement.style.left = (e.detail.x - container.x / scale - this.$.testElement.xOffset) + "px";
                this.$.testElement.style.top = (e.detail.y - container.y / scale - this.$.testElement.yOffset) + "px";
                console.log(e.detail);
                break;
            case 'end':
                this.$.testElement.style.cursor = 'grab';
                break;
        }
    }

}

customElements.define(ChMap.is, ChMap);