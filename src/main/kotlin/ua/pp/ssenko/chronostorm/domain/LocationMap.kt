package ua.pp.ssenko.chronostorm.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.module.kotlin.readValue
import com.vaadin.flow.component.UI
import ua.pp.ssenko.chronostorm.repository.MapsService
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import kotlin.collections.HashMap

class LocationMap(val id: String, @Volatile var name: String = "", @Volatile var order: Long = 0) {

    private val executor = Executors.newSingleThreadExecutor()

    val customIcons: MutableMap<String, CustomIcon> = HashMap()
    val mapObjects: MutableMap<String, MapObject> = HashMap()

    @JsonIgnore
    lateinit var maps: MapsService

    @JsonIgnore
    val subscribers: MutableMap<String, (String) -> Unit> = ConcurrentHashMap()

    fun toMetainfo() = LocationMapMetainfo(id, name, order)

    fun updateElement(type: String, updateEvent: String): String {
        if (type == "add") {
            val addEvent: AddEvent = objectMapper().readValue(updateEvent)
            addEvent.context.id = "ID" + UUID.randomUUID().toString().replace("-", "")
            mapObjects.put(addEvent.context.id, addEvent.context)
            notifyAllSubscribers(objectMapper().writeValueAsString(addEvent))
        } else if (type == "move") {
            notifyAllExcludeMeSubscribers(updateEvent)
            maps.doAsync {
                val event: UpdateEvent = objectMapper().readValue(updateEvent)
                val mapObject = mapObjects.get(event.elementId)
                mapObject?.position?.left = event.context.get("left")?.toString() ?: "0px"
                mapObject?.position?.top = event.context.get("top")?.toString() ?: "0px"
            }
        } else {
            notifyAllExcludeMeSubscribers(updateEvent)
        }
        return updateEvent
    }

    private fun notifyAllExcludeMeSubscribers(updateEvent: String) {
        val pushId = UI.getCurrent().session.pushId
        executor.submit {
            subscribers.forEach { key, value ->
                if (key != pushId) {
                    value.invoke(updateEvent)
                }
            }
        }
    }

    private fun notifyAllSubscribers(updateEvent: String) {
        executor.submit {
            subscribers.forEach { key, value ->
                value.invoke(updateEvent)
            }
        }
    }

}

data class UpdateEvent(val elementId: String, val type: String, val context: Map<String, Any>)

data class AddEvent(val type: String, val context: MapObject)

data class LocationMapMetainfo(
        val id: String,
        val name: String,
        val order: Long,
        val previewImage: String? = null
): StoredEntity {
    override val key: String get() = id
}

class CustomIcon {
    val id = UUID.randomUUID().toString()
    val defaultSize = Size()
    var previewUrl: String = ""
    var originUrl: String = ""
    var name: String = ""
}

class Position(@Volatile var top: String, @Volatile var left: String)

class Size(var width: String = "0px", var height: String = "0px", var scale: Double = 1.0)

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes(value = [
    JsonSubTypes.Type(value = IconObject::class, name = "icon")
])
abstract class MapObject(var id: String = "", var name: String, var type: String) {
    val size: Size = Size()
    val position: Position = Position("0px", "0px")
    var zIndex: Int = 10_000  // start from 10_000 and increment by 100
}

class IconObject(id: String = "", val iconName: String, val iconSet: String): MapObject(id, iconName, "icon")