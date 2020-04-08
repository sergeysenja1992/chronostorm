package ua.pp.ssenko.chronostorm.ui

import com.github.mvysny.karibudsl.v10.*
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.grid.Grid
import com.vaadin.flow.component.html.Label
import com.vaadin.flow.component.orderedlayout.FlexComponent.JustifyContentMode.CENTER
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.component.textfield.TextField
import com.vaadin.flow.router.Route
import com.vaadin.flow.spring.annotation.UIScope
import com.vaadin.flow.theme.Theme
import com.vaadin.flow.theme.lumo.Lumo
import org.springframework.stereotype.Component
import ua.pp.ssenko.chronostorm.domain.CombinedCharacteristic
import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import javax.annotation.PostConstruct
import kotlin.reflect.KMutableProperty0


@Route("skills", layout = MainLayout::class)
@UIScope
@Component
@StyleSheet("../css/style.css")
class SkillsView(db: ChronostormRepository): AbstractView(db) {

    init {

    }

    override fun VerticalLayout.content() {
        val user = getCurrentUser()
        user ?: return

    }

}

