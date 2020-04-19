package ua.pp.ssenko.chronostorm.domain

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.vaadin.flow.component.UI
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

class LocationMap(val id: String, val name: String, val order: Long = 0) {

    private val executor = Executors.newSingleThreadExecutor()

    val size: Size = Size(2048, 2048, 1.0)
    val customIcons: MutableList<CustomIcon> = ArrayList()
    val mapObjects: MutableList<MapObject> = ArrayList()

    @JsonIgnore
    val subscribers: MutableMap<String, (String) -> Unit> = ConcurrentHashMap()

    fun toMetainfo() = LocationMapMetainfo(id, name, order)

    fun updateElement(updateEvent: String) {
        val pushId = UI.getCurrent().session.pushId
        executor.submit {
            subscribers.forEach {key, value ->
                if (key != pushId) {
                    value.invoke(updateEvent)
                }
            }
        }
    }

    fun getIdentityHashCode() = System.identityHashCode(this)

}

data class UpdateEvent(
        val elementId: String,
        val type: String,
        val context: Map<String, Any>
)

data class LocationMapMetainfo(
        val id: String,
        val name: String,
        val order: Long,
        val previewImage: String? = null
): StoredEntity {
    override val key: String get() = id
}

class CustomIcon {
    val defaultSize = Size()
    var previewUrl: String = ""
    var originUrl: String = ""
    var name: String = ""
    var zIndex: Int = 0  // start from 10_000 and increment by 100
}

class Position(var top: Int, var left: Int)

class Size(var width: Int = 0, var height: Int = 0, var scale: Double = 1.0)

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes(value = [
    JsonSubTypes.Type(value = IconObject::class, name = "icon")
])
abstract class MapObject(val id: Int) {
    val size: Size = Size()
    val position: Position = Position(0, 0)
}

class IconObject(id: Int, val iconName: String, val iconSet: String): MapObject(id)