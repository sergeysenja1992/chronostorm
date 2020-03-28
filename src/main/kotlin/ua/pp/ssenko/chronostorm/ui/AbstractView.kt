package ua.pp.ssenko.chronostorm.ui

import com.vaadin.flow.component.UI
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.router.BeforeEnterEvent
import com.vaadin.flow.router.BeforeEnterObserver
import ua.pp.ssenko.chronostorm.ui.user.UserSession
import ua.pp.ssenko.chronostorm.utils.logger

abstract class AbstractView: VerticalLayout(), BeforeEnterObserver {
    override fun beforeEnter(p0: BeforeEnterEvent?) {
        logger.info("Before enter")
        val userSession = getUserSession()
        if (userSession == null) {
            val ui = UI.getCurrent()
            ui.access {
                ui.navigate("login");
            }
        }
    }

    fun getUserSession() = UI.getCurrent().session.getAttribute(UserSession::class.java)
}