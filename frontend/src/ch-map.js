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
</style>

<div id="wrapper" class="wrapper">
    <div id="mainContentWrapper">
        <div id="mainContent" class="bg-grid" on-track="handleMainContentTrack" on-down="handleMainContentDown" on-up="handleMainContentUp">
            <div id="testElement" on-track="handleTrack">[[message]]</div>
        </div>    
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
                    console.log('Down');
                    let scale = this.$.mainContentWrapper.scale + 0.1;
                    this.$.mainContentWrapper.scale = scale;
                    this.$.mainContentWrapper.style.transform = `scale(${scale})`;
                } else {
                    console.log('Up');
                    let scale = this.$.mainContentWrapper.scale - 0.1;
                    this.$.mainContentWrapper.scale = scale;
                    this.$.mainContentWrapper.style.transform = `scale(${scale})`;
                }
            }
        });
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
        switch(e.detail.state) {
            case 'start':
                this.$.mainContentWrapper.xOffset = e.detail.x - boundingClientRect.x;
                this.$.mainContentWrapper.yOffset = e.detail.y - boundingClientRect.y;
                break;
            case 'track':
                this.$.mainContentWrapper.style.left = (e.detail.x - container.x - this.$.mainContentWrapper.xOffset) + "px";
                this.$.mainContentWrapper.style.top = (e.detail.y - container.y - this.$.mainContentWrapper.yOffset) + "px";
                break;
            case 'end':
                this.$.mainContentWrapper.style.cursor = 'grab';
                break;
        }
    }





    handleTrack(e) {
        let container = this.$.mainContent.getBoundingClientRect();
        switch(e.detail.state) {
            case 'start':
                this.$.testElement.xOffset = e.detail.x - this.$.testElement.getBoundingClientRect().x;
                this.$.testElement.yOffset = e.detail.y - this.$.testElement.getBoundingClientRect().y;
                break;
            case 'track':
                this.$.testElement.style.left = (e.detail.x - container.x - this.$.testElement.xOffset) + "px";
                this.$.testElement.style.top = (e.detail.y - container.y - this.$.testElement.yOffset) + "px";
                break;
            case 'end':
                this.$.testElement.style.cursor = 'grab';
                break;
        }
    }

}

customElements.define(ChMap.is, ChMap);