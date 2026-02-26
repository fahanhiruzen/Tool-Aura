import { mapPropertiesToParameters } from './parameter_mapping';

interface ComponentMapping {
    [key: string]: string;
}

interface ComponentDerivates {
    [key: string]: string[];
}

const extensions: string[] = [
    "vertical",
    "horizontal",
    "circular",
    "floating",
    "basic",
    "graphical",
    "entry",
    "popup",
    "unopened",
    "expanded",
    "dictate",
    "ghost",
    "secret",
    "zerolayer",
    "closed",
    "retractable",
    "unopened",
    "expanded"
]

const componentDerivates: ComponentDerivates = {
    badge: ["badge_basic_entry", "badge_filterbar"],
    container: ["container_zerolayer"],
    progressbar: ["progressbar_horizontal", "progressbar_vertical"],
    intensity_led: ["intensity_led_vertical", "intensity_led_horizontal", "intensity_led_floating", "intensity_led_circular"],
    toggle_led: ["toggle_led_horizontal", "toggle_led_floating", "toggle_led_circular"],
    basic_slider: ["vertical_basic_slider"],
    graphical_slider: ["vertical_graphical_slider"],
    selection_entry: ["vertical_selection_entry"],
    slider_entry: ["vertical_slider_entry"],
    dropdown: ["dropdown_entry", "dropdown_entry_popup"],
    switch: ["switch_retractable_unopened", "switch_retractable_expanded"],
    text_field: ["text_field_dictate", "text_field_ghost", "text_field_secret"],
    expandable_container: ["expandable_container_closed"],
};

const componentMapping: ComponentMapping = {
    'activity_indicator': 'ActivityIndicator',
    'app_layout': 'AppLayout',
    'backdrop': 'Backdrop',
    'background': 'Background',
    'badge_basic_entry': 'Badge',
    'badge_filterbar': 'Badge',
    'badge': 'Badge',
    'basic_entry': 'BasicEntry',
    'basic_slider': 'BasicSlider',
    'basic_tile': 'BasicTile',
    'button_footer': 'ButtonFooter',
    'button': 'Button',
    'centered_header': 'CenteredHeader',
    'checkbox': 'Checkbox',
    'contact_image': 'ContactImage',
    'container_zerolayer': 'Container',
    'container': 'Container',
    'content_tile': 'ContentTile',
    'cursor': 'Cursor',
    'divider': 'Divider',
    'dropdown_entry_popup': 'DropdownEntry',
    'dropdown_entry': 'DropdownEntry',
    'dropdown': 'Dropdown',
    'entry_spacer': 'EntrySpacer',
    'expandable_container_closed': 'ExpandableContainer',
    'expandable_container': 'ExpandableContainer',
    'filterbar': 'Filterbar',
    'grahical_slider': 'GraphicalSlider',
    'handle': 'Handle',
    'horizontal_list': 'HorizontalList',
    'horizontal_tabs': 'HorizontalTabs',
    'icon': 'Icon', // does not work the way it is currently implemented in figma
    'image': 'Image',
    'image_tile': 'ImageTile',
    'info_label': 'InfoLabel',
    'intensity_led_circular': 'IntensityLed',
    'intensity_led_floating': 'IntensityLed',
    'intensity_led_horizontal': 'IntensityLed',
    'intensity_led_vertical': 'IntensityLed',
    'intensity_led': 'IntensityLed',
    'keyboard': 'Keyboard',
    'left_aligned_header': 'LeftAlignedHeader',
    'overlay_container': 'OverlayContainer',
    'page_indicator': 'PageIndicator',
    'paging_view': 'PagingView',
    'picker': 'Picker',
    'popup_container': 'PopupContainer',
    'progressbar_circular': 'CircularProgressbar',
    'progressbar_horizontal': 'ProgressBar',
    'progressbar_vertical': 'ProgressBar',
    'radiobutton': 'RadioButton',
    'reduced_button': 'Button',
    'selection_entry': 'SelectionEntry',
    'slide_to_confirm': 'SlideToConfirm',
    'slider_2d': 'Slider2D',
    'slider_entry': 'SliderEntry',
    'subheader': 'Subheader',
    'switch_entry': 'SwitchEntry',
    'switch_retractable_expanded': 'Switch',
    'switch_retractable_unopened': 'Switch',
    'switch': 'Switch',
    'tabs_footer': 'TabsFooter',
    'text_entry': 'TextEntry',
    'text_field_dictate': 'TextField',
    'text_field_ghost': 'TextField',
    'text_field_secret': 'TextField',
    'text_field': 'TextField',
    'tile': 'Tile',
    'toast': 'Toast',
    'toggle_led_circular': 'ToggleLed',
    'toggle_led_floating': 'ToggleLed',
    'toggle_led_horizontal': 'ToggleLed',
    'toggle': 'Toggle',
    'tooltip_container': 'TooltipContainer',
    'vertical_basic_slider': 'BasicSlider',
    'vertical_graphical_slider': 'GraphicalSlider',
    'vertical_list': 'VerticalList',
    'vertical_selection_entry': 'SelectionEntry',
    'vertical_tabs': 'VerticalTabs',
    'video': 'Video',
    'wizard': 'Wizard',

    // Add more mappings for other component types
};

export function mapComponentType(componentName: string, properties: Record<string, any>): any {
    const component = componentMapping[componentName];
    if (component === undefined) {
        return undefined;
    } else {
        return `${'MB' + component}`
    }
}
