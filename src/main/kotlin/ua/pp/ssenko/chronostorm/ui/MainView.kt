package ua.pp.ssenko.chronostorm.ui

import com.vaadin.flow.component.html.H1
import com.vaadin.flow.component.html.Label
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.router.Route
import com.vaadin.flow.server.PWA

@Route("")
//@PWA(name = "Хроношторм", shortName = "Хроношторм")
class MainView: AbstractView() {



    init {
        val heading = H1("Vaadin + Spring examples")

        val greeting = Label("hello")
        val grretingStyle = greeting.element.style
        grretingStyle.set("display", "block")
        grretingStyle.set("margin-bottom", "10px")


        add(heading, greeting)
    }

}