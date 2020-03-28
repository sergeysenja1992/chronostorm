import {PolymerElement,html} from '@polymer/polymer/polymer-element.js';
import '@google-web-components/google-signin/google-signin.js'

class GoogleSingIn extends PolymerElement {

    static get template() {
        return html`
            <div>
                <google-signin client-id="{{clientId}}" width="wide"></google-signin>
            </div>`;
    }

    static get is() {
        return 'google-sing-in';
    }

    ready() {
        super.ready();
        let self = this;
        document.addEventListener("google-signin-success", function(event) {
            let token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true);
            self.$server.authSuccess(token.access_token);
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        })
    }

}

customElements.define(GoogleSingIn.is, GoogleSingIn);