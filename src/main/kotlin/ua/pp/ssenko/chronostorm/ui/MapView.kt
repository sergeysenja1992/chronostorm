package ua.pp.ssenko.chronostorm.ui

import com.github.mvysny.karibudsl.v10.button
import com.github.mvysny.karibudsl.v10.horizontalLayout
import com.github.mvysny.karibudsl.v10.textField
import com.github.mvysny.karibudsl.v10.verticalLayout
import com.vaadin.flow.component.HasComponents
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.icon.Icon
import com.vaadin.flow.component.icon.VaadinIcon.*
import com.vaadin.flow.component.orderedlayout.FlexComponent.Alignment.CENTER
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.component.textfield.TextField
import com.vaadin.flow.data.value.ValueChangeMode.EAGER
import com.vaadin.flow.router.BeforeEvent
import com.vaadin.flow.router.HasUrlParameter
import com.vaadin.flow.router.OptionalParameter
import com.vaadin.flow.router.Route
import com.vaadin.flow.spring.annotation.UIScope
import org.springframework.stereotype.Service
import ua.pp.ssenko.chronostorm.domain.LocationMap
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.repository.MapsService
import ua.pp.ssenko.chronostorm.ui.custom.ChMap
import ua.pp.ssenko.chronostorm.ui.custom.IconsAcc
import ua.pp.ssenko.chronostorm.utils.hideSpacing
import kotlin.concurrent.thread


@Route("map", layout = MainLayout::class)
@UIScope
@Service
@StyleSheet("../css/maps.css")
class MapView(
        db: ChronostormRepository,
        val maps: MapsService
): AbstractView(db), HasUrlParameter<String> {

    var mapId: String? = null
    var iconHidden = false

    override fun setParameter(event: BeforeEvent?, @OptionalParameter id: String?) {
        mapId = id
    }

    override fun VerticalLayout.content() {
        val user = getCurrentUser()
        user ?: return
        val mapId = mapId
        if (mapId.isNullOrBlank()) {
            navigateToMapsList()
            return
        }
        val map = maps.getMap(mapId)
        setSizeFull()
        hideSpacing()
        verticalLayout {
            setSizeFull()
            hideSpacing()
            horizontalLayout {
                setSizeFull()
                hideSpacing()
                alignItems = CENTER
                verticalLayout {
                    width = "300px"
                    height = "100%"
                    className = "icons-panel"
                    hideSpacing()
                    renderIcons(map)
                }
                verticalLayout {
                    hideSpacing()
                    setSizeFull()
                    renderMap(map);
                }
            }
        }
    }

    private val ICON_ITEM_SIZE = 70

    fun VerticalLayout.renderIcons(map: LocationMap) {
        lateinit var searchField: TextField
        horizontalLayout {
            isSpacing = true
            isMargin = false
            isPadding = true
            setWidthFull()
            searchField = textField {
                placeholder = "Поиск"
                isClearButtonVisible = true
            }
            button(icon = Icon(PLUS)) {

            }
            button(icon = Icon(ARROW_LEFT)) {
                className = "hide-icons-button"
                addClickListener {
                    this@MapView.iconHidden = !this@MapView.iconHidden
                    val isHidden = this@MapView.iconHidden
                    this.icon = Icon(if (isHidden) ARROW_RIGHT else ARROW_LEFT)
                    if (isHidden) {
                        this@renderIcons.addClassName("hidden-icons-panel")
                    } else {
                        this@renderIcons.removeClassName("hidden-icons-panel")
                    }
                }
            }
        }

        val iconsAcc = IconsAcc()
        verticalLayout {
            setSizeFull()
            className = "ch-icon-panel"
            hideSpacing()
            add(iconsAcc)
        }

        searchField.apply {
            valueChangeMode = EAGER
            val listener = addValueChangeListener { event ->
                iconsAcc.setSearch(event.value)
            }
        }
    }

    fun HasComponents.renderMap(map: LocationMap) {
        val chMap = ChMap()
        add(chMap)
    }

    private fun navigateToMapsList() {
        val current = UI.getCurrent()
        thread {
            current.access {
                current.navigate("maps")
            }
        }
    }


}



