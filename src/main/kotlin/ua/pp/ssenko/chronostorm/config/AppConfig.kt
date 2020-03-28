package ua.pp.ssenko.chronostorm.config

import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import ua.pp.ssenko.chronostorm.repository.DataBase
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.io.File

@Configuration
class AppConfig {

    @Bean
    fun dataBase(): DataBase {
        val chronostorm = File("${System.getProperty("user.home")}/chronostorm.json")
        val save: (dataBase: DataBase) -> Unit = {
            objectMapper().writeValue(chronostorm, it)
        }
        if (chronostorm.exists() && chronostorm.readText().isNotEmpty()) {
            val value = objectMapper().readValue<DataBase>(chronostorm)
            value.save = save
            return value
        } else {
            chronostorm.createNewFile();
            val dataBase = DataBase()
            dataBase.save = save
            return dataBase
        }
    }

}