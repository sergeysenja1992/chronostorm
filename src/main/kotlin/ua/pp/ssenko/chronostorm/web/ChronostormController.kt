package ua.pp.ssenko.chronostorm.web

import org.springframework.core.io.InputStreamResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import ua.pp.ssenko.chronostorm.repository.MapsService
import java.io.ByteArrayInputStream
import javax.servlet.http.HttpServletRequest


@RestController
class ChronostormController(val maps: MapsService) {

    @GetMapping("google8d0efe798c0987ec.html")
    fun verification() = "google-site-verification: google8d0efe798c0987ec.html"

    @GetMapping("map/files/**")
    fun loadFile(request: HttpServletRequest): ResponseEntity<InputStreamResource> {

        val relativePath = request.requestURI.substringAfter("/map/files/")
        val content = maps.getFile(relativePath)
        val resource = InputStreamResource(ByteArrayInputStream(content))
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                .contentLength(content.size.toLong())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource)
    }

}