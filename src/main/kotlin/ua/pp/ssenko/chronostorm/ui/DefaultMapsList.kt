package ua.pp.ssenko.chronostorm.ui

import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.router.Route
import com.vaadin.flow.spring.annotation.UIScope
import org.springframework.stereotype.Service
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.repository.MapsService

@Route("", layout = MapsLayout::class)
@UIScope
@Service
@StyleSheet("../css/maps.css")
class DefaultMapsList(
        db: ChronostormRepository,
        maps: MapsService
): MapsList(db, maps)