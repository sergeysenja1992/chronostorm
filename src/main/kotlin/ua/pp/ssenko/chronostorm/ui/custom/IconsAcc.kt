package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.Tag
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.dependency.NpmPackage
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.icon.VaadinIcon
import com.vaadin.flow.component.polymertemplate.PolymerTemplate
import com.vaadin.flow.templatemodel.TemplateModel
import nc.unc.vaadin.flow.polymer.iron.icons.*
import java.util.*
import java.util.concurrent.Executor
import java.util.concurrent.Executors
import kotlin.collections.ArrayList
import kotlin.concurrent.thread

@Tag("ch-icons-acc")
@JsModule("./src/ch-icons-acc.js")
@NpmPackage.Container(
    NpmPackage("@polymer/paper-card", version = "3.0.1"),
    NpmPackage("@polymer/iron-collapse", version = "3.0.1")
)
@StyleSheet("../css/maps.css")
class IconsAcc: PolymerTemplate<IconsModel>() {

    fun setSearch(searchInput: String) {
    }
}

