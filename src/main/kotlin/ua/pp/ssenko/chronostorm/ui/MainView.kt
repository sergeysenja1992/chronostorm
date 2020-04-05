package ua.pp.ssenko.chronostorm.ui

import com.github.mvysny.karibudsl.v10.*
import com.vaadin.flow.component.HasComponents
import com.vaadin.flow.component.UI
import com.vaadin.flow.component.dependency.StyleSheet
import com.vaadin.flow.component.grid.Grid
import com.vaadin.flow.component.grid.GridVariant
import com.vaadin.flow.component.html.Label
import com.vaadin.flow.component.icon.VaadinIcon
import com.vaadin.flow.component.orderedlayout.FlexComponent
import com.vaadin.flow.component.orderedlayout.FlexComponent.JustifyContentMode.CENTER
import com.vaadin.flow.component.orderedlayout.HorizontalLayout
import com.vaadin.flow.component.orderedlayout.ThemableLayout
import com.vaadin.flow.component.orderedlayout.VerticalLayout
import com.vaadin.flow.component.textfield.TextField
import com.vaadin.flow.data.value.ValueChangeMode.EAGER
import com.vaadin.flow.router.BeforeEnterEvent
import com.vaadin.flow.router.Route
import com.vaadin.flow.spring.annotation.UIScope
import nc.unc.vaadin.flow.polymer.iron.icons.IronDeviceIcons.BATTERY_50
import org.springframework.stereotype.Component
import ua.pp.ssenko.chronostorm.domain.CombinedCharacteristic
import ua.pp.ssenko.chronostorm.domain.User
import ua.pp.ssenko.chronostorm.repository.ChronostormRepository
import ua.pp.ssenko.chronostorm.ui.DeviceType.DESKTOP
import ua.pp.ssenko.chronostorm.ui.DeviceType.MOBILE
import ua.pp.ssenko.chronostorm.ui.custom.VaadinTelInput
import javax.annotation.PostConstruct
import kotlin.reflect.KMutableProperty0


@Route("", layout = MainLayout::class)
@UIScope
@Component
@StyleSheet("../css/style.css")
class MainView(db: ChronostormRepository): AbstractView(db) {

    var deviceType = MOBILE;

    override fun beforeEnter(p0: BeforeEnterEvent?) {
        super.beforeEnter(p0)
        hideSpacing()

        val current = UI.getCurrent()
        val page = current.page
        page.retrieveExtendedClientDetails{
            onResize(it.bodyClientWidth)
            removeAll()
            content()
        }
        page.addBrowserWindowResizeListener { event ->
            onResize(event.width)
        }
    }

    private fun onResize(width: Int) {
        val prevDeviceType = deviceType
        if (1250 < width) {
            deviceType = DESKTOP
        } else {
            deviceType = MOBILE
        }
        if (prevDeviceType != deviceType) {
            removeAll()
            content()
        }
    }

    @PostConstruct
    fun content() {
        val user = getCurrentUser()
        user ?: return
        verticalLayout {
            className = "margin-main-layout"

            if (deviceType == DESKTOP) {
                hl {
                    val health = healthBlock()
                    val energy = energyBlock()
                    val experience = experienceBlock()
                    setFlexGrow(1.0, health, energy, experience)
                    setWidthFull()
                }
            } else {
                vl {
                    val health = healthBlock()
                    val energy = energyBlock()
                    val experience = experienceBlock()
                }
            }

            if (deviceType == DESKTOP) {
                hl {
                    mainBlock(user)
                    hideSpacing()
                    setSizeFull()
                }
            } else {
                vl {
                    mainBlock(user)
                    hideSpacing()
                    setSizeFull()
                }
            }
        }
    }

    private fun HasComponents.healthBlock() =
        horizontalLayout {
            hideSpacing()
            val icon = icon(VaadinIcon.HEART_O)
            icon.addClassName("main-resource-icon")
            add(icon)
            horizontalLayout {
                className = "resource-layout"
                label("888") {
                    className = "resource-value"
                }
            }
            horizontalLayout {
                className = "resource-layout"
                label("888") {
                    addClassNames("resource-value", "resource-actual-value")
                }
            }
            add(VaadinTelInput().apply {
                label = "Здоровье"
                className = "resource-area"
                getElement().setAttribute("type", "tel")
            })
        }

    private fun VerticalLayout.hl(block: HorizontalLayout.() -> Unit) {
        horizontalLayout {
            block.invoke(this)
        }
    }

    private fun VerticalLayout.vl(block: VerticalLayout.() -> Unit) {
        verticalLayout {
            block.invoke(this)
        }
    }

    private fun HasComponents.energyBlock() =
        horizontalLayout {
            hideSpacing()
            className = "energy-value-wrapper"
            val icon = ironIcon(BATTERY_50.collection(), BATTERY_50.icon())
            icon.addClassNames("main-resource-icon", "energy-value-icon")
            add(icon)
            horizontalLayout {
                className = "resource-layout"
                label("888") {
                    addClassNames("resource-value", "energy-value")
                }
            }
            horizontalLayout {
                className = "resource-layout"
                label("888") {
                    addClassNames("resource-value", "resource-actual-value", "energy-value")
                }
            }
            add(VaadinTelInput().apply {
                label = "Енергия"
                className = "resource-area"
                getElement().setAttribute("type", "tel")
            })
        }

    private fun HasComponents.experienceBlock() =
            horizontalLayout {
                hideSpacing()
                className = "experience-value-wrapper"
                val icon = icon(VaadinIcon.LINE_CHART)
                icon.addClassNames("main-resource-icon", "experience-value-icon")
                add(icon)
                horizontalLayout {
                    className = "resource-layout"
                    label("888") {
                        addClassNames("resource-value", "resource-actual-value", "experience-value")
                    }
                }
                add(VaadinTelInput().apply {
                    label = "Опыт"
                    addClassNames("resource-area", "experience-input")
                    getElement().setAttribute("type", "tel")
                })
            }


    private fun ThemableLayout.hideSpacing() {
        isSpacing = false
        isMargin = false
        isPadding = false
    }

    private fun HasComponents.mainBlock(user: User) {
        verticalLayout {
            personalData(user)
            attributes(user)
            hideSpacing()
        }
        verticalLayout {
            secondaryAttributes(user)
            hideSpacing()
        }
    }

    private fun VerticalLayout.personalData(user: User) {
        verticalLayout {
            horizontalLayout {
                setSizeFull()
                val label  = label("Личные данные")
                setJustifyContentMode(CENTER);
                setVerticalComponentAlignment(FlexComponent.Alignment.CENTER, label)
                addClassNames("table-title")
            }

            val grid = Grid<PersonalField>()
            val data = user.personalCharacteristic
            grid.setItems(listOf(
                    "Ф.И.О." tf user::name,
                    "Пол" tf data::sex,
                    "Возраст" tf data::age,
                    "Класс" tf data::type
            ))

            grid.addColumn { it.label }.setFlexGrow(0)
            grid.addComponentColumn { it.field }.setFlexGrow(1)
            grid.setSelectionMode(Grid.SelectionMode.NONE)
            grid.isHeightByRows = true
            add(grid)
            grid.addThemeVariants(GridVariant.LUMO_COMPACT);
            isSpacing = false
            isMargin = false
            isPadding = false
            addClassName("table-round-border")
        }
    }

    private fun VerticalLayout.attributes(user: User) {
        verticalLayout {
            horizontalLayout {
                setSizeFull()
                val label = label("Атрибуты")
                setJustifyContentMode(CENTER);
                setVerticalComponentAlignment(FlexComponent.Alignment.CENTER, label)
                addClassNames("table-title-attributes")
            }

            val grid = Grid<AttributeField>()
            val attributes = user.attributes
            grid.setItems(listOf(
                    "Cила" af attributes.strength,
                    "Проворство" af attributes.agility,
                    "Ловкость" af attributes.dexterity,
                    "Интелект" af attributes.intelligence,
                    "Выносливать" af attributes.endurance
            ))

            grid.addColumn { it.label }.setFlexGrow(1).setAutoWidth(true)
            //grid.addColumn { " ".repeat(5) }.setFlexGrow(0)
            grid.addComponentColumn { it.value }.setFlexGrow(1)
            grid.addComponentColumn { it.modifier }.setFlexGrow(1)
            grid.addComponentColumn { it.temporaryModifier }.setFlexGrow(1)
            grid.addComponentColumn { it.sum }.setFlexGrow(0).setWidth("50px")
            grid.setSelectionMode(Grid.SelectionMode.NONE)
            grid.isHeightByRows = true
            add(grid)
            grid.addThemeVariants(GridVariant.LUMO_COMPACT);
            isSpacing = false
            isMargin = false
            isPadding = false
            addClassName("table-round-border")
        }
    }

    private fun VerticalLayout.secondaryAttributes(user: User) {
        verticalLayout {
            horizontalLayout {
                setSizeFull()
                val label = label("Вторичные характеристики")
                setJustifyContentMode(CENTER);
                setVerticalComponentAlignment(FlexComponent.Alignment.CENTER, label)
                if (deviceType == MOBILE) {
                    addClassNames("table-title-attributes")
                } else {
                    addClassNames("table-title")
                }
            }

            val grid = Grid<AttributeField>()
            val attributes = user.attributes
            grid.setItems(listOf(
                    "Инициатива" af attributes.initiative,
                    "Точность" af attributes.accuracy,
                    "Уклонение" af attributes.evasion,
                    "Крит. удар" af attributes.criticalHit,
                    "Защита" af attributes.protection,
                    "Маг. Защита" af attributes.magicProtection,
                    "Восприятие" af attributes.perception,
                    "Сила воли" af attributes.willPower,
                    "Здоровье" af attributes.health,
                    "Энергия" af attributes.energy
            ))

            grid.addColumn { it.label }.setFlexGrow(1).setAutoWidth(true)
            //grid.addColumn { " ".repeat(5) }.setFlexGrow(0)
            grid.addComponentColumn { it.value }.setFlexGrow(1)
            grid.addComponentColumn { it.modifier }.setFlexGrow(1)
            grid.addComponentColumn { it.temporaryModifier }.setFlexGrow(1)
            grid.addComponentColumn { it.sum }.setFlexGrow(0).setWidth("50px")
            grid.setSelectionMode(Grid.SelectionMode.NONE)
            grid.isHeightByRows = true
            add(grid)
            grid.addThemeVariants(GridVariant.LUMO_COMPACT);
            isSpacing = false
            isMargin = false
            isPadding = false
            addClassName("table-round-border")
        }
    }


    private infix fun String.tf(nameProperty: KMutableProperty0<String>) = PersonalField(this, nameProperty)
    inner class PersonalField(val label: String, private val nameProperty: KMutableProperty0<String>) {
        val field: TextField
            get() {
                val field = TextField()
                field.value = nameProperty.get()
                field.addValueChangeListener {
                    nameProperty.set(it.value)
                    db.save()
                }
                field.setSizeFull()
                return field
            }
    }


    private infix fun String.af(property: CombinedCharacteristic) = AttributeField(this, property)
    inner class AttributeField(val label: String, private val property: CombinedCharacteristic) {

        val sum: Label = Label()

        val value: TextField = toField(property::value)
        val modifier: TextField = toField(property::modifier)
        val temporaryModifier: TextField = toField(property::temporaryModifier)

        init {
            sum.text = this.property.getSum()
        }

        private fun toField(property: KMutableProperty0<String>): TextField {
            val field = VaadinTelInput()
            field.value = property.get()
            field.addValueChangeListener {
                property.set(it.value)
                sum.text = this.property.getSum()
                db.save()
            }
            field.valueChangeMode = EAGER
            field.setSizeFull()
            return field
        }
    }

}

enum class DeviceType {
    MOBILE, DESKTOP;
}

