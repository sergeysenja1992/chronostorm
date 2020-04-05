package ua.pp.ssenko.chronostorm.repository

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import org.springframework.stereotype.Component
import ua.pp.ssenko.chronostorm.domain.LocationMap
import ua.pp.ssenko.chronostorm.utils.logger
import java.util.concurrent.Executors

@Component
class MapsRepository {

    private val executor = Executors.newSingleThreadExecutor()
    private val activateMaps: Cache<String, LocationMap> = CacheBuilder.newBuilder().weakValues().build()

    fun getMap(key: String): LocationMap = activateMaps.get(key){loadMap(key)}

    fun loadMap(key: String?): LocationMap {

        return LocationMap("1")
    }
}







