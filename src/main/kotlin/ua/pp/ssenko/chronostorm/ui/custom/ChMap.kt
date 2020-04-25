package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.*
import com.vaadin.flow.component.dependency.JavaScript
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.polymertemplate.PolymerTemplate
import com.vaadin.flow.templatemodel.TemplateModel
import ua.pp.ssenko.chronostorm.domain.LocationMap
import ua.pp.ssenko.chronostorm.repository.MapsService
import ua.pp.ssenko.chronostorm.utils.getUniqId
import ua.pp.ssenko.chronostorm.utils.objectMapper
import ua.pp.ssenko.chronostorm.utils.uniqId

@Tag("ch-map")
@JsModule("./src/ch-map.js")
@JavaScript("./js/icon-color.js")
@NpmPackage.Container(
    NpmPackage("@polymer/paper-card", version = "3.0.1"),
    NpmPackage("@polymer/iron-collapse", version = "3.0.1"),
    NpmPackage("pinch-zoom-js", version = "2.3.4")
)
class ChMap(val locationMap: LocationMap, val maps: MapsService): PolymerTemplate<ChMapModel>(), HasStyle, HasSize {

    init {
        model.setLocationMap(objectMapper().writeValueAsString(locationMap))
        val uniqId = UI.getCurrent().session.getUniqId()
        model.setUniqId(uniqId)
        val hashCode = uniqId.hashCode()
        val r = hashCode % 255
        val g = (hashCode/1000) % 255
        val b = (hashCode/1000_000) % 255
        model.setR(r)
        model.setG(g)
        model.setB(b)
    }

    override fun onAttach(attachEvent: AttachEvent?) {
        super.onAttach(attachEvent)
        val ui = UI.getCurrent()
        val element = element;
        locationMap.subscribers.put(ui.session.getUniqId()) {
            ui.access {
                element.callJsFunction("updateElement", it)
            }
        }
        setSizeFull()
    }

    override fun onDetach(detachEvent: DetachEvent?) {
        super.onDetach(detachEvent)
        locationMap.subscribers.remove(UI.getCurrent().session.getUniqId())
    }

    @ClientCallable
    fun updateElement(type: String, event: String) {
        locationMap.updateElement(type, event)
        maps.save(locationMap)
    }

}

interface ChMapModel : TemplateModel {
    fun setName(name: String)
    fun getName(name: String)
    fun setLocationMap(locationMap: String)
    fun setUniqId(uniqId: String)
    fun setR(r: Int)
    fun setG(g: Int)
    fun setB(b: Int)
}


