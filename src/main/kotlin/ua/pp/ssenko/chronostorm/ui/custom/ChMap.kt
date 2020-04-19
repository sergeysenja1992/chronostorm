package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.*
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.polymertemplate.PolymerTemplate
import com.vaadin.flow.templatemodel.TemplateModel
import ua.pp.ssenko.chronostorm.domain.LocationMap
import ua.pp.ssenko.chronostorm.utils.logger

@Tag("ch-map")
@JsModule("./src/ch-map.js")
@NpmPackage.Container(
    NpmPackage("@polymer/paper-card", version = "3.0.1"),
    NpmPackage("@polymer/iron-collapse", version = "3.0.1"),
    NpmPackage("pinch-zoom-js", version = "2.3.4")
)
class ChMap(val locationMap: LocationMap): PolymerTemplate<ChMapModel>(), HasStyle, HasSize {

    override fun onAttach(attachEvent: AttachEvent?) {
        super.onAttach(attachEvent)
        val value = UI.getCurrent()
        val element = element;
        locationMap.subscribers.put(UI.getCurrent().session.pushId) {
            value.access {
                logger.info(">>> ${it}")
                element.callJsFunction("updateElement", it)
            }
        }
        setSizeFull()
    }

    override fun onDetach(detachEvent: DetachEvent?) {
        super.onDetach(detachEvent)
        locationMap.subscribers.remove(UI.getCurrent().session.pushId)
    }

    @ClientCallable
    fun updateElement(event: String) {
        logger.info(">> ${event}")
        locationMap.updateElement(event)
    }

}

interface ChMapModel : TemplateModel {
    fun setName(name: String)
    fun getName(name: String)

}

