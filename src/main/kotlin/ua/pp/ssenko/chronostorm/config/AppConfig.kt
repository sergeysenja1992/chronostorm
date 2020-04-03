package ua.pp.ssenko.chronostorm.config

import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.repository.DataBase
import ua.pp.ssenko.chronostorm.utils.objectMapper
import java.io.File

@Configuration
class AppConfig {

    @Bean
    fun db(): ChronostormRepository {
        val chronostorm = File("${System.getProperty("user.home")}/chronostorm.json")
        if (chronostorm.exists() && chronostorm.readText().isNotEmpty()) {
            val value = objectMapper().readValue<DataBase>(chronostorm)
            return ChronostormRepository(value, chronostorm)
        } else {
            chronostorm.createNewFile();
            val dataBase = DataBase()
            return ChronostormRepository(dataBase, chronostorm)
        }
    }

}