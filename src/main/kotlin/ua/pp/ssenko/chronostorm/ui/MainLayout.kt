package ua.pp.ssenko.chronostorm.ui

import com.github.mvysny.karibudsl.v10.alignSelf
import com.github.mvysny.karibudsl.v10.horizontalLayout
import com.github.mvysny.karibudsl.v10.icon
import com.github.mvysny.karibudsl.v10.label
import com.vaadin.flow.component.HasElement
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.applayout.AppLayout
import com.vaadin.flow.component.applayout.DrawerToggle
import com.vaadin.flow.component.icon.VaadinIcon
import com.vaadin.flow.component.orderedlayout.FlexComponent
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.component.page.Push
import com.vaadin.flow.router.RouterLink
import com.vaadin.flow.theme.Theme
import com.vaadin.flow.theme.lumo.Lumo

@Push
@Theme(Lumo::class, variant = Lumo.LIGHT)
open class MainLayout : AppLayout() {

    var view: HasElement? = null

    init {
        val drawerToggle = DrawerToggle()
        val home = RouterLink("", MainView::class.java).apply {
            horizontalLayout {
                icon(VaadinIcon.USER_CARD) {
                    alignSelf = FlexComponent.Alignment.CENTER
                }
                label("Лист персонажа")
                isSpacing = true
            }
        }
        val skills = RouterLink("", SkillsView::class.java).apply {
            horizontalLayout {
                icon(VaadinIcon.FILE_TEXT) {
                    alignSelf = FlexComponent.Alignment.CENTER
                }
                label("Список умений")
                isSpacing = true
            }
        }
        val mapView = RouterLink("", MapsList::class.java).apply {
            horizontalLayout {
                icon(VaadinIcon.MAP_MARKER) {
                    alignSelf = FlexComponent.Alignment.CENTER
                }
                label("Карты/Локации")
                isSpacing = true
            }
        }
        val menuLayout = VerticalLayout(mapView)
        addToDrawer(menuLayout)
        addToNavbar(drawerToggle)
    }


    override fun showRouterLayoutContent(hasElement: HasElement?) {
        super.showRouterLayoutContent(hasElement)
        this.view = hasElement
    }
}
