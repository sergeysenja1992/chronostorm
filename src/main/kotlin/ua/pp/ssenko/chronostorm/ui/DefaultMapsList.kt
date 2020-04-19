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
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.repository.MapsService
import kotlin.concurrent.thread

@Route("", layout = MapsLayout::class)
@UIScope
@Service
@StyleSheet("../css/maps.css")
class DefaultMapsList(
        db: ChronostormRepository,
        maps: MapsService
): MapsList(db, maps)