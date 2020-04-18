import {PolymerElement,html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-card/paper-card.js'
import '@polymer/iron-icon/iron-icon.js';

class ChIconsPanel extends PolymerElement {

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
</style>

    <dom-repeat id="materialIcons" items="[[iconsToRender]]" filter="search" searchInput$="[[searchInput]]" initialCount="[[pageSize]]">
      <template>
        <paper-card class="ch-icon-card" title="[[item.name]]">
            <iron-icon class="ch-icon" icon="[[item.collection]]:[[item.icon]]"></iron-icon>
            <div class="label-wrapper"><span title="[[item.name]]" class="icon-label">[[item.name]]</span></div>
        </paper-card>
      </template>
    </dom-repeat>
    <dom-if id="materialIconsShowMore" if="[[hasMore]]">
        <template>
            <a class="ch-show-more" on-click="showMore">Показать больше ([[moreCount]])</a>
        </template>
    </dom-if>
`;
    }

    static get is() {
        return 'ch-icons-panel';
    }

    ready() {
        super.ready();
        this.pageSize = 102;
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