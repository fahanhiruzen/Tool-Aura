// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This provides the callback to generate the code.

import { mapComponentType } from "./component_mapping";
import { generateModifiers, generateLayoutWrapper } from "./layout_mapping";
import { mapPropertiesToParameters } from "./parameter_mapping";

const ignoredComponents = ["scrollbar"];

export async function generateCodeForNode(
  node: SceneNode,
  level: number
): Promise<{ widgetCode: string; customComponents: CodegenResult[] }> {
  let code = "";
  let components: CodegenResult[] = [];

  //console.log(indent(node.type + ": " + node.name, level));

  if (node.type === "INSTANCE") {
    const instanceNode = node as InstanceNode;
    const mainComponent =
      "mainComponent" in instanceNode
        ? await instanceNode.getMainComponentAsync()
        : null;
    if (mainComponent !== null) {
      const componentName =
        mainComponent.parent?.type === "COMPONENT_SET"
          ? mainComponent.parent.name
          : mainComponent.name;

      if (ignoredComponents.includes(componentName)) {
        code += indent("// Ignored component: " + componentName, level);
      } else {
        const widgetName = mapComponentType(
          componentName,
          instanceNode.componentProperties
        );

        if (widgetName !== undefined) {
          var argsArray = mapPropertiesToParameters(
            componentName,
            instanceNode.componentProperties
          );
          // hack for MBBackground
          if (componentName !== "background") {
            argsArray.push(
              "modifier = Modifier" + await generateModifiers(instanceNode)
            );
          }
          const args = argsArray.join(",\n");
          code += generateWidget(widgetName, args, level);
        } else if (componentName === "text" && node.children.length > 0) {
          let { widgetCode, customComponents } = await generateCodeForNode(
            node.children[0],
            level
          );
          code += widgetCode;
          components = components.concat(customComponents);
        } else if (node.children.length > 0) {
          // custom component

          // console.log(node);
          const tempMainComponent = await node.getMainComponentAsync();
          if (tempMainComponent !== null) {
            let { widgetCode, customComponents } = await generateFrameNode(
              tempMainComponent,
              1
            );
            components = components.concat(customComponents);

            let customComponentCode = "@Composable\n";
            customComponentCode += "fun " + componentName + "(";

            code += indent(componentName + "( // custom component", level);
            code += "\n";

            const properties = instanceNode.componentProperties;
            //console.log(properties);

            let index = 0;
            for (const property in properties) {
              if (index == 0) {
                customComponentCode += "\n";
              }
              customComponentCode +=
                "  " +
                stripFigmaRef(property) +
                ": " +
                decodeFigmaType(properties[property].type) +
                ",\n";

              let arg = stripFigmaRef(property) + " = ";
              if (
                decodeFigmaType(properties[property].type) === "String" &&
                typeof properties[property].value === "string"
              ) {
                arg +=
                  '"' +
                  escapeQuotes(properties[property].value.toString()) +
                  '"';
              } else {
                arg += properties[property].value;
              }
              arg += ",";
              console.log(arg);

              code += indent(arg, level + 1);
              code += "\n";
              index++;
            }

            code += indent(")", level);

            customComponentCode += ") {\n";
            customComponentCode += widgetCode + "\n";
            customComponentCode += "}";
            components.push({
              language: "KOTLIN",
              code: customComponentCode,
              title: componentName,
            });
          }
        } else {
          code += indent("// Unsupported component: " + componentName, level);
        }
      }
    }
  } else if (node.type === "TEXT") {
    code += await generateTextNode(node, level);
  } else if (node.type === "FRAME" || node.type === "COMPONENT") {
    let { widgetCode, customComponents } = await generateFrameNode(node, level);
    code += widgetCode;
    components = components.concat(customComponents);
  }
  return { widgetCode: code, customComponents: components };
}

function indent(text: string, level: number): string {
  return text
    .split("\n")
    .map((line) => {
      let indentedLine = "  ".repeat(level);
      if (line.startsWith(".")) {
        indentedLine += "    ";
      }
      indentedLine += line;
      return indentedLine;
    })
    .join("\n");
}

function stripFigmaRef(text: string): string {
  return text.split("#")[0];
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"').replace(/'/g, "\\'");
}

function decodeFigmaType(type: string): string {
  switch (type) {
    case "NUMBER":
      return "Float";
    case "STRING":
      return "String";
    case "BOOLEAN":
      return "Boolean";
    case "COLOR":
      return "Color";
    case "ENUM":
      return "String";
    case "VECTOR":
      return "Vector";
    case "FIGMA_ENUM":
      return "String";
    default:
      return "String";
  }
}

async function generateFrameNode(
  node: SceneNode,
  level: number
): Promise<{ widgetCode: string; customComponents: CodegenResult[] }> {
  let code = "";
  let components: CodegenResult[] = [];

  const layout = await generateLayoutWrapper(node as FrameNode);
  if (layout !== "") {
    code += indent(layout, level);
  }
  for (const child of (node as FrameNode).children) {
    code += "\n";
    let { widgetCode, customComponents } = await generateCodeForNode(
      child,
      level + 1
    );
    code += widgetCode;
    components = components.concat(customComponents);
  }
  if (layout !== "") {
    code += indent("\n}", level);
  }

  return { widgetCode: code, customComponents: components };
}

function generateWidget(
  widgetName: string,
  args: string,
  level: number
): string {
  var code = indent(widgetName + "(", level);
  if (args !== "") {
    code += indent(`\n${args}`, level + 1);
    code += "\n" + indent("", level);
  }
  code += ")";
  return code;
}

async function generateTextNode(node: SceneNode, level: number): Promise<string> {
  const textNode = node as TextNode;
  //console.log(textNode);

  let code = "";

  /*
fun MBText(//Overloaded function to enable easier use of simple texts.
  text: String,
  modifier: Modifier = Modifier,
  elementID: String = "",
  font: TextStyle = MBTheme.typography.sansLight.quaternary,
  textAlign: TextAlign = TextAlign.Start,
  color: Color = MBTheme.colors.text.font,
  dropShadow: Boolean = false,
  isSingleLine: Boolean = true,
  maxLinesCount: Int = Int.MAX_VALUE
)
  */

  let argsArray = [];

  if (textNode.componentPropertyReferences?.characters !== undefined) {
    argsArray.push(
      `text = ${stripFigmaRef(textNode.componentPropertyReferences.characters)}`
    );
  } else {
    argsArray.push(`text = """${textNode.characters}""".trimIndent()`);
  }

  const fontSize = textNode.fontSize;
  let fontSizeString = "";
  switch (fontSize) {
    case 38:
      fontSizeString = "quaternary";
      break;
    case 43:
      fontSizeString = "tertiary";
      break;
    case 54:
      fontSizeString = "secondary";
      break;
    case 57:
      fontSizeString = "primary";
      break;
    default:
      fontSizeString = "quaternary";
      break;
  }

  const fontWeight = textNode.fontWeight;
  let fontWeightString = "";
  switch (fontWeight) {
    case 300:
      fontWeightString = "sansLight";
      break;
    case 600:
      fontWeightString = "sansDemi";
      break;
    default:
      fontWeightString = "sansLight";
      break;
  }

  argsArray.push(
    `font = MBTheme.typography.${fontWeightString}.${fontSizeString}`
  );
  argsArray.push("isSingleLine = false");

  argsArray.push(
    `modifier = Modifier${await generateModifiers(node as InstanceNode)}`
  );

  const args = argsArray.join(",\n");

  code += generateWidget("MBText", args, level);

  return code;
}
