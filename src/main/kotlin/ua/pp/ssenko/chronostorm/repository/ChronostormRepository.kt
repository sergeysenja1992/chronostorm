package ua.pp.ssenko.chronostorm.repository

import ua.pp.ssenko.chronostorm.domain.Attributes
import ua.pp.ssenko.chronostorm.domain.LocationMapMetainfo
import ua.pp.ssenko.chronostorm.domain.PersonalCharacteristic
import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.io.File
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

class ChronostormRepository(
        private val db: DataBase,
        private val dbFile: File
) {

    private val executor = Executors.newSingleThreadExecutor()

    fun saveUser(user: User) {
        db.users.put(user.key, user)
        save()
    }

    fun saveUserIfAbsent(user: User) {
        db.users.putIfAbsent(user.key, user)
        save()
    }

    fun saveMap(map: LocationMapMetainfo) {
        db.maps.putIfAbsent(map.key, map)
        save()
    }

    fun getMaps() = db.maps.values.sortedBy { it.order };

    fun getUser(key: String) = db.users.get(key)

    fun save() {
        executor.submit{
            objectMapper().writeValue(dbFile, db)
        }
    }

    fun findByUsername(username: String) = db.users.get(username)
    fun removeLocationMap(map: LocationMapMetainfo) {
        db.maps.remove(map.key)
        save()
    }

}

data class DataBase (
        val users: ConcurrentHashMap<String, User> = ConcurrentHashMap(),
        val maps:  ConcurrentHashMap<String, LocationMapMetainfo> = ConcurrentHashMap()
)


