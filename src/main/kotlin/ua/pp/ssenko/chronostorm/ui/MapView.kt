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
import com.vaadin.flow.component.applayout.DrawerToggle
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.icon.Icon
import com.vaadin.flow.component.icon.VaadinIcon
import com.vaadin.flow.component.orderedlayout.FlexComponent
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.router.BeforeEvent
import com.vaadin.flow.router.HasUrlParameter
import com.vaadin.flow.router.OptionalParameter
import com.vaadin.flow.router.Route
import com.vaadin.flow.spring.annotation.UIScope
import org.springframework.stereotype.Service
import ua.pp.ssenko.chronostorm.domain.LocationMapMetainfo
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.repository.MapsService
import java.time.LocalTime
import javax.annotation.PostConstruct
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

        label(">> id:$mapId time${LocalTime.now()}")
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

