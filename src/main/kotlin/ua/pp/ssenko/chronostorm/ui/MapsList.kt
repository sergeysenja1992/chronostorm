package ua.pp.ssenko.chronostorm.ui

import com.github.appreciated.card.Card
import com.github.appreciated.card.RippleClickableCard
import com.github.appreciated.css.grid.GridLayoutComponent
import com.github.appreciated.css.grid.sizes.Flex
import com.github.appreciated.css.grid.sizes.Length
import com.github.appreciated.css.grid.sizes.MinMax
import com.github.appreciated.css.grid.sizes.Repeat.RepeatMode
import com.github.appreciated.layout.FlexibleGridLayout
import com.github.mvysny.karibudsl.v10.*
import com.vaadin.flow.component.Component
import com.vaadin.flow.component.HasComponents
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.orderedlayout.FlexComponent
import com.vaadin.flow.router.Route
import com.vaadin.flow.spring.annotation.UIScope
import org.springframework.stereotype.Service
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.repository.MapsRepository
import javax.annotation.PostConstruct


@Route("maps", layout = MainLayout::class)
@UIScope
@Service
@StyleSheet("../css/maps.css")
class MapsList(
        db: ChronostormRepository,
        val maps: MapsRepository
): AbstractView(db) {

    init {

    }

    @PostConstruct
    fun content() {
        val user = getCurrentUser()
        user ?: return

        val cards = ArrayList<Component>()
        repeat(1){
            cards.add(card())
        }

        cards.add(createMapButton())

        horizontalLayout {
                    val layout = FlexibleGridLayout()
                            .withColumns(RepeatMode.AUTO_FILL, MinMax(Length("250px"), Flex(1.0)))
                            .withAutoRows(Length("250px"))
                            .withItems(
                                    *cards.toList().toTypedArray()
                            )
                            .withPadding(true)
                            .withSpacing(true)
                            .withAutoFlow(GridLayoutComponent.AutoFlow.ROW_DENSE)
                            .withOverflow(GridLayoutComponent.Overflow.AUTO)
                    layout.setSizeFull()
                    setSizeFull()
                    add(layout)
        }

    }

    private fun createMapButton() = RippleClickableCard().apply {
        verticalLayout {
            val label = label("+") {
                className = "plus-button"
            }
            setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, label);
            setJustifyContentMode(FlexComponent.JustifyContentMode.CENTER);
            addClassName("add-map-button")
            alignItems = FlexComponent.Alignment.CENTER
            setSizeFull()
        }
        addClickListener {

        }
    }

    fun HasComponents.card(): Card {
        val card = Card()
        card.add(verticalLayout {
            label {
                text = "Добро пожаловать на огонёк"
            }
            val img = image(src = "img/logo.jpg") {
                width = "128px"
            }
            setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, img);
            setJustifyContentMode(FlexComponent.JustifyContentMode.CENTER);
        })
        return card
    }

}

