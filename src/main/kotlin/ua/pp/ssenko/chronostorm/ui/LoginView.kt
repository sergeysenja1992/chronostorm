package ua.pp.ssenko.chronostorm.ui

import com.github.appreciated.card.Card
import com.github.mvysny.karibudsl.v10.image
import com.github.mvysny.karibudsl.v10.label
import com.github.mvysny.karibudsl.v10.text
import com.github.mvysny.karibudsl.v10.verticalLayout
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.html.Label
import com.vaadin.flow.component.orderedlayout.FlexComponent
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.router.Route
import com.vaadin.flow.server.PWA
import com.vaadin.flow.spring.annotation.UIScope
import com.vaadin.flow.theme.Theme
import com.vaadin.flow.theme.lumo.Lumo
import org.springframework.stereotype.Component
import ua.pp.ssenko.chronostorm.ui.custom.GoogleSingIn

@Route("login")
@UIScope
@Component
@Theme(Lumo::class)
class LoginView(val googleSignin: GoogleSingIn): VerticalLayout() {

    init {
        val card = Card()
        card.add(verticalLayout {
            label {
                text = "Добро пожаловать на огонёк"
            }
            val img = image(src = "img/logo.jpg") {
                width = "128px"
            }
            add(googleSignin)
            setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, img);
            setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, googleSignin);
            setJustifyContentMode(FlexComponent.JustifyContentMode.CENTER);
        })
        add(card)
        setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, card);
        setJustifyContentMode(FlexComponent.JustifyContentMode.CENTER);
        setSizeFull()
    }

}