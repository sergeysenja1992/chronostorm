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
import com.vaadin.flow.router.Location
import com.vaadin.flow.server.VaadinSession
import com.vaadin.flow.spring.annotation.UIScope
import com.vaadin.flow.templatemodel.TemplateModel
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.utils.getAttribute
import ua.pp.ssenko.chronostorm.utils.logger
import ua.pp.ssenko.chronostorm.utils.objectMapper
import ua.pp.ssenko.chronostorm.utils.setAttribute
import java.net.URL

@Tag("google-sing-in")
@NpmPackage(value = "@google-web-components/google-signin", version = "3.0.1")
@JsModule("./src/google-sing-in.js")
@UIScope
@Component
class GoogleSingIn(
        @Value("\${spring.social.google.app-id}") val clientId:  String,
        val repository : ChronostormRepository
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
            val user = User(userResponse.email, userResponse.name)
            repository.saveUserIfAbsent(user)
            val saveUser = repository.findByUsername(userResponse.email)
            val notification = Notification("С возвращением ${saveUser?.name}.")
            notification.setDuration(5000)
            notification.addThemeVariants(NotificationVariant.LUMO_PRIMARY)
            notification.open()
            UI.getCurrent().session.setAttribute(saveUser)
            val location: Location? = UI.getCurrent().session.getAttribute()
            if (location != null) {
                UI.getCurrent().navigate(location.path)
            } else {
                UI.getCurrent().navigate("maps")
            }
            VaadinSession.getCurrent().getSession().setMaxInactiveInterval(3600 * 5);
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