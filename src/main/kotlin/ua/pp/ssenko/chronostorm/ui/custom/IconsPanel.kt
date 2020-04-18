package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.Tag
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.icon.VaadinIcon
import com.vaadin.flow.component.polymertemplate.PolymerTemplate
import com.vaadin.flow.templatemodel.TemplateModel
import nc.unc.vaadin.flow.polymer.iron.icons.*
import java.util.*
import java.util.concurrent.Executor
import java.util.concurrent.Executors
import kotlin.collections.ArrayList
import kotlin.concurrent.thread

@Tag("ch-icons-panel")
@JsModule("./src/ch-icons-panel.js")
@NpmPackage.Container(
    NpmPackage("@polymer/paper-card", version = "3.0.1"),
    NpmPackage("@polymer/iron-collapse", version = "3.0.1")
)
@StyleSheet("../css/maps.css")
class IconsPanel: PolymerTemplate<IconsModel>() {

    val icons = fullIconsSet()
    val executor = Executors.newSingleThreadExecutor()

    init {
        model.setIcons(icons)
    }

    private fun fullIconsSet(): ArrayList<IconWrapper> {
        var icons = ArrayList<IconWrapper>()
        icons.addAll(IronIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronAvIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronCommunicationIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronDeviceIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronEditorIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronHardwareIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronImageIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronMapsIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronNotificationIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronPlacesIcons.values().asList().map { it.toIcon() })
        icons.addAll(IronSocialIcons.values().asList().map { it.toIcon() })
        icons.addAll(VaadinIcon.values().asList().map { it.toIcon() })
        icons.sortBy { it.name }
        return icons
    }

    fun VaadinIcon.toIcon() = IconWrapper("vaadin", name.toLowerCase(Locale.ENGLISH).replace('_', '-'))

    fun IronIconDefinition.toIcon() = IconWrapper(collection(), icon())

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
    fun setIcons(icons: List<IconWrapper>)
    fun setSearchInput(searchInput: String)
}

abstract class ImageWrapper(val name: String) {
    abstract val type: String
}

class IconWrapper(val collection: String, val icon: String): ImageWrapper(icon) {
    override val type = "Icon"
}