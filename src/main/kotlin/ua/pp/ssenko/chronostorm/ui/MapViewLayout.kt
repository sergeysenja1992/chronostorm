package ua.pp.ssenko.chronostorm.ui

import com.vaadin.flow.component.Component
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.page.Push
import com.vaadin.flow.component.textfield.TextField
import com.vaadin.flow.data.value.ValueChangeMode
import com.vaadin.flow.shared.ui.Transport
import kotlin.concurrent.thread

@Push(transport = Transport.WEBSOCKET)
class MapViewLayout : MainLayout() {

    override fun content(): Component = TextField().apply {
        setWidthFull()
        placeholder = "Имя карты"
        val activeView = view
        if (activeView is MapView) {
            activeView.mapName = this@apply
        }
    }

}