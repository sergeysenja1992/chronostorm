package ua.pp.ssenko.chronostorm.utils

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.vaadin.flow.component.orderedlayout.ThemableLayout
import com.vaadin.flow.server.VaadinSession
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.logging.Logger

val loggers = ConcurrentHashMap<Class<Any>, Logger>()
val Any.logger get() = Logger.getLogger(this.javaClass.name)

fun objectMapper() = jacksonObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

inline fun <reified T> VaadinSession.setAttribute(value: T) {
    val type: Class<T> = T::class.java
    setAttribute(type, value)
}

inline fun <reified T> VaadinSession.getAttribute() = getAttribute(T::class.java)

fun ThemableLayout.hideSpacing() {
    isSpacing = false
    isMargin = false
    isPadding = false
}
