
// Define the lookup tables for each component
const toggleMapping = {
  selected: (propValue: any) => {
    return "isSelected = " + booleanDecoder(propValue.value);
  },
};

const imageMapping: FullMapping = {
  map: (properties: Record<string, any>) => {
    let args: string[] = [];

    args.push("source = /* TODO */ R.drawable.car");

    switch (properties['shape'].value) {
      case "rec":
        args.push( "shape = ImageStyle.Shape.Rectangle"); break;
      case "round":
        args.push( "shape = ImageStyle.Shape.Circle"); break;
      case "radius":
        args.push( "shape = ImageStyle.Shape.Rounded(10.dp)"); break;
    }

  return args;
  }
};

const badgeMapping: FullMapping = {
  map: (properties: Record<string, any>) => {
    let args: string[] = [];

    const variant = getVariant(properties);
    if (variant === "plain") {
      args.push("content = MBBadgeContent.Plain")
    } else if (variant === "count") {
      let textBadge = "content = MBBadgeContent.Text(\"";
      textBadge += getPropertyWithoutRef(properties, "text_source");
      textBadge += "\")";
      args.push(textBadge);
    } else if (variant === "icon") {
      let iconBadge = "content = MBBadgeContent.Icon(";
      // TODO: resolve icon resources with help of icon_lib
      iconBadge += "/* put icon source here */";
      //iconBadge += properties['icon_source'].value;
      iconBadge += ")";
      args.push(iconBadge);
    }

    return args;
  }
};

const button: FullMapping = {
  map: (properties: Record<string, any>) => {
    let args: string[] = [];
    
    //console.log(properties);

    const variant = getVariant(properties);
    if (variant === "primary") {
      if (getPropertyWithoutRef(properties, "icon")) {
        args.push("icon = MBIcon.obj(/* TODO */ com.mercedesbenz.widgets.mbui2024.R.drawable.gl_000x80_placeholder)");
      } // TODO: non icon variant
    }

    if (getPropertyWithoutRef(properties, "text")) {
      args.push("text = \"" + getPropertyWithoutRef(properties, "text_source") + "\"");
    } else {
      args.push('text = ""');
    }

    args.push("onClick = { /* TODO */ }");

    // TODO: rest of the properties

    return args;
  }
}

const centeredHeader: FullMapping = {
  map : (properties: Record<string, any>) => {
    let args: string[] = [];

    const variant = getVariant(properties);
    if (variant === "text") {
      args.push('text = "' + getPropertyWithoutRef(properties, "text_source") + '"');
      args.push("hasDivider = " + booleanDecoder(getPropertyWithoutRef(properties, "divider")));
      if (getPropertyWithoutRef(properties, "close")) {
        args.push("primaryInteraction = MBCenteredHeaderPrimary.Close()");
      } else {
        args.push("primaryInteraction = null");
      }
      if (getPropertyWithoutRef(properties, "additional_interaction")) {
        args.push("additionalInteraction = MBCenteredHeaderAdditional.Icon(/* TODO*/)");
      } else {
        args.push("additionalInteraction = null");
      }
    } else {
      // TOOD: implement other variants
      args.push("/* unsupported */");
    }

    return args;
  }
}

const componentMappings: ComponentMappings = {
  // ATOMS
  'toggle': toggleMapping,
  'badge': badgeMapping,
  'image': imageMapping,

  // MOLECULES
  'button': button,
  'centered_header': centeredHeader,
  // Add more mappings for other components
};

interface Mapping { }

interface FullMapping extends Mapping {
  map: (properties: Record<string, any>) => string[];
}

function isFullMapping(mapping: Mapping): mapping is FullMapping {
  return (mapping as FullMapping).map !== undefined;
}

function getVariant(properties: Record<string, any>) {
  //console.log(properties);
  return properties['variant'].value;
}

function getPropertyWithoutRef(properties: Record<string, any>, property: string) {
  const filtered = Object.keys(properties).filter((key: string) => {
    return (key.startsWith(property + "#"))
  });
  if (filtered.length > 0) {
    return properties[filtered[0]].value;
  }
  return "";
}

function booleanDecoder(value: any) {
  if (value == "true" || value === true) {
    return "true";
  }
  return "false";
}

interface PiecewiseMapping extends Mapping {
  [key: string]: (propValue: any) => string;
}

interface ComponentMappings {
  [key: string]: Mapping;
}

// Define a function to map properties to parameters based on the component
export function mapPropertiesToParameters(component: string, properties: Record<string, any>): string[] {
  let mapping: Record<string, (value: any) => void>;

  let selectedMapping = componentMappings[component];
  if (!selectedMapping) {
    console.log(`Unsupported component: ${component}`);
    return [];
  }

  if (isFullMapping(selectedMapping)) {
    return (selectedMapping as FullMapping).map(properties);
  } else {
    let args: string[] = [];
    // Map each property to its corresponding parameter
    for (const property in properties) {
      const piecewiseMapping = selectedMapping as PiecewiseMapping;
      if (property in piecewiseMapping) {
        const value = properties[property];
        const parameterMapping = piecewiseMapping[property];
        args.push(parameterMapping(value));
      }
    }
    return args
  }
}
