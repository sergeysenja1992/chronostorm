package ua.pp.ssenko.chronostorm.repository

import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.io.File
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

    fun getUser(key: String) = db.users.get(key)

    fun save() {
        executor.submit{
            objectMapper().writeValue(dbFile, db)
        }
    }

    fun findByUsername(username: String) = db.users.get(username)

}

data class DataBase (
        val users: ConcurrentHashMap<String, User> = ConcurrentHashMap()
)



