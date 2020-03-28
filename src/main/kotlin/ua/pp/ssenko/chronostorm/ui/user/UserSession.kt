package ua.pp.ssenko.chronostorm.ui.user

import ua.pp.ssenko.chronostorm.ui.custom.UserResponse

data class UserSession (
        val username: String,
        val isMaster: Boolean = false
) {

    var name: String = ""

    constructor(userResponse: UserResponse) : this(username = userResponse.email) {
        name = userResponse.name
    }
}
