package ua.pp.ssenko.chronostorm.ui

import com.github.appreciated.card.RippleClickableCard
import com.github.appreciated.card.action.ActionButton
import com.github.appreciated.css.grid.GridLayoutComponent
import com.github.appreciated.css.grid.sizes.Flex
import com.github.appreciated.css.grid.sizes.Length
import com.github.appreciated.css.grid.sizes.MinMax
import com.github.appreciated.css.grid.sizes.Repeat.RepeatMode
import com.github.appreciated.layout.FlexibleGridLayout
import com.github.mvysny.karibudsl.v10.*
import com.vaadin.flow.component.Component
import com.vaadin.flow.component.Key
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.dialog.Dialog
import com.vaadin.flow.component.icon.Icon
import com.vaadin.flow.component.icon.VaadinIcon
import com.vaadin.flow.component.orderedlayout.FlexComponent
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.router.Route
import com.vaadin.flow.spring.annotation.UIScope
import org.springframework.stereotype.Service
import ua.pp.ssenko.chronostorm.domain.LocationMapMetainfo
import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.repository.MapsService
import ua.pp.ssenko.chronostorm.utils.getAttribute
import kotlin.concurrent.thread

@Route("maps", layout = MapsLayout::class)
@UIScope
@Service
@StyleSheet("../css/maps.css")
class MapsList(
        db: ChronostormRepository,
        val maps: MapsService
): AbstractView(db) {

    val CARD_SIZE = "300px"

    var searchInput: String? = null
    var cards: List<MapCard> = emptyList()

    init {

    }

    override fun VerticalLayout.content() {
        val user = getCurrentUser()
        user ?: return

        val cards = ArrayList<Component>()
        val mapCards = db.getMaps().map { it.card() }
        this@MapsList.cards = ArrayList(mapCards)
        cards.addAll(mapCards)
        cards.add(createMapButton())
        horizontalLayout {
                    val layout = FlexibleGridLayout()
                            .withColumns(RepeatMode.AUTO_FILL, MinMax(Length(CARD_SIZE), Flex(1.0)))
                            .withAutoRows(Length(CARD_SIZE))
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
        width = CARD_SIZE
        height = CARD_SIZE
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
            val user: User = UI.getCurrent().session.getAttribute()
            maps.createMap(user.username)
            updateUi()
        }
    }

    fun LocationMapMetainfo.card(): MapCard {
        val map = this
        val card = MapCard(map)
        val actionButton: Component = ActionButton(Icon(VaadinIcon.TRASH)) {
            card.showConfirmDeleteDialog(map)
        }.apply {
            className = "remove-map-button"
        }
        card.addClickListener {
            UI.getCurrent().navigate("map/${map.id}")
        }
        card.width = CARD_SIZE
        card.height = CARD_SIZE
        val user: User = UI.getCurrent().session.getAttribute()
        if (user.username == this.owner || this.owner == null) {
            card.add(actionButton)
        }
        card.add(verticalLayout {
            label {
                text = map.name
                className = "card-title"
                tooltip = map.name
            }
            if (map.previewImage != null) {
                val img = image(src = map.previewImage) {
                    className = "map-preview"
                }
                setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, img);
                setJustifyContentMode(FlexComponent.JustifyContentMode.CENTER);
            } else {
                val img = image(src = "img/logo.jpg") {
                    className = "map-preview"
                }
                setHorizontalComponentAlignment(FlexComponent.Alignment.CENTER, img);
                setJustifyContentMode(FlexComponent.JustifyContentMode.CENTER);
            }
        })
        return card
    }

    private fun MapCard.showConfirmDeleteDialog(map: LocationMapMetainfo) {
        val dialog = Dialog().apply {
            val dialog = this
            verticalLayout {
                label(""" Вы действительно хотите удалить ${map.name}? """)
                horizontalLayout {
                    button {
                        text = "Да"
                        addClickListener {
                            db.removeLocationMap(map)
                            dialog.close()
                            this@showConfirmDeleteDialog.isVisible = false
                        }
                        addClickShortcut(Key.ENTER)
                    }
                    button {
                        text = "Нет"
                        addClickListener {
                            dialog.close()
                        }
                    }
                    setWidthFull()
                    justifyContentMode = FlexComponent.JustifyContentMode.END
                }
            }

        }
        this@MapsList.add(dialog)
        dialog.open()
    }

    fun updateCards() {
        val searchInput = searchInput
        cards.forEach {
            it.isVisible = searchInput.isNullOrBlank() || it.map.name.contains(searchInput, true)
        }
    }

}

class MapCard(val map: LocationMapMetainfo): RippleClickableCard()

