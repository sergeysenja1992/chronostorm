package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.*
import com.vaadin.flow.component.dependency.JavaScript
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.notification.Notification
import com.vaadin.flow.component.notification.NotificationVariant
import com.vaadin.flow.component.page.Push
import com.vaadin.flow.component.polymertemplate.PolymerTemplate
import com.vaadin.flow.shared.ui.Transport
import com.vaadin.flow.templatemodel.TemplateModel
import ua.pp.ssenko.chronostorm.domain.LocationMap
import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.repository.MapsService
import ua.pp.ssenko.chronostorm.utils.getAttribute
import ua.pp.ssenko.chronostorm.utils.getUniqId
import ua.pp.ssenko.chronostorm.utils.objectMapper
import ua.pp.ssenko.chronostorm.utils.uniqId
import java.util.concurrent.ScheduledFuture

@Tag("ch-map")
@JsModule("./src/ch-map.js")
@JavaScript.Container(
        JavaScript("./js/icon-color.js"),
        JavaScript("./js/touch.js")
)
@NpmPackage.Container(
        NpmPackage("@polymer/paper-card", version = "3.0.1"),
        NpmPackage("@polymer/iron-collapse", version = "3.0.1")
)
class ChMap(val locationMap: LocationMap, val maps: MapsService): PolymerTemplate<ChMapModel>(), HasStyle, HasSize {

    @Volatile var checkConnection: ScheduledFuture<*>? = null

    init {
        model.setLocationMap(objectMapper().writeValueAsString(locationMap))
        val uniqId = UI.getCurrent().session.getUniqId()
        model.setUniqId(uniqId)
        val hashCode = uniqId.hashCode()
        val (r,g,b) = rgbList.get(Math.abs(hashCode % (rgbList.size - 1)))
        model.setR(r)
        model.setG(g)
        model.setB(b)
        val user: User = UI.getCurrent().session.getAttribute()
        model.setUserName(user.username)
        model.setIsOwner(user.username == locationMap.owner)
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
        checkConnection?.cancel(true);
    }

    @ClientCallable
    fun updateElement(type: String, event: String) {
        locationMap.updateElement(type, event)
        maps.save(locationMap)
    }

    @ClientCallable
    fun showNotification(type: String, text: String) {
        val notification = Notification(text)
        notification.setDuration(5000)
        notification.addThemeVariants(NotificationVariant.valueOf(type));
        notification.open()
    }

}

data class Rgb(val r: Int, val g:Int, val b: Int)

interface ChMapModel : TemplateModel {
    fun setName(name: String)
    fun getName(name: String)
    fun setUserName(userName: String)
    fun setIsOwner(isOwner: Boolean)
    fun setLocationMap(locationMap: String)
    fun setUniqId(uniqId: String)
    fun setR(r: Int)
    fun setG(g: Int)
    fun setB(b: Int)
}


