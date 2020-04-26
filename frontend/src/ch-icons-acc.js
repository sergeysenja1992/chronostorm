import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-card/paper-card.js'
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';

class ChIconsAcc extends PolymerElement {

    static get template() {
        return html`
<style>
.full-size {
    width: 100%;
    height: 100%;
}
.acc-container {
    display: flex;
    flex-direction: column;
}
#icons {
    overflow-y: scroll;
}
#user-elements {
    overflow-y: scroll;
}
#interactive-elements {
    overflow-y: scroll;
}
.acc-item {
   background-color: #f5f5f5;
   cursor: pointer;
   padding: 2px;
   padding-left: 5px;
}
.acc-hide {
   height: 0;
}
.acc-show {
}
.acc-item:hover {
   background-color: #d0d0d0;
   cursor: pointer; 
}
.acc-icon {
    float: right;
}
.content {
   transition-duration: 0.5s;
}
</style>

<div class="full-size acc-container">
    <div class="acc-item" elementid="user-elements" on-click="showMore">
        <span>Пользовательские елементы</span>
        <iron-icon id="user-elements-more" class="acc-icon acc-icon-more" icon="icons:expand-more"></iron-icon>
        <iron-icon id="user-elements-less" class="acc-icon acc-icon-less" icon="icons:expand-less"></iron-icon>
    </div>
    <div id="user-elements" class="full-size content">
     
    </div>
    <div class="acc-item interactive-elements" elementid="interactive-elements" on-click="showMore">
        <span>Интерактивные елементы</span>
        <iron-icon id="interactive-elements-more" class="acc-icon acc-icon-more" icon="icons:expand-more"></iron-icon>
        <iron-icon id="interactive-elements-less" class="acc-icon acc-icon-less" icon="icons:expand-less"></iron-icon>
    </div>
    <div id="interactive-elements" class="full-size content">
     
    </div>
    <div class="acc-item icons" elementid="icons" on-click="showMore">
        <span>Иконки</span>
        <iron-icon id="icons-more" class="acc-icon acc-icon-more" icon="icons:expand-more"></iron-icon>
        <iron-icon id="icons-less" class="acc-icon acc-icon-less" icon="icons:expand-less"></iron-icon>
    </div>
    <div id="icons" class="full-size content">
     
    </div>
</div>
`;
    }

    static get is() {
        return 'ch-icons-acc';
    }


    ready() {
        super.ready();
        let accItems = ['user-elements', 'interactive-elements', 'icons'];
        let id = accItems[2];
        this.openAcc(id);
    }


    showMore(e) {
        let path = e.composedPath() || e.path;
        let ids = path
            .filter(it => it.getAttribute && it.getAttribute('elementid'))
            .map(it => it.getAttribute('elementid'));

        if (ids.length <= 0) {
            return;
        }
        let id = ids[0];
        this.openAcc(id);
    }

    openAcc(id) {
        let accItems = ['user-elements', 'interactive-elements', 'icons'];
        accItems.filter(it => it !== id).forEach(it => {
            this.$[it].classList.remove("acc-show");
            this.$[it].classList.add("acc-hide");
            this.$[it + '-less'].classList.add("acc-hide");
            this.$[it + '-less'].classList.remove("acc-show");
            this.$[it + '-more'].classList.remove("acc-hide");
            this.$[it + '-more'].classList.add("acc-show");
        });
        this.$[id].classList.remove("acc-hide");
        this.$[id].classList.add("acc-show");
        this.$[id + '-more'].classList.add("acc-hide");
        this.$[id + '-more'].classList.remove("acc-show");
        this.$[id + '-less'].classList.remove("acc-hide");
        this.$[id + '-less'].classList.add("acc-show");
    }
}

customElements.define(ChIconsAcc.is, ChIconsAcc);