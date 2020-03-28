package ua.pp.ssenko.chronostorm.repository

import com.fasterxml.jackson.annotation.JsonIgnore

data class DataBase (
        private val users: MutableMap<String, User> = HashMap()
) {
    @JsonIgnore
    var save: (dataBase: DataBase) -> Unit = {}

    fun addUser(user: User) {
        users.put(user.key, user)
        save()
    }

    fun addUserIfAbsent(user: User) {
        users.putIfAbsent(user.key, user)
        save()
    }

    fun getUser(key: String) = users.get(key)

    fun save() {
        save.invoke(this)
    }
}

interface StoredEntity {
    val key: String
}

data class User(
        val username: String,
        var name: String
): StoredEntity {
    override val key: String get() = username

}
