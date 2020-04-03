package ua.pp.ssenko.chronostorm.domain

import org.springframework.expression.spel.standard.SpelExpressionParser
import java.lang.Exception

interface StoredEntity {
    val key: String
}

data class User(
        val username: String,
        var name: String
): StoredEntity {

    val personalCharacteristic: PersonalCharacteristic = PersonalCharacteristic()
    val attributes: Attributes = Attributes()

    override val key: String get() = username
}

data class PersonalCharacteristic(
        var sex: String = "",
        var age: String = "",
        var type: String = ""
)

data class Attributes(
        var strength: CombinedCharacteristic = CombinedCharacteristic(),
        var agility: CombinedCharacteristic = CombinedCharacteristic(),
        var dexterity: CombinedCharacteristic = CombinedCharacteristic(),
        var intelligence: CombinedCharacteristic = CombinedCharacteristic(),
        var endurance: CombinedCharacteristic = CombinedCharacteristic(),

        var initiative: CombinedCharacteristic = CombinedCharacteristic(),
        var accuracy: CombinedCharacteristic = CombinedCharacteristic(),
        var evasion: CombinedCharacteristic = CombinedCharacteristic(),
        var criticalHit: CombinedCharacteristic = CombinedCharacteristic(),
        var protection: CombinedCharacteristic = CombinedCharacteristic(),
        var magicProtection: CombinedCharacteristic = CombinedCharacteristic(),
        var perception: CombinedCharacteristic = CombinedCharacteristic(),
        var willPower: CombinedCharacteristic = CombinedCharacteristic(),
        var health: CombinedCharacteristic = CombinedCharacteristic(),
        var energy: CombinedCharacteristic = CombinedCharacteristic()
)

data class CombinedCharacteristic(
        var value: String = "",
        var modifier: String = "",
        var temporaryModifier: String = ""
) {
    fun getSum(): String {
        try {
            val value = toNumber(value) + toNumber(modifier) + toNumber(temporaryModifier)
            return value.toString()
        } catch (e: Exception) {
            return "error"
        }
    }

    private fun toNumber(number: String): Int {
        val normalizedNumber = number.replace(",", ".").trim().trim('+').trimEnd('-').trim('/').trim('*')
        if (number.isBlank()) {
            return 0;
        }
        return SpelExpressionParser().parseExpression(normalizedNumber).getValue(Int::class.java)!!
    }
}
