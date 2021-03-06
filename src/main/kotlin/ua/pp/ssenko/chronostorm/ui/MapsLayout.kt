package ua.pp.ssenko.chronostorm.ui

import com.vaadin.flow.component.Component
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.page.Push
import com.vaadin.flow.component.textfield.TextField
import com.vaadin.flow.data.value.ValueChangeMode
import kotlin.concurrent.thread

@Push
class MapsLayout : MainLayout() {

    override fun content(): Component = TextField().apply {
        setWidthFull()
        placeholder = "Поиск"

        valueChangeMode = ValueChangeMode.EAGER
        addValueChangeListener {
            val activeView = view
            if (activeView is MapsList) {
                activeView.searchInput = it.value
                val current = UI.getCurrent()
                thread {
                    current.access {
                        activeView.updateCards()
                    }
                }
            }
        }
    }

}