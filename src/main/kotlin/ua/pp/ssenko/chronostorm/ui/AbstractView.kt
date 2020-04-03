package ua.pp.ssenko.chronostorm.ui

import com.vaadin.flow.component.UI
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.router.BeforeEnterEvent
import com.vaadin.flow.router.BeforeEnterObserver
import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.utils.logger

abstract class AbstractView(protected val db: ChronostormRepository): VerticalLayout(), BeforeEnterObserver {
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

    init {
        UI.getCurrent().session.setAttribute(User::class.java, User("sergeysenja1992@gmail.com", "Семъён"))
    }

    fun getUserSession(): User? = UI.getCurrent().session.getAttribute(User::class.java)

    fun getCurrentUser() = db.getUser(getUserSession()?.key ?: "null")
}