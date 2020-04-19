package ua.pp.ssenko.chronostorm.ui

import com.vaadin.flow.component.UI
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.router.BeforeEnterEvent
import com.vaadin.flow.router.BeforeEnterObserver
import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.utils.logger
import ua.pp.ssenko.chronostorm.utils.setAttribute

abstract class AbstractView(protected val db: ChronostormRepository): VerticalLayout(), BeforeEnterObserver {
    override fun beforeEnter(beforeEnterEvent: BeforeEnterEvent) {
        logger.info("Before enter")
        val userSession = getUserSession()
        if (userSession == null) {
            val ui = UI.getCurrent()
            ui.access {
                ui.session.setAttribute(beforeEnterEvent.location)
                ui.navigate("login");
            }
        }
        updateUi()
    }

    init {
        UI.getCurrent().session.setAttribute(User("sergeysenja1992@gmail.com", "Семъён"))
    }

    fun updateUi() {
        removeAll()
        content()
    }

    abstract fun VerticalLayout.content()

    fun getUserSession(): User? = UI.getCurrent().session.getAttribute(User::class.java)

    fun getCurrentUser() = db.getUser(getUserSession()?.key ?: "null")

    open fun mainLayoutUpdated(mainLayout: MainLayout) {}
}