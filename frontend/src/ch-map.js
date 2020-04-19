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
        <div id="mainContent" class="bg-grid" on-track="handleMainContentTrack" on-down="handleTrackDown" on-up="handleTrackUp">
            <div id="testElement" on-track="handleTrack" on-down="handleTrackDown" on-up="handleTrackUp">[[message]]</div>
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
            if (e.touches.length !== 2 && e.touches[0] && e.touches[1]) {
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
        this.$[e.target.id].style.cursor = 'move';
    }

    handleTrackUp(e) {
        this.$[e.target.id].style.cursor = 'grab';
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
        let element = this.$[e.target.id];
        let style = element.style;
        let scale = this.$.mainContentWrapper.scale;
        switch (e.detail.state) {
            case 'start':
                style.left = (element.getBoundingClientRect().x - container.x) / scale + "px";
                style.top = (element.getBoundingClientRect().y - container.y) / scale + "px";
                break;
            case 'track':
                style.left = (parseInt(style.left) + e.detail.ddx / scale) + "px";
                style.top = (parseInt(style.top) + e.detail.ddy / scale) + "px";
                break;
            case 'end':
                style.cursor = 'grab';
                break;
        }
    }
}

customElements.define(ChMap.is, ChMap);