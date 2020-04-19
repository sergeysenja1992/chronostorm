package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.AttachEvent
import com.vaadin.flow.component.HasSize
import com.vaadin.flow.component.HasStyle
import com.vaadin.flow.component.Tag
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.polymertemplate.PolymerTemplate

@Tag("ch-map")
@JsModule("./src/ch-map.js")
@NpmPackage.Container(
    NpmPackage("@polymer/paper-card", version = "3.0.1"),
    NpmPackage("@polymer/iron-collapse", version = "3.0.1"),
    NpmPackage("pinch-zoom-js", version = "2.3.4")
)
class ChMap: PolymerTemplate<IconsModel>(), HasStyle, HasSize {

    override fun onAttach(attachEvent: AttachEvent?) {
        super.onAttach(attachEvent)
        setSizeFull()
    }

}

