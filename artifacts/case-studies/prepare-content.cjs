const fs = require("fs");
const path = require("path");
const root = "artifacts/case-studies";
const studies = [
  { id: "retention-cliff", legacyId: "01", title: "The goodbye began before month three.", category: "Retention · UX & business strategy", color: "#d7dfbc", source: "Subscription_Retention_Cliff_Case_Study", note: "Illustrative strategy case. The source uses representative, anonymised scenarios and working assumptions for research, figures and targets. These are not verified results from a live engagement.", overview: "Tracing a subscription cliff back to the first weeks of value, habit and trust." },
  { id: "bhopal-clothing", legacyId: "02", title: "A hidden address. An open invitation.", category: "Local commerce · Service design", color: "#e8c6b5", source: "Bhopal_Clothing_Brand_Case_Study", note: "Illustrative strategy case. The brand, participants, budgets and targets are presented as representative working assumptions in the source, not verified client outcomes.", overview: "Helping a home-based clothing brand become easier to find, visit and return to." },
  { id: "aarthik", legacyId: "03", title: "Money rarely arrives on schedule.", category: "Aarthik · Fintech product design", color: "#ccc5de", source: "aarthik case study", app: "https://aarthik-fintech-app.vercel.app/", note: "The supplied study originally used the working name Meridian. The original research and design account is followed by a review of the current Aarthik demo. Its visible navigation and sample-data flows have evolved from the design specification; bank connectivity, money movement and paid usage are not established by the demo.", overview: "A clearer answer to “What can I afford today?” for people with irregular income." },
  { id: "aangan", title: "A room for the decision.", category: "Aangan · Furniture commerce", color: "#dfc9ac", app: "https://aangan-furniture-studio.vercel.app/", note: "Product design and development case study, based on the supplied domain notes and current interactive prototype. Proposed service improvements and validation plans are distinguished from the visible implementation.", overview: "Moving from liking a piece of furniture to knowing where—and how—it belongs." },
  { id: "teamio", title: "What does the company owe you?", category: "Teamio · People & workplace systems", color: "#c9dcca", app: "https://teamio-hrms.vercel.app/", note: "Product design and development case study based on the supplied notes and local demo. Sample data demonstrates the workflows; predictive models, production integrations and retention impact have not been validated.", overview: "Making commitments, explanations and employee trust part of the HR experience." },
];
fs.mkdirSync("public/case-studies", { recursive: true });
fs.mkdirSync("src/data", { recursive: true });
const markdownBlocks = text => text.trim().split(/\r?\n\s*\r?\n/).map(text => ({
  type: "paragraph", style: text.startsWith("## ") ? "Heading1" : text.startsWith("# ") ? "Title" : "",
  text: text.replace(/^#{1,2} /, "").replace(/\r?\n/g, " "),
}));
for (const study of studies) {
  let blocks;
  if (study.source) {
    blocks = JSON.parse(fs.readFileSync(path.join(root, study.source + ".json"), "utf8").replace(/^\uFEFF/, "")).blocks;
    if (study.id === "aarthik") {
      let revised = JSON.stringify(blocks).replace(/MERIDIAN/g, "AARTHIK").replace(/Meridian/g, "Aarthik");
      const edits = JSON.parse(fs.readFileSync(path.join(root, "aarthik-editorial.json"), "utf8"));
      for (const [before, after] of edits) revised = revised.split(before).join(after);
      blocks = JSON.parse(revised);
      const insertion = blocks.findIndex(b => b.text === "Success Metrics");
      if (insertion < 0) throw new Error("Aarthik insertion chapter missing");
      blocks.splice(insertion, 0, ...markdownBlocks(fs.readFileSync(path.join(root, "aarthik-business.md"), "utf8")));
    }
  } else {
    blocks = markdownBlocks(fs.readFileSync(path.join(root, study.id + ".md"), "utf8"));
  }
  const words = blocks.map(b => b.type === "table" ? b.rows.flat().join(" ") : b.text).join(" ").split(/\s+/).length;
  study.minutes = Math.ceil(words / 220);
  study.blocks = blocks.length;
  fs.writeFileSync(`public/case-studies/${study.id}.json`, JSON.stringify({ blocks }, null, 2));
}
fs.writeFileSync("src/data/caseStudies.json", JSON.stringify(studies, null, 2));
console.log(studies.map(s => ({ id: s.id, blocks: s.blocks, minutes: s.minutes })));
