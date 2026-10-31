// Neon's type roles are font sizes; without this, cn() treats text-label1 etc. as colors and drops them.
import { createCn } from "cn/config"

export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: ["title1", "title2", "title3", "headline", "body", "label1", "label2", "caption"] }] } },
})
