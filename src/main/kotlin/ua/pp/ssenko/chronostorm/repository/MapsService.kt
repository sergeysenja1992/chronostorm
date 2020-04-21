package ua.pp.ssenko.chronostorm.repository

import com.fasterxml.jackson.module.kotlin.readValue
import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import org.springframework.stereotype.Component
import ua.pp.ssenko.chronostorm.domain.LocationMap
import ua.pp.ssenko.chronostorm.utils.logger
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.io.File
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

@Component
class MapsService(
        val db: ChronostormRepository,
        val locationMapsDirectory: String
) {

    init {
        initMapsDir()
    }

    private val executor = Executors.newSingleThreadExecutor()
    private val activateMaps: MutableMap<String, LocationMap> = ConcurrentHashMap()
    private val filesCache: Cache<String, ByteArray> = CacheBuilder.newBuilder().softValues().build()

    fun getMap(key: String): LocationMap = activateMaps.computeIfAbsent(key){loadMap(key)}

    fun getFile(relativePath: String): ByteArray = filesCache.get(relativePath){loadFile(relativePath)}

    private fun loadFile(relativePath: String) = File("${locationMapsDirectory}/${relativePath}").readBytes()

    private fun loadMap(key: String): LocationMap {
        logger.info("Load map with key {}")
        val map = db.getMap(key)
        map ?: throw IllegalStateException("Map not found")
        val toMetadataPath = LocationMap(key).toMetadataPath()
        val locationMap = objectMapper().readValue<LocationMap>(File(toMetadataPath))
        locationMap.maps = this
        return locationMap
    }

    fun createMap() {
        val locationMap = LocationMap(UUID.randomUUID().toString(),
                "Карта от ${LocalDate.now()} ${LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"))}",
                System.currentTimeMillis())
        initMapDir(locationMap)
        locationMap.saveMap()
        db.saveMap(locationMap.toMetainfo())
    }

    private fun initMapsDir() {
        val mapDir = File(locationMapsDirectory)
        if (!mapDir.exists()) {
            mapDir.mkdir()
        }
    }

    private fun initMapDir(locationMap: LocationMap) {
        val file = File(locationMap.dirPath())
        if (!file.exists()) {
            file.mkdir()
        }
        val metadata = File(locationMap.toMetadataPath())
        if (!metadata.exists()) {
            metadata.createNewFile()
            metadata.writeText("{}")
        }
    }

    private fun LocationMap.toMetadataPath() = "${dirPath()}/metadata.json"

    private fun LocationMap.dirPath() = "${locationMapsDirectory}/${this.id}"

    private fun LocationMap.iconsFile() = "${locationMapsDirectory}/icons.json"

    private fun LocationMap.saveMap() {
        executor.submit {
            val metadata = File(toMetadataPath())
            objectMapper().writeValue(metadata, this)
            db.saveMap(this.toMetainfo())
        }
    }

    fun doAsync(task: () -> Unit) {
        executor.submit {
            task.invoke()
        }
    }

    fun save(map: LocationMap) {
        map.saveMap()
    }

}







