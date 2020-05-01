package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.Tag
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.dependency.JavaScript
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.icon.VaadinIcon
import com.vaadin.flow.component.polymertemplate.PolymerTemplate
import com.vaadin.flow.templatemodel.TemplateModel
import nc.unc.vaadin.flow.polymer.iron.icons.*
import ua.pp.ssenko.chronostorm.domain.IconObject
import ua.pp.ssenko.chronostorm.domain.MapObject
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.util.*
import java.util.concurrent.Executor
import java.util.concurrent.Executors
import kotlin.collections.ArrayList
import kotlin.concurrent.thread

@Tag("ch-icons-panel")
@JsModule("./src/ch-icons-panel.js")
@JavaScript.Container(
        JavaScript("./js/touch.js")
)
@NpmPackage.Container(
        NpmPackage("@polymer/paper-card", version = "3.0.1"),
        NpmPackage("@polymer/iron-collapse", version = "3.0.1")
)
@StyleSheet("../css/maps.css")
class IconsPanel(val icons: List<IconObject>): PolymerTemplate<IconsModel>() {

    val executor = Executors.newSingleThreadExecutor()

    init {
        model.setIconsJson(objectMapper().writeValueAsString(icons))
    }

    fun setSearch(searchInput: String) {
        model.setSearchInput(searchInput)
        val ui = UI.getCurrent()
        executor.submit {
            ui.access {
                getElement().callJsFunction("refresh");
            }
        }
    }
}

interface IconsModel : TemplateModel {
    fun setIconsJson(iconsJson: String)
    fun setSearchInput(searchInput: String)
}
