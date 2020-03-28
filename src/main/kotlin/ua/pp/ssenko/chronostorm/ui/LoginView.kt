package ua.pp.ssenko.chronostorm.ui

import com.github.appreciated.card.Card
import com.github.mvysny.karibudsl.v10.image
import com.github.mvysny.karibudsl.v10.verticalLayout
import com.vaadin.flow.component.orderedlayout.FlexComponent
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.router.Route
import ua.pp.ssenko.chronostorm.ui.custom.GoogleSingIn

@Route("login")
class LoginView(val googleSignin: GoogleSingIn): VerticalLayout() {

    init {
        val card = Card()
        card.add(verticalLayout {
            image(src = "img/logo.jpg") {
                width = "128px"
            }
            add(googleSignin)
            setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, googleSignin);
            setJustifyContentMode(FlexComponent.JustifyContentMode.CENTER);
        })
        add(card)
        setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, card);
        setJustifyContentMode(FlexComponent.JustifyContentMode.CENTER);
        setSizeFull()
    }

}