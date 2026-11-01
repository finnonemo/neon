import { createCn } from "cn/config"

// cn merges Tailwind classes. Neon's type roles (text-body, text-label1, ...)
// are font sizes; without this list, cn treats them as colors and drops one of
// text-label1 or text-positive. theme/neon.css defines the same roles.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display1", "display2", "display3", "title1", "title2", "title3", "title4", "headline", "body", "label1", "label2", "caption", "legal"] }],
    },
  },
})
