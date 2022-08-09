import {
  DarkForestButton,
  DarkForestShortcutButton,
  ShortcutPressedEvent,
} from "@dfdao/ui";
import { createComponent } from "@lit-labs/react";
import React from "react";

customElements.define(DarkForestButton.tagName, DarkForestButton);
customElements.define(
  DarkForestShortcutButton.tagName,
  DarkForestShortcutButton
);

export { DarkForestButton, DarkForestShortcutButton, ShortcutPressedEvent };

// This wraps the customElement in a React wrapper to make it behave exactly like a React component
export const Btn = createComponent<
  DarkForestButton,
  // @ts-ignore
  {
    onClick: (evt: Event & React.MouseEvent<DarkForestButton>) => void;
  }
>(React, DarkForestButton.tagName, DarkForestButton, {
  onClick: "click",
});

export const ShortcutBtn = createComponent<
  DarkForestShortcutButton,
  // @ts-ignore
  {
    onClick: (evt: Event & React.MouseEvent<DarkForestShortcutButton>) => void;
    onShortcutPressed: (evt: ShortcutPressedEvent) => void;
  }
>(React, DarkForestShortcutButton.tagName, DarkForestShortcutButton, {
  onClick: "click",
  onShortcutPressed: "shortcut-pressed",
});
