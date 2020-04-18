package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.AttachEvent
import com.vaadin.flow.component.HasSize
import com.vaadin.flow.component.HasStyle
import com.vaadin.flow.component.Tag
import com.vaadin.flow.component.dependency.HtmlImport
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.html.Div
import com.vaadin.flow.component.polymertemplate.Id
import com.vaadin.flow.component.polymertemplate.PolymerTemplate

@Tag("ch-icons-acc")
@JsModule("./src/ch-icons-acc.js")
@NpmPackage.Container(
    NpmPackage("@polymer/paper-card", version = "3.0.1"),
    NpmPackage("@polymer/iron-collapse", version = "3.0.1")
)
@StyleSheet("../css/maps.css")
class IconsAcc: PolymerTemplate<IconsModel>(), HasStyle {

    @Id("icons")
    lateinit var icons: Div;

    val iconsPanel = IconsPanel()

    override fun onAttach(attachEvent: AttachEvent?) {
        super.onAttach(attachEvent)
        icons.add(iconsPanel)
        className = "full-size"
    }

    fun setSearch(searchInput: String) {
        iconsPanel.setSearch(searchInput)
    }
}

