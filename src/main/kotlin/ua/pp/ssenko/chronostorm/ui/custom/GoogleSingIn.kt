package ua.pp.ssenko.chronostorm.ui.custom

import com.fasterxml.jackson.module.kotlin.readValue
import com.vaadin.flow.component.ClientCallable
import com.vaadin.flow.component.Tag
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.notification.Notification
import com.vaadin.flow.component.notification.NotificationVariant
import com.vaadin.flow.component.polymertemplate.PolymerTemplate
import com.vaadin.flow.spring.annotation.UIScope
import com.vaadin.flow.templatemodel.TemplateModel
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import ua.pp.ssenko.chronostorm.repository.DataBase
import ua.pp.ssenko.chronostorm.repository.User
import ua.pp.ssenko.chronostorm.ui.user.UserSession
import ua.pp.ssenko.chronostorm.utils.logger
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.net.URL

@Tag("google-sing-in")
@NpmPackage(value = "@google-web-components/google-signin", version = "3.0.1")
@JsModule("./src/google-sing-in.js")
@UIScope
@Component
class GoogleSingIn(
        @Value("\${spring.social.google.app-id}") val clientId:  String
) : PolymerTemplate<GoogleSingInModel>() {

    init {
        getModel().setClientId(clientId)
    }

    @ClientCallable
    fun authSuccess(token: String) {
        logger.info("authSuccess ${token}")
        val response = URL("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}").readText()
        val userResponse = objectMapper().readValue<UserResponse>(response);
        if (userResponse.verified_email) {
            val notification = Notification("С возвращением ${userResponse.name}.")
            notification.setDuration(5000)
            notification.addThemeVariants(NotificationVariant.LUMO_PRIMARY)
            notification.open()
            val user = User(userResponse.email, userResponse.name)
            UI.getCurrent().session.setAttribute(UserSession::class.java, UserSession(userResponse))
            UI.getCurrent().navigate("")
        } else {
            val notification = Notification("Ошибка авторизации")
            notification.setDuration(5000)
            notification.addThemeVariants(NotificationVariant.LUMO_ERROR)
            notification.open()
        }
    }

}

interface GoogleSingInModel : TemplateModel {
    fun setClientId(clientId: String)
}

data class UserResponse(
        val id: String,
        val email: String,
        val verified_email: Boolean,
        val name: String,
        val picture: String
)