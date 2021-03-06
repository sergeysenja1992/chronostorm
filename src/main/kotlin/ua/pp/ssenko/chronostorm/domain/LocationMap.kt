package ua.pp.ssenko.chronostorm.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.module.kotlin.readValue
import com.vaadin.flow.component.UI
import ua.pp.ssenko.chronostorm.repository.MapsService
import ua.pp.ssenko.chronostorm.utils.getUniqId
import ua.pp.ssenko.chronostorm.utils.objectMapper
import ua.pp.ssenko.chronostorm.utils.uniqId
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import kotlin.collections.HashMap

class LocationMap(val id: String, @Volatile var name: String = "", @Volatile var order: Long = 0, var owner: String? = null) {

    private val executor = Executors.newSingleThreadExecutor()

    val customIcons: MutableMap<String, CustomIcon> = HashMap()
    val mapObjects: MutableMap<String, MapObject> = HashMap()
    var previewImage: String? = null

    @JsonIgnore
    lateinit var maps: MapsService

    @JsonIgnore
    val subscribers: MutableMap<String, (String) -> Unit> = ConcurrentHashMap()

    fun toMetainfo() = LocationMapMetainfo(id, name, order, previewImage, owner)

    fun updateElement(type: String, updateEvent: String): String {
        if (type == "add") {
            val addEvent: AddEvent = objectMapper().readValue(updateEvent)
            addEvent.context.id = uniqId()
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
        } else if (type == "resize") {
            notifyAllExcludeMeSubscribers(updateEvent)
            maps.doAsync {
                val event: UpdateEvent = objectMapper().readValue(updateEvent)
                val mapObject = mapObjects.get(event.elementId)
                mapObject?.position?.left = event.context.get("left")?.toString() ?: "0px"
                mapObject?.position?.top = event.context.get("top")?.toString() ?: "0px"
                mapObject?.position?.rotate = event.context.get("rotate")?.toString()?.toDoubleOrNull() ?: 0.0
                mapObject?.size?.width = event.context.get("width")?.toString() ?: "0px"
                mapObject?.size?.height = event.context.get("height")?.toString() ?: "0px"
            }
        } else if (type == "delete") {
            val event: UpdateEvent = objectMapper().readValue(updateEvent)
            mapObjects.remove(event.elementId)
            notifyAllSubscribers(updateEvent)
        } else if (type == "checkServerConnection") {
            notifyOnlyMe(updateEvent)
        } else {
            notifyAllExcludeMeSubscribers(updateEvent)
        }
        return updateEvent
    }

    private fun notifyOnlyMe(updateEvent: String) {
        val id = UI.getCurrent().session.getUniqId()
        executor.submit {
            subscribers.forEach { key, value ->
                if (key == id) {
                    value.invoke(updateEvent)
                }
            }
        }
    }

    private fun notifyAllExcludeMeSubscribers(updateEvent: String) {
        val id = UI.getCurrent().session.getUniqId()
        executor.submit {
            subscribers.forEach { key, value ->
                if (key != id) {
                    value.invoke(updateEvent)
                }
            }
        }
    }

    private fun notifyAllSubscribers(updateEvent: String) {
        executor.submit {
            subscribers.forEach { _, value ->
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
        val previewImage: String? = null,
        var owner: String? = null
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

class Position(@Volatile var top: String, @Volatile var left: String, @Volatile var rotate: Double = 1.0)

class Size(var width: String = "0px", var height: String = "0px", var scale: Double = 1.0)

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes(value = [
    JsonSubTypes.Type(value = IconObject::class, name = "icon")
])
abstract class MapObject(var id: String = "", var name: String, var type: String) {
    val size: Size = Size()
    val position: Position = Position("0px", "0px")
    var zIndex: Int = 10_000  // start from 10_000 and increment by 100
    var order: Int = 0
}

class IconObject(id: String = "", val iconName: String, val iconSet: String): MapObject(id, iconName, "icon")