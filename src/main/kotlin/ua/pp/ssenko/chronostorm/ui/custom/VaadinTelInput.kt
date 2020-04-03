package ua.pp.ssenko.chronostorm.ui.custom

import com.vaadin.flow.component.Tag
import com.vaadin.flow.component.dependency.JsModule
import com.vaadin.flow.component.textfield.TextField

@Tag("vaadin-tel-input")
@JsModule("./src/vaadin-tel-input.js")
class VaadinTelInput() : TextField() {

}
