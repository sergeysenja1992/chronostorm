import {html} from
        '@polymer/polymer/lib/utils/html-tag.js';
import {TextFieldElement} from
        '@vaadin/vaadin-text-field/src/vaadin-text-field.js';

class VaadinTelInput extends TextFieldElement {

    static get template() {
        return html`
    <style include="vaadin-text-field-shared-styles">
      /* polymer-cli linter breaks with empty line */
    </style>

    <div class="vaadin-text-field-container">

      <label part="label" on-click="focus" id="[[_labelId]]">[[label]]</label>

      <div part="input-field" id="[[_inputId]]">

        <slot name="prefix"></slot>

        <slot name="input">
          <input part="value" type="tel">
        </slot>

        <div part="clear-button" id="clearButton" role="button" aria-label\$="[[i18n.clear]]"></div>
        <slot name="suffix"></slot>

      </div>

      <div part="error-message" id="[[_errorId]]" aria-live="assertive" aria-hidden\$="[[_getErrorMessageAriaHidden(invalid, errorMessage, _errorId)]]">[[errorMessage]]</div>

    </div>
`;
    }

    static get is() {
        return 'vaadin-tel-input';
    }

    ready() {
        super.ready();
    }

}

customElements.define(VaadinTelInput.is, VaadinTelInput);