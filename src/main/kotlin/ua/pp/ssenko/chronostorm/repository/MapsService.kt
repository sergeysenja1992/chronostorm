package ua.pp.ssenko.chronostorm.repository

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.stereotype.Component
import ua.pp.ssenko.chronostorm.domain.LocationMap
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.io.File
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeFormatter.ISO_LOCAL_TIME
import java.util.*
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
    private val activateMaps: Cache<String, LocationMap> = CacheBuilder.newBuilder().weakValues().build()

    fun getMap(key: String): LocationMap = activateMaps.get(key){loadMap(key)}

    private fun loadMap(key: String?): LocationMap {

        return LocationMap("1", "")
    }

    fun createMap() {
        val locationMap = LocationMap(UUID.randomUUID().toString(),
                "Карта от ${LocalDate.now()} ${LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"))}",
                System.currentTimeMillis())
        initMapDir(locationMap)
        locationMap.save()
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

    private fun LocationMap.save() {
        executor.submit {
            val metadata = File(toMetadataPath())
            objectMapper().writeValue(metadata, this)
        }
    }

}







