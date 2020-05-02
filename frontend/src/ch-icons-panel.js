import {PolymerElement,html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-card/paper-card.js'
import '@polymer/iron-icon/iron-icon.js';
import {GestureEventListeners} from "@polymer/polymer/lib/mixins/gesture-event-listeners";

class ChIconsPanel extends GestureEventListeners(PolymerElement) {

    static get template() {
        return html`
<style>
.ch-icon {
    width: 48px;
    height: 48px;
}
.ch-icon-card {
    margin: 5px;
    padding: 5px;
    width: 75px;
    height: 75px;
    flex-direction: column;
    justify-content: center;
    justify-items: center;
    text-align: center;
}
.label-wrapper {
    display: block;
    overflow: hidden;
}
.icon-label {
    font-size: 10px;
    white-space: nowrap;
}

.ch-show-more {
    display: flex;
    justify-content: center;
    cursor: pointer;
    color: var(--paper-blue-800);
}
.draggable-preview {
    position: fixed;
    top: -1000px;
    left: -1000px;    
    z-index: 999999999;
    opacity: 0.7;
}
</style>

    <dom-repeat id="materialIcons" items="[[iconsToRender]]" filter="search" searchInput$="[[searchInput]]" initialCount="[[pageSize]]">
      <template>
        <paper-card class="ch-icon-card" title="[[item.name]]"
        on-track="handleTrack"
        >
            <iron-icon class="ch-icon" icon="[[item.iconSet]]:[[item.iconName]]"></iron-icon>
            <div class="label-wrapper"><span title="[[item.name]]" class="icon-label">[[item.name]]</span></div>
            <div style="display: none;">"[[item.iconSet]]:[[item.iconName]]"</div>
        </paper-card>
      </template>
    </dom-repeat>
    <dom-if id="materialIconsShowMore" if="[[hasMore]]">
        <template>
            <a class="ch-show-more" on-click="showMore">Показать больше ([[moreCount]])</a>
        </template>
    </dom-if>
    <div id="draggableArea"></div>
<!--  
  draggable="true" on-dragstart="dragstart"  on-dragend="dragend"
  -->
`;
    }

    static get is() {
        return 'ch-icons-panel';
    }

    dragstart(e) {
        console.log(e);
        e.dataTransfer.setData("item", JSON.stringify(e.model.item));
        e.dataTransfer.setData("touchInfo", JSON.stringify({
            offsetX: e.offsetX, offsetY: e.offsetY
        }));
        let event = new CustomEvent("element-drag-start", {});
        document.dispatchEvent(event);
    }
    dragend(e) {
        console.log(e);
        let event = new CustomEvent("element-drag-end", {});
        document.dispatchEvent(event);
    }

    getPath(e) {
        return e.composedPath() || e.path;
    }

    deepClone(node) {
        const clone = (n, p) => {
            const walk = (nextn, nextp) => {
                while (nextn) {
                    clone(nextn, nextp);
                    nextn = nextn.nextSibling;
                }
            };

            let c = n.cloneNode();
            p.appendChild(c);
            if (n.shadowRoot) {
                walk(n.shadowRoot.firstChild, c.attachShadow({ mode: 'open' }));
            }

            walk(n.firstChild, c);
        };

        const cloneNode = document.createElement("div");
        clone(node, cloneNode);
        return cloneNode;
    }

    handleTrack(e) {
        let element = e.target;
        let path = this.getPath(e);
        let cards = path.filter(it => [...(it.classList || [])].includes('ch-icon-card'));
        if (e.detail.state !== 'track' && cards.length <= 0) {
            return;
        }

        let padding = 35;
        switch (e.detail.state) {
            case 'start':
                element = cards[0];
                document.dispatchEvent(new CustomEvent("element-drag-start", {}));
                const copy = this.deepClone(element);
                copy.classList.add('draggable-preview');
                this.$.draggableArea.appendChild(copy);
                this.draggablePreview = copy;
                break;
            case 'track':
                this.draggablePreview.style.top = (e.detail.y - padding) + 'px';
                this.draggablePreview.style.left = (e.detail.x - padding) + 'px';
                this.unselectText();
                break;
            case 'end':
                document.dispatchEvent(new CustomEvent("element-drag-end", {}));
                e.detail.sourceEvent = null;
                let detail = JSON.parse(JSON.stringify(e.detail));
                detail.item = JSON.stringify(e.model.item);
                detail.padding = padding;
                document.dispatchEvent(new CustomEvent("element-drop", {
                    detail: detail
                }));
                this.$.draggableArea.removeChild(this.draggablePreview);
                break;
        }
    }

    unselectText() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    }

    ready() {
        super.ready();
        this.pageSize = 102;
        console.log(this.iconsJson);
        this.icons = JSON.parse(this.iconsJson);
        this.initIconsSet();

    }

    showMore() {
        this.page = this.page + 1;
        this.iconsToRender = this.filteredIcons.slice(0, this.page * this.pageSize);
        this.showMoreUpdate();
        this.$.materialIcons.render();
        this.$.materialIconsShowMore.render();
    }

    search(item) {
        if (!item.name || !this.searchInput) {
            return true;
        }
        return item.name.toLocaleLowerCase().indexOf(this.searchInput.toLocaleLowerCase()) >= 0;
    }

    refresh() {
        this.initIconsSet();
        this.$.materialIcons.render();
        this.$.materialIconsShowMore.render();
    }

    initIconsSet() {
        this.page = 1;
        this.iconsToRender = this.icons.filter(item => this.search(item)).slice(0, this.page * this.pageSize);
        this.filteredIcons = this.icons.filter(item => this.search(item));
        this.showMoreUpdate();
    }

    showMoreUpdate() {
        this.hasMore = this.filteredIcons.length > this.iconsToRender.length;
        this.moreCount = this.filteredIcons.length - this.iconsToRender.length;
    }
}

customElements.define(ChIconsPanel.is, ChIconsPanel);