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
        val rgbList = listOf<Rgb>(
                rgb(229, 57, 53),
                rgb(216, 27, 96),
                rgb(142, 36, 170),
                rgb(94, 53, 177),
                rgb(57, 73, 171),
                rgb(30, 136, 229),
                rgb(3, 155, 229),
                rgb(0, 172, 193),
                rgb(0, 137, 123),
                rgb(67, 160, 71),
                rgb(124, 179, 66),
                rgb(192, 202, 51),
                rgb(253, 216, 53),
                rgb(255, 179, 0),
                rgb(251, 140, 0),
                rgb(244, 81, 30),
                rgb(109, 76, 65),
                rgb(117, 117, 117),
                rgb(183, 28, 28),
                rgb(136, 14, 79),
                rgb(74, 20, 140),
                rgb(27, 94, 32),
                rgb(245, 127, 23),
                rgb(191, 54, 12)
        )
        val (r,g,b) = rgbList.get(Math.abs(hashCode % (rgbList.size - 1)))
        model.setR(r)
        model.setG(g)
        model.setB(b)
        val user: User = UI.getCurrent().session.getAttribute()
        model.setUserName(user.username)
        model.setIsOwner(user.username == locationMap.owner)
    }

    fun rgb(r: Int, g:Int, b: Int) = Rgb(r, g, b)

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


