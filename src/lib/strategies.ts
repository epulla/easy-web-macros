export const StepStrategyKeys = [
  // <button>
  "ButtonClick",
  // <input>
  "InputSendKeys",
  // <a>
  "AClick",
  // // go to a url
  // "Goto",
  // // open a new tab and go to url
  // "Opentabto",
  // // TODO: The rest of the strategies (maybe scroll, etc)
] as const;

export const strategies = [
  {
    key: "ButtonClick",
    selectLabel: "Click on a button", // for select input from CollectionPage Add Step Modal
    cardInnerRawHtml: "Click button {label}", // for StepCard
    required: [
      {
        name: "xpath",
        label: "XPath",
        placeholder: "XPath of an element",
        type: "text",
      },
      {
        name: "label",
        label: "Label",
        placeholder: "Custom label for the button (i.e. 'Submit Form Button')",
        type: "text",
      },
    ],
    func: function (nodeEl: Node, value = ""): HTMLElement {
      const el = nodeEl as HTMLElement;
      el.click();
      return el;
    },
  },
  {
    key: "InputSendKeys",
    selectLabel: "Write text to an input element", // for select input from CollectionPage Add Step Modal
    cardInnerRawHtml: "Write {value} on {label}", // for StepCard
    required: [
      {
        name: "xpath",
        label: "XPath",
        placeholder: "XPath of an element",
        type: "text",
      },
      {
        name: "value",
        label: "Text",
        placeholder: "Text to write",
        type: "text",
      },
      {
        name: "label",
        label: "Label",
        placeholder: "Custom label for the input (i.e. 'Password')",
        type: "text",
      },
      {
        name: "visibility",
        label: "Is confidential?",
        placeholder: "(i.e. password)",
        type: "checkbox",
        required: false,
      },
    ],
    func: function (nodeEl: Node, value: string): HTMLElement {
      const el = nodeEl as HTMLInputElement;
      el.value = value!;
      el.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      return el;
    },
  },
  {
    key: "AClick",
    selectLabel: "Click on a link", // for select input from CollectionPage Add Step Modal
    cardInnerRawHtml: "Click link button {label}", // for StepCard
    required: [
      {
        name: "xpath",
        label: "XPath",
        placeholder: "XPath of an element",
        type: "text",
      },
      {
        name: "label",
        label: "Label",
        placeholder: "Custom label for the link (i.e. 'Sign Up')",
        type: "text",
      },
    ],
    func: function (nodeEl: Node, value?: string): HTMLElement {
      const el = nodeEl as HTMLElement;
      el.click();
      return el;
    },
  },
  // {
  //   key: "Goto",
  //   selectLabel: "Go to a url", // for select input from CollectionPage Add Step Modal
  //   cardInnerRawHtml: "Go to {value}", // for StepCard
  //   required: [
  //     {
  //       name: "value",
  //       label: "Url",
  //       placeholder: "Url to go to",
  //       type: "text",
  //     },
  //   ],
  //   func: function (nodeEl: Node, value: string): HTMLElement {
  //     // Option 1
  //     if (window && window.location.href !== value) {
  //       window.location.href = value;
  //     }
  //     return null as any;
  //   },
  // },
  // {
  //   key: "Opentabto",
  //   selectLabel: "Open a new tab and go to url", // for select input from CollectionPage Add Step Modal
  //   cardInnerRawHtml: "Open tab to {value}", // for StepCard
  //   required: [
  //     {
  //       name: "value",
  //       label: "Url",
  //       placeholder: "Url to go to",
  //       type: "text",
  //     },
  //   ],
  //   func: function (nodeEl: Node, value: string): HTMLElement {
  //     const a = document.createElement("a");
  //     a.href = value;
  //     a.target = "_blank";
  //     console.log(value)
  //     console.log(a)
  //     a.click();
  //     // window.open(value, "_blank");
  //     return null as any;
  //   },
  // },
];

export const getStrategy = (key: string) => {
  const strategy = strategies.find((s) => s.key === key);
  if (!strategy) {
    throw new Error(`Invalid strategy: ${key}`);
  }
  return strategy;
};
