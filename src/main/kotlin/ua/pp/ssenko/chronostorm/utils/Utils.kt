package ua.pp.ssenko.chronostorm.utils

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import java.util.concurrent.ConcurrentHashMap
import java.util.logging.Logger

val loggers = ConcurrentHashMap<Class<Any>, Logger>()
val Any.logger get() = Logger.getLogger(this.javaClass.name)

fun objectMapper() = jacksonObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)