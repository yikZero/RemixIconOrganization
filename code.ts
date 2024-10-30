import tagsJson from "./tags.json";

function generateIconDescription(iconName: string, tags: string): string {
  return `<i class="ri-${iconName}"></i>

<script setup lang="ts">
import { Ri${toPascalCase(iconName)} } from "@remixicon/vue";
</script>

<template>
<Ri${toPascalCase(iconName)} size="24px" color="red" className="my-icon" />
</template>

🏷️ ${tags || "No tags available"}`;
}

function updateIconComponent(
  node: ComponentNode | SceneNode,
  iconName: string
) {
  const baseIconName = iconName.replace(/-(?:line|fill)$/, "");
  let tags = findTagsForIcon(baseIconName);
  if (tags) {
    tags = tags.split(",").join(", ");
  }

  const vueDescription = generateIconDescription(iconName, tags);
  const component =
    node.type === "COMPONENT" ? node : figma.createComponentFromNode(node);

  component.description = vueDescription;
  component.documentationLinks = [
    {
      uri: `https://remixicon.com/icon/${iconName}`,
    },
  ];

  return component;
}

async function main() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("Please select at least one node");
    figma.closePlugin();
    return;
  }

  selection.forEach((node) => {
    const validTypes = ["VECTOR", "FRAME", "GROUP"];
    if (node.type === "COMPONENT" || validTypes.indexOf(node.type) !== -1) {
      updateIconComponent(node, node.name);
    }
  });

  figma.notify(`Updated ${selection.length} icons`);
  figma.closePlugin();
}

function findTagsForIcon(iconName: string): string {
  const categories = Object.keys(tagsJson).filter((key) => key !== "_comment");

  for (const category of categories) {
    const iconCategory = tagsJson[category];
    if (typeof iconCategory === "object" && iconCategory[iconName]) {
      return iconCategory[iconName];
    }
  }
  return "";
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

main();
