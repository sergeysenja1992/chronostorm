import {PolymerElement,html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-card/paper-card.js'
import '@polymer/iron-icon/iron-icon.js';

class ChIconsAcc extends PolymerElement {

    static get template() {
        return html`
<style>

</style>

<div>
<div>Пользовательские елементы</div>
<div>

</div>
<div>Интерактивные елементы</div>
<div>

</div>
<div>Иконки</div>
<div>

</div>
</div>
`;
    }

    static get is() {
        return 'ch-icons-acc';
    }

    ready() {
        super.ready();
    }

}

customElements.define(ChIconsAcc.is, ChIconsAcc);